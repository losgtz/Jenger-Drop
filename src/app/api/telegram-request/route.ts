import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Backup log so no request is ever lost, even if Telegram is unreachable.
const QUEUE_PATH = path.join(process.cwd(), "request_queue.json");

async function appendToQueue(entry: unknown) {
  let queue: unknown[] = [];
  try {
    const existing = await fs.readFile(QUEUE_PATH, "utf8");
    const parsed = JSON.parse(existing);
    if (Array.isArray(parsed)) queue = parsed;
  } catch {
    // No queue yet — start fresh.
  }
  queue.push(entry);
  await fs.writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2), "utf8");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      type = "Item Request",
      item,
      need,
      details,
      contact,
      name,
      message,
    } = body ?? {};

    const record = {
      id: `req_${Date.now()}`,
      receivedAt: new Date().toISOString(),
      type,
      name: name ?? "",
      item: item ?? "",
      need: need ?? "",
      details: details ?? "",
      message: message ?? "",
      contact: contact ?? "",
    };

    // Always keep a local backup copy.
    await appendToQueue(record).catch((err) =>
      console.error("Failed to append request to queue:", err)
    );

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn(
        "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing — request saved locally only."
      );
      // Still succeed so the user sees a confirmation.
      return NextResponse.json({ success: true, delivered: false });
    }

    const lines = [
      `🛎️ *${record.type}*`,
      record.name && `👤 *Name:* ${record.name}`,
      record.item && `🛍️ *Item:* ${record.item}`,
      record.need && `⏰ *Need by:* ${record.need}`,
      record.details && `📝 *Details:* ${record.details}`,
      record.message && `💬 *Message:* ${record.message}`,
      record.contact && `📱 *Contact:* ${record.contact}`,
    ].filter(Boolean);

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.join("\n"),
          parse_mode: "Markdown",
        }),
      }
    );

    if (!telegramRes.ok) {
      const errText = await telegramRes.text();
      console.error("Telegram API error:", telegramRes.status, errText);
      return NextResponse.json({ success: true, delivered: false });
    }

    return NextResponse.json({ success: true, delivered: true });
  } catch (error) {
    console.error("telegram-request error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send request." },
      { status: 500 }
    );
  }
}
