import { promises as fs } from "fs";
import path from "path";
import type { SoldRecord, SoldSource } from "./sold";

const IDS_KEY = "jenger:sold:ids";
const SLUGS_KEY = "jenger:sold:slugs";
const META_PREFIX = "jenger:sold:meta:";
const SESSION_PREFIX = "jenger:sold:session:";

export type SoldBackend = "redis" | "file" | "none";

type RedisCreds = { url: string; token: string };

function redisCredentials(): RedisCreds | null {
  const url = (
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    ""
  ).trim();
  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    ""
  ).trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

function localRegistryPath(): string {
  const override = process.env.SOLD_REGISTRY_PATH?.trim();
  if (override) return path.resolve(override);
  return path.join(process.cwd(), "data", "sold-registry.local.json");
}

/** Redis on Vercel; local JSON file in dev; none if production has no store. */
export function soldStoreBackend(): SoldBackend {
  if (redisCredentials()) return "redis";
  if (process.env.VERCEL === "1") return "none";
  return "file";
}

export function soldStoreConfigured(): boolean {
  return soldStoreBackend() !== "none";
}

type FileRegistry = {
  ids: Record<string, SoldRecord>;
};

async function readFileRegistry(): Promise<FileRegistry> {
  try {
    const raw = await fs.readFile(localRegistryPath(), "utf8");
    const parsed = JSON.parse(raw) as FileRegistry;
    if (parsed && typeof parsed === "object" && parsed.ids) return parsed;
  } catch {
    // Missing or unreadable — start empty.
  }
  return { ids: {} };
}

async function writeFileRegistry(registry: FileRegistry): Promise<void> {
  const filePath = localRegistryPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(registry, null, 2), "utf8");
}

