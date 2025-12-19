import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, origin, destination, weight, volume, distance } = body; // ADDED distance
    
    // 1. Save Shipment with ACTUAL Distance
    const shipment = await db.shipment.create({
      data: {
        warehouseId: userId,
        origin,
        destination,
        totalWeight: parseFloat(weight),
        totalVolume: parseFloat(volume),
        distance: distance ? parseFloat(distance) : 0, // Save it here
        status: "PENDING",
      },
    });

    // 2. Fetch available trucks (Optimization Logic)
    const allTrucks = await db.truck.findMany({
      where: { isAvailable: true },
      include: { dealer: true },
    });

    // 3. Score Trucks
    const rankedTrucks = allTrucks
      .map((truck) => {
        const fitsWeight = truck.capacityWeight >= shipment.totalWeight;
        const fitsVolume = truck.capacityVolume >= shipment.totalVolume;
        if (!fitsWeight || !fitsVolume) return null;

        const utilization = (shipment.totalVolume / truck.capacityVolume) * 100;
        
        // Use Actual Distance for Cost Est. (Fallback to 1 if 0 to avoid errors)
        const calcDist = shipment.distance || 1; 
        const totalCost = calcDist * truck.costPerKm;

        return {
          ...truck,
          matchDetails: {
            utilization: utilization.toFixed(1) + "%",
            estimatedCost: totalCost.toFixed(0), // Format as string for UI
            score: totalCost,
          },
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => a.matchDetails.score - b.matchDetails.score);

    return NextResponse.json({ 
      shipmentId: shipment.id,
      matches: rankedTrucks 
    });

  } catch (error) {
    console.log("[SHIPMENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { shipmentId, truckId, status } = body;

    // SCENARIO 1: BOOKING
    if (truckId && !status) {
      const updatedShipment = await db.shipment.update({
        where: { id: shipmentId },
        data: {
          assignedTruckId: truckId,
          status: "ASSIGNED",
        },
      });
      await db.truck.update({
        where: { id: truckId },
        data: { isAvailable: false },
      });
      return NextResponse.json(updatedShipment);
    }

    // SCENARIO 2: STATUS UPDATE & FINAL CALCULATION
    if (status) {
      let updateData: any = { status };

      if (status === "DELIVERED") {
        const shipment = await db.shipment.findUnique({
          where: { id: shipmentId },
          include: { assignedTruck: true }
        });

        if (shipment && shipment.assignedTruck) {
           // --- FIX: USE REAL DISTANCE FROM DB ---
           const realDistance = shipment.distance || 500; // Fallback only if missing
           
           const actualCost = realDistance * shipment.assignedTruck.costPerKm;
           
           // CO2 Calculation
           const fuelUsed = realDistance / shipment.assignedTruck.fuelEfficiency;
           const co2Emitted = fuelUsed * 2.68;
           const co2Saved = co2Emitted * 0.2; // 20% savings assumption

           updateData = {
             status: "DELIVERED",
             estimatedCost: actualCost,
             co2Saved: parseFloat(co2Saved.toFixed(2)),
             requiredBy: new Date(),
           };

           // Free up the truck
           await db.truck.update({
             where: { id: shipment.assignedTruckId! },
             data: { isAvailable: true }
           });
        }
      }

      const updatedShipment = await db.shipment.update({
        where: { id: shipmentId },
        data: updateData,
      });

      return NextResponse.json(updatedShipment);
    }

    return new NextResponse("Invalid Request", { status: 400 });

  } catch (error) {
    console.log("[SHIPMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}