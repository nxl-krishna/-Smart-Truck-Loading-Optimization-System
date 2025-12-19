import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return new NextResponse("Missing User ID", { status: 400 });

  try {
    const jobs = await db.shipment.findMany({
      where: {
        // CORRECTION: Filter by the TRUCK'S owner, not the shipment status alone
        assignedTruck: {
          dealerId: userId
        },
        // Show ALL relevant statuses, not just ASSIGNED
        status: {
          in: ["ASSIGNED", "IN_TRANSIT", "DELIVERED"] 
        }
      },
      include: {
        assignedTruck: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.log("[JOBS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}