async function redisCommand<T>(
  creds: RedisCreds,
  args: Array<string | number>
): Promise<T> {
  const response = await fetch(creds.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as {
    result?: T;
    error?: string;
  } | null;
  if (!response.ok || payload?.error) {
    throw new Error(payload?.error || `Redis command failed (${response.status})`);
  }
  return payload?.result as T;
}

async function redisPipeline(
  creds: RedisCreds,
  commands: Array<Array<string | number>>
): Promise<unknown[]> {
  const response = await fetch(`${creds.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as
    | Array<{ result?: unknown; error?: string }>
    | { error?: string }
    | null;
  if (!response.ok) {
    const message =
      payload && !Array.isArray(payload) ? payload.error : undefined;
    throw new Error(message || `Redis pipeline failed (${response.status})`);
  }
  if (!Array.isArray(payload)) {
    throw new Error("Redis pipeline returned an unexpected payload.");
  }
  return payload.map((row) => row.result);
}

function parseRecord(value: unknown, fallbackId: string): SoldRecord | null {
  if (!value) return null;
  try {
    const parsed =
      typeof value === "string" ? (JSON.parse(value) as SoldRecord) : null;
    if (!parsed || typeof parsed.productId !== "string") {
      return {
        productId: fallbackId,
        soldAt: new Date().toISOString(),
        source: "admin",
      };
    }
    return parsed;
  } catch {
    return {
      productId: fallbackId,
      soldAt: new Date().toISOString(),
      source: "admin",
    };
  }
}

export async function listSoldIds(): Promise<string[]> {
  const backend = soldStoreBackend();
  if (backend === "none") return [];

  if (backend === "file") {
    const registry = await readFileRegistry();
    return Object.keys(registry.ids);
  }

  const creds = redisCredentials();
  if (!creds) return [];
  const members = await redisCommand<string[]>(creds, ["SMEMBERS", IDS_KEY]);
  return Array.isArray(members) ? members.filter(Boolean) : [];
}

export async function listSoldRecords(): Promise<SoldRecord[]> {
  const ids = await listSoldIds();
  if (ids.length === 0) return [];

  const backend = soldStoreBackend();
  if (backend === "file") {
    const registry = await readFileRegistry();
    return ids.map((id) => registry.ids[id]).filter(Boolean);
  }

  const creds = redisCredentials();
  if (!creds) return [];
  const results = await redisPipeline(
    creds,
    ids.map((id) => ["GET", `${META_PREFIX}${id}`])
  );
  return ids.map((id, index) => {
    return (
      parseRecord(results[index], id) ?? {
        productId: id,
        soldAt: new Date().toISOString(),
        source: "admin" as SoldSource,
      }
    );
  });
}

export async function isSoldId(
  productId: string,
  slug?: string
): Promise<boolean> {
  const id = productId.trim();
  if (!id) return false;

  const backend = soldStoreBackend();
  if (backend === "none") return false;

  if (backend === "file") {
    const registry = await readFileRegistry();
    if (registry.ids[id]) return true;
    if (slug) {
      return Object.values(registry.ids).some((record) => record.slug === slug);
    }
    return false;
  }

  const creds = redisCredentials();
  if (!creds) return false;
  const inSet = await redisCommand<number>(creds, ["SISMEMBER", IDS_KEY, id]);
  if (Number(inSet) === 1) return true;
  if (!slug) return false;
  const mapped = await redisCommand<string | null>(creds, [
    "HGET",
    SLUGS_KEY,
    slug,
  ]);
  return Boolean(mapped);
}

export async function markSold(
  records: Array<Omit<SoldRecord, "soldAt"> & { soldAt?: string }>
): Promise<{ marked: string[]; already: string[] }> {
  const marked: string[] = [];
  const already: string[] = [];
  const soldAt = new Date().toISOString();
  const prepared: SoldRecord[] = records
    .map((record) => ({
      productId: record.productId.trim(),
      slug: record.slug?.trim() || undefined,
      soldAt: record.soldAt ?? soldAt,
      source: record.source,
      sessionId: record.sessionId,
    }))
    .filter((record) => record.productId);

  if (prepared.length === 0) return { marked, already };

  const backend = soldStoreBackend();
  if (backend === "none") {
    throw new Error(
      "Sold registry is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL / KV_REST_API_TOKEN)."
    );
  }

  if (backend === "file") {
    const registry = await readFileRegistry();
    for (const record of prepared) {
      if (registry.ids[record.productId]) {
        already.push(record.productId);
        continue;
      }
      registry.ids[record.productId] = record;
      marked.push(record.productId);
    }
    await writeFileRegistry(registry);
    return { marked, already };
  }

  const creds = redisCredentials();
  if (!creds) {
    throw new Error("Sold registry Redis credentials are missing.");
  }

  const added = await redisCommand<number>(creds, [
    "SADD",
    IDS_KEY,
    ...prepared.map((record) => record.productId),
  ]);

  const commands: Array<Array<string | number>> = [];
  for (const record of prepared) {
    commands.push(["SET", `${META_PREFIX}${record.productId}`, JSON.stringify(record)]);
    if (record.slug) {
      commands.push(["HSET", SLUGS_KEY, record.slug, record.productId]);
    }
    if (record.sessionId) {
      commands.push(["SADD", `${SESSION_PREFIX}${record.sessionId}`, record.productId]);
    }
  }
  await redisPipeline(creds, commands);

  // SADD returns how many new members were added. Treat the rest as already sold.
  const newCount = Number(added) || 0;
  prepared.forEach((record, index) => {
    if (index < newCount) marked.push(record.productId);
    else already.push(record.productId);
  });
  // SADD does not tell us *which* ids were new when batching. Re-check is unnecessary
  // for idempotency of the write; callers only need unique ids.
  if (newCount !== prepared.length) {
    const unique = [...new Set(prepared.map((record) => record.productId))];
    return { marked: unique, already: [] };
  }
  return { marked: [...new Set(marked)], already: [...new Set(already)] };
}

export async function unmarkSold(productId: string): Promise<boolean> {
  const id = productId.trim();
  if (!id) return false;

  const backend = soldStoreBackend();
  if (backend === "none") {
    throw new Error(
      "Sold registry is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
    );
  }

  if (backend === "file") {
    const registry = await readFileRegistry();
    if (!registry.ids[id]) return false;
    delete registry.ids[id];
    await writeFileRegistry(registry);
    return true;
  }

  const creds = redisCredentials();
  if (!creds) {
    throw new Error("Sold registry Redis credentials are missing.");
  }

  const existing = await redisCommand<string | null>(creds, [
    "GET",
    `${META_PREFIX}${id}`,
  ]);
  const record = parseRecord(existing, id);
  const removed = await redisCommand<number>(creds, ["SREM", IDS_KEY, id]);
  const cleanup: Array<Array<string | number>> = [["DEL", `${META_PREFIX}${id}`]];
  if (record?.slug) {
    cleanup.push(["HDEL", SLUGS_KEY, record.slug]);
  }
  await redisPipeline(creds, cleanup);
  return Number(removed) === 1 || Boolean(existing);
}

export async function sessionAlreadyRecorded(sessionId: string): Promise<boolean> {
  const id = sessionId.trim();
  if (!id) return false;
  const backend = soldStoreBackend();
  if (backend !== "redis") return false;
  const creds = redisCredentials();
  if (!creds) return false;
  const size = await redisCommand<number>(creds, [
    "SCARD",
    `${SESSION_PREFIX}${id}`,
  ]);
  return Number(size) > 0;
}
