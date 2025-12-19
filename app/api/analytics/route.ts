import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const role = searchParams.get("role"); // 'WAREHOUSE' or 'DEALER'

  if (!userId || !role) return new NextResponse("Missing Params", { status: 400 });

  try {
    let shipments = [];

    // 1. Fetch Data based on Role
    if (role === "WAREHOUSE") {
      shipments = await db.shipment.findMany({
        where: { warehouseId: userId, status: "DELIVERED" },
        include: { assignedTruck: true },
        orderBy: { createdAt: 'asc' }
      });
    } else {
      // For Dealers, find shipments assigned to THEIR trucks
      shipments = await db.shipment.findMany({
        where: { 
          assignedTruck: { dealerId: userId },
          status: "DELIVERED" 
        },
        include: { assignedTruck: true },
        orderBy: { createdAt: 'asc' }
      });
    }

    // 2. Calculate Metrics
    const totalMoves = shipments.length;
    
    // Sum of Money
    const totalMoney = shipments.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);
    
    // Sum of CO2
    const totalCO2 = shipments.reduce((acc, curr) => acc + (curr.co2Saved || 0), 0);

    // Calculate Average Utilization per Trip
    let utilizationSum = 0;
    const chartData = shipments.map((s, index) => {
      const truckVol = s.assignedTruck?.capacityVolume || 1;
      const util = Math.round((s.totalVolume / truckVol) * 100);
      utilizationSum += util;
      
      return {
        label: `Trip ${index + 1}`,
        value: util, // Plot Utilization %
        cost: s.estimatedCost
      };
    });

    const avgUtilization = totalMoves > 0 ? Math.round(utilizationSum / totalMoves) : 0;

    return NextResponse.json({
      totalMoves,
      totalMoney,
      totalCO2,
      avgUtilization,
      chartData // Array for the graph
    });

  } catch (error) {
    console.log("[ANALYTICS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}