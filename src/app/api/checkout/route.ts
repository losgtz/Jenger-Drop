import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Frictionless MVP: append each order to a local JSON queue on disk.
// Jarvis (the AI assistant) monitors this file and handles notifications.
const QUEUE_PATH = path.join(process.cwd(), "order_queue.json");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      name,
      location,
      phone,
      instructions,
      subtotal,
      deliveryFee,
      total,
      paymentIntentId,
      paymentStatus,
    } = body ?? {};

    const order = {
      id: `order_${Date.now()}`,
      receivedAt: new Date().toISOString(),
      name: name ?? "",
      location: location ?? "",
      phone: phone ?? "",
      instructions: instructions ?? "",
      subtotal: subtotal ?? 0,
      deliveryFee: deliveryFee ?? 0,
      total: total ?? subtotal ?? 0,
      paymentIntentId: paymentIntentId ?? "",
      paymentStatus: paymentStatus ?? "",
      items: Array.isArray(items) ? items : [],
    };

    let queue: unknown[] = [];
    try {
      const existing = await fs.readFile(QUEUE_PATH, "utf8");
      const parsed = JSON.parse(existing);
      if (Array.isArray(parsed)) queue = parsed;
    } catch {
      // No queue file yet (or unreadable) — start a fresh one.
    }

    queue.push(order);
    await fs.writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2), "utf8");

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Checkout processing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process order" },
      { status: 500 }
    );
  }
}
