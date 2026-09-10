import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

const dir = await mkdtemp(path.join(tmpdir(), "jenger-sold-"));
process.env.SOLD_REGISTRY_PATH = path.join(dir, "sold.json");
delete process.env.VERCEL;
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
delete process.env.KV_REST_API_URL;
delete process.env.KV_REST_API_TOKEN;

const store = await import("./sold-store.ts");

describe("sold-store file backend", () => {
  before(async () => {
    assert.equal(store.soldStoreBackend(), "file");
  });

  after(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("marks, lists, and unmarks idempotently", async () => {
    const first = await store.markSold([
      { productId: "posh_001_test", slug: "demo-piece-posh_001_test", source: "admin" },
    ]);
    assert.deepEqual(first.marked, ["posh_001_test"]);

    const second = await store.markSold([
      { productId: "posh_001_test", slug: "demo-piece-posh_001_test", source: "stripe" },
    ]);
    assert.deepEqual(second.already, ["posh_001_test"]);
    assert.deepEqual(second.marked, []);

    assert.equal(await store.isSoldId("posh_001_test"), true);
    assert.equal(await store.isSoldId("posh_001_test", "demo-piece-posh_001_test"), true);
    assert.deepEqual(await store.listSoldIds(), ["posh_001_test"]);

    assert.equal(await store.unmarkSold("posh_001_test"), true);
    assert.equal(await store.isSoldId("posh_001_test"), false);
    assert.deepEqual(await store.listSoldIds(), []);
  });
});
