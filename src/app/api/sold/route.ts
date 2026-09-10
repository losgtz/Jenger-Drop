import { NextResponse } from "next/server";
import { listSoldIds, soldStoreBackend } from "@/lib/sold-store";

export const dynamic = "force-dynamic";

/** Public sold-id list for catalog / bag overlays. Do not cache across instances. */
export async function GET() {
  try {
    const ids = await listSoldIds();
    return NextResponse.json(
      {
        ids,
        backend: soldStoreBackend(),
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("sold list error:", error);
    return NextResponse.json(
      { ids: [], backend: soldStoreBackend(), error: "Could not read sold registry." },
      { status: 500, headers: { "Cache-Control": "private, no-store" } }
    );
  }
}
