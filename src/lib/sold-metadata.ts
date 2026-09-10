/** Stripe metadata values are capped at 500 characters. */
const META_VALUE_LIMIT = 490;

function chunkKey(index: number): string {
  return index === 0 ? "productIds" : `productIds${index}`;
}

/** Pack catalog product ids into Stripe Session / PaymentIntent metadata. */
export function packProductIds(
  ids: string[]
): Record<string, string> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  const chunks: Record<string, string> = {};
  let index = 0;
  let current = "";

  for (const id of unique) {
    const next = current ? `${current},${id}` : id;
    if (next.length > META_VALUE_LIMIT && current) {
      chunks[chunkKey(index)] = current;
      index += 1;
      current = id;
    } else {
      current = next;
    }
  }

  if (current) chunks[chunkKey(index)] = current;
  return chunks;
}

export function unpackProductIds(
  metadata: Record<string, string> | null | undefined
): string[] {
  if (!metadata) return [];
  const keys = Object.keys(metadata)
    .filter((key) => key === "productIds" || /^productIds\d+$/.test(key))
    .sort((a, b) => {
      const na = a === "productIds" ? 0 : Number(a.replace("productIds", "")) || 0;
      const nb = b === "productIds" ? 0 : Number(b.replace("productIds", "")) || 0;
      return na - nb;
    });

  const ids: string[] = [];
  for (const key of keys) {
    const value = metadata[key];
    if (!value) continue;
    for (const part of value.split(",")) {
      const id = part.trim();
      if (id) ids.push(id);
    }
  }
  return [...new Set(ids)];
}
