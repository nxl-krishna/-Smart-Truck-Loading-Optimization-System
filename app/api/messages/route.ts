import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET Messages for a specific Shipment
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shipmentId = searchParams.get("shipmentId");

  if (!shipmentId) return new NextResponse("Missing Shipment ID", { status: 400 });

  try {
    const messages = await (db as any).message.findMany({
      where: { shipmentId },
      orderBy: { createdAt: 'asc' } // Oldest first (like WhatsApp)
    });
    return NextResponse.json(messages);
  } catch (error) {
    return new NextResponse("Error fetching messages", { status: 500 });
  }
}

// POST a new Message
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, shipmentId, senderId } = body;

    const newMessage = await (db as any).message.create({
      data: {
        content,
        shipmentId,
        senderId
      }
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    return new NextResponse("Error sending message", { status: 500 });
  }
}