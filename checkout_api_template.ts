import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, location, phone, paymentMethod, notes } = body;

    // These will be pulled from your .env.local file
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("Telegram credentials missing in .env.local");
      // Still return success to the frontend so the user sees the confirmation
      return NextResponse.json({ success: true });
    }

    // Format the order details into a clean Telegram message
    const message = `🚨 *NEW JENGER DROP ORDER* 🚨\n\n` +
      `📍 *Deliver To:* ${location}\n` +
      `📱 *Phone:* ${phone}\n` +
      `💳 *Payment:* ${paymentMethod}\n\n` +
      `🛍 *Items:*\n${items ? items.map((item: any) => `- ${item.name}`).join('\n') : 'Requested Item'}\n\n` +
      `📝 *Notes:* ${notes || 'None'}`;

    // Send the message to the Telegram Bot API
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!telegramResponse.ok) {
      console.error("Telegram API Error:", await telegramResponse.text());
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Checkout processing error:", error);
    return NextResponse.json({ success: false, error: "Failed to process order" }, { status: 500 });
  }
}
