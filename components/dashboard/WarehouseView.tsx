"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// 1. Dynamic Import for the Map
const RouteMap = dynamic(() => import("../../components/dashboard/RouteMap"), { 
  ssr: false, 
  loading: () => <div className="h-[500px] bg-gray-100 animate-pulse rounded-xl">Loading Map...</div>
});

export default function WarehouseView({ userId }: { userId: string }) {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [currentShipmentId, setCurrentShipmentId] = useState<string | null>(null);
  const [myShipments, setMyShipments] = useState<any[]>([]);

  // Multi-Stop State
  const [inputCity, setInputCity] = useState("");
  const [cities, setCities] = useState<any[]>([]); 
  const [optimizedData, setOptimizedData] = useState<any>(null);

  // Form Data for Booking (Volume/Weight still needed for the truck matching)
  const [cargoDetails, setCargoDetails] = useState({ weight: "", volume: "" });

  // --- 1. LOAD HISTORY ON START ---
  useEffect(() => {
    const fetchMyShipments = async () => {
      try {
        const res = await fetch(`/api/shipments/user?userId=${userId}`);
        if (res.ok) {
           const data = await res.json();
           setMyShipments(data);
        }
      } catch (e) { console.error("History fetch failed"); }
    };
    fetchMyShipments();
  }, [userId]);

  // --- HELPER: GET COORDINATES ---
  const getCoordinates = async (cityName: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${cityName}`);
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          name: cityName,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (e) { return null; }
  };

  // --- ACTION: ADD CITY TO LIST ---
  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!inputCity) return;
    
    const coords = await getCoordinates(inputCity);
    if(coords) {
      setCities([...cities, coords]);
      setInputCity("");
    } else {
      alert("City not found!");
    }
  };

  // --- ACTION: RUN OPTIMIZATION ---
  const handleOptimizeAndSearch = async () => {
    if(cities.length < 2) {
      alert("Please add at least 2 cities (Origin & Destination).");
      return;
    }
    setLoading(true);
    setMatches([]);
    setCurrentShipmentId(null);
    
    try {
      // 1. Run Route Optimization (Genetic Algo)
      const routeRes = await fetch("/api/optimize-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cities }),
      });
      const routeData = await routeRes.json();
      setOptimizedData(routeData);

      // 2. Create the Shipment Record (So we can book it)
      // We use the first city as Origin and last as Destination for the DB record
      const shipmentRes = await fetch("/api/shipments", {
        method: "POST",
        body: JSON.stringify({ 
          origin: cities[0].name,
          destination: cities[cities.length - 1].name,
          weight: cargoDetails.weight || "1000", // Default if empty
          volume: cargoDetails.volume || "10",
          distance: routeData.total_distance_km || 0,
          userId 
        }),
      });
      
      const shipmentData = await shipmentRes.json();
      
      if (shipmentData.shipmentId) setCurrentShipmentId(shipmentData.shipmentId); 
      if (shipmentData.matches) setMatches(shipmentData.matches);

    } catch (e) {
      alert("Optimization Failed");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION: BOOK TRUCK ---
  const handleBook = async (truckId: string) => {
    if (!currentShipmentId) {
      alert("Error: No active shipment found. Please run optimization first.");
      return;
    }
    if (!confirm("Confirm booking for this truck?")) return;

    try {
      const res = await fetch("/api/shipments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          shipmentId: currentShipmentId, 
          truckId: truckId 
        }),
      });

      if (res.ok) {
        alert("✅ Truck Booked Successfully!");
        setMatches([]); 
        setCurrentShipmentId(null);
        window.location.reload(); // Refresh to see it in history
      } else {
        alert("Failed to book truck.");
      }
    } catch (error) {
      alert("Connection Error");
    }
  };

  // --- RENDER ---
  return (
    <div className="space-y-8">
      
      {/* SECTION 1: Route Builder & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Route Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4">📍 Build Route</h2>
            
            {/* Add City Input */}
            <form onSubmit={handleAddCity} className="flex gap-2 mb-4">
              <input 
                value={inputCity}
                onChange={(e) => setInputCity(e.target.value)}
                placeholder="Add Stop (e.g. Pune)" 
                className="flex-1 border p-2 rounded"
              />
              <button className="bg-gray-900 text-white px-4 rounded hover:bg-gray-700">Add</button>
            </form>

            {/* City List */}
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {cities.map((city, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded border text-sm">
                  <span>#{idx+1} {city.name}</span>
                  <button onClick={() => setCities(cities.filter((_, i) => i !== idx))} className="text-red-500 text-xs">✕</button>
                </div>
              ))}
              {cities.length === 0 && <p className="text-gray-400 text-sm text-center">Add cities to build path</p>}
            </div>

            {/* Cargo Details */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <input type="number" placeholder="Weight (kg)" className="border p-2 rounded text-sm" onChange={e => setCargoDetails({...cargoDetails, weight: e.target.value})} />
              <input type="number" placeholder="Volume (m3)" className="border p-2 rounded text-sm" onChange={e => setCargoDetails({...cargoDetails, volume: e.target.value})} />
            </div>

            <button 
              onClick={handleOptimizeAndSearch}
              disabled={loading || cities.length < 2}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Optimizing..." : "✨ Run AI Optimization"}
            </button>
          </div>

          {/* AI Summary Box */}
          {optimizedData && (
            <div className="bg-green-50 p-6 rounded-xl border border-green-200 animate-in fade-in">
               <h3 className="font-bold text-green-800 mb-2">🤖 AI Analysis</h3>
               <p className="text-green-900 text-sm mb-2">{optimizedData.ai_summary}</p>
               <div className="font-mono text-xl font-bold text-green-700 mt-2">
                 {optimizedData.total_distance_km} KM
               </div>
               <p className="text-xs text-green-600">Total Route Distance</p>
            </div>
          )}
        </div>

        {/* RIGHT: Map Display */}
        <div className="lg:col-span-2 h-full min-h-[500px]">
           {/* FIX: We now pass the 'route' prop instead of originCoords */}
           <RouteMap route={optimizedData?.optimized_route || cities} />
        </div>
      </div>

      {/* SECTION 2: Optimization Results (Trucks) */}
      <div className="space-y-4">
        {matches.length > 0 && <h3 className="font-bold text-gray-700 text-xl">Available Fleet Matches</h3>}
        {matches.map((truck) => (
          <div key={truck.id} className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-green-500 flex justify-between">
             <div>
               <h4 className="font-bold">{truck.truckType}</h4>
               <p className="text-sm text-gray-500">{truck.licensePlate}</p>
               <div className="mt-1 text-xs text-green-700 bg-green-100 inline-block px-2 py-1 rounded">
                 Utilization: {truck.matchDetails.utilization}
               </div>
             </div>
             <div className="text-right">
               <span className="block font-bold text-lg">₹{truck.matchDetails.estimatedCost}</span>
               <button 
                  onClick={() => handleBook(truck.id)} 
                  className="bg-black text-white px-4 py-2 rounded text-sm mt-2 hover:bg-gray-800 transition"
               >
                 Book Now
               </button>
             </div>
          </div>
        ))}
      </div>

      {/* SECTION 3: Shipment History */}
      <div className="mt-12 border-t pt-8">
        <h3 className="text-xl font-bold mb-6">📦 My Shipment History</h3>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {myShipments.map((ship) => (
            <div key={ship.id} className="bg-white p-5 rounded-xl border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-gray-500 text-xs">ID: {ship.id.slice(0,8)}</span>
                  <h4 className="font-bold">{ship.origin} ➝ {ship.destination}</h4>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                   ship.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {ship.status}
                </span>
              </div>

              {/* Status Steps */}
              <div className="flex items-center mt-4 mb-4 text-xs text-gray-500">
                 <div className={`flex-1 h-1 ${ship.status !== 'PENDING' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                 <div className={`flex-1 h-1 ${['IN_TRANSIT', 'DELIVERED'].includes(ship.status) ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                 <div className={`flex-1 h-1 ${ship.status === 'DELIVERED' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              </div>

              {/* The Green Report (Only if Delivered) */}
              {ship.status === 'DELIVERED' && (
                <div className="bg-green-50 p-3 rounded-lg mt-3 border border-green-100">
                   <p className="text-green-800 font-bold text-sm">🌱 Impact Report</p>
                   <div className="flex justify-between text-sm mt-1">
                      <span>CO₂ Saved:</span>
                      <span className="font-bold">{ship.co2Saved} kg</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span>Total Cost:</span>
                      <span className="font-bold">₹{ship.estimatedCost}</span>
                   </div>
                </div>
              )}
            </div>
          ))}
          {myShipments.length === 0 && <p className="text-gray-500 italic">No past shipments found.</p>}
        </div>
      </div>
    </div>
  );
}