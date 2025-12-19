import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // 1. System Counters
    const totalUsers = await db.user.count();
    const totalTrucks = await db.truck.count();
    const totalShipments = await db.shipment.count();
    
    // 2. Fetch All Users (for the management table)
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { shipments: true, trucks: true }
        }
      }
    });

    // 3. Recent Activity (Last 5 Shipments)
    const recentActivity = await db.shipment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { warehouse: true, assignedTruck: true }
    });

    return NextResponse.json({
      stats: { totalUsers, totalTrucks, totalShipments },
      users,
      recentActivity
    });

  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE USER FUNCTION
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) return new NextResponse("ID Required", { status: 400 });

    // Delete the user (Prisma will handle cascading deletes if configured, 
    // or we might need to delete their trucks/shipments first. 
    // For now, we assume simple deletion).
    await db.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return new NextResponse("Failed to delete user", { status: 500 });
  }
}