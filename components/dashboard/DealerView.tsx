"use client";

import { useState, useEffect } from "react";
import ChatWindow from "../ChatWindow";

export default function DealerView({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<{id: string, title: string} | null>(null);
  // Truck Form State
  const [truck, setTruck] = useState({
    licensePlate: "",
    type: "Container",
    capacityWeight: "",
    capacityVolume: "",
    costPerKm: "",
  });

  // 1. Fetch Jobs on Load
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`/api/trucks/jobs?userId=${userId}`);
        const data = await res.json();
        setJobs(data);
      } catch (error) {
        console.error("Failed to fetch jobs");
      }
    };
    fetchJobs();
  }, [userId]);

  const handleAddTruck = async () => {
    setLoading(true);
    await fetch("/api/trucks", {
      method: "POST",
      body: JSON.stringify({ ...truck, userId }),
    });
    setLoading(false);
    alert("Truck Added to Fleet!");
    // Clear form optional
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border max-w-2xl mx-auto">
      
      {/* SECTION 1: Add Truck Form */}
      <h2 className="text-xl font-semibold mb-4">🚛 Add Truck to Fleet</h2>
      <div className="space-y-4 mb-8">
        <input 
          placeholder="License Plate (e.g. MH-04-AB-1234)" 
          className="w-full border p-2 rounded"
          onChange={(e) => setTruck({...truck, licensePlate: e.target.value})}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="number" 
            placeholder="Max Weight (kg)" 
            className="border p-2 rounded"
            onChange={(e) => setTruck({...truck, capacityWeight: e.target.value})}
          />
          <input 
            type="number" 
            placeholder="Max Volume (m³)" 
            className="border p-2 rounded"
            onChange={(e) => setTruck({...truck, capacityVolume: e.target.value})}
          />
        </div>

        <input 
           type="number"
           placeholder="Cost per KM (₹)" 
           className="w-full border p-2 rounded"
           onChange={(e) => setTruck({...truck, costPerKm: e.target.value})}
        />

        <button 
          onClick={handleAddTruck}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
        >
          {loading ? "Adding..." : "Register Truck"}
        </button>
      </div>

      {/* SECTION 2: My Active Jobs */}
      <div className="mt-8 border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">🚛 My Active Jobs</h3>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm text-blue-600 underline hover:text-blue-800"
          >
            Refresh List
          </button>
        </div>
        
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No shipments assigned yet.</p>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                
                {/* Job Header */}
                <div className="flex justify-between">
                  <span className="font-bold text-blue-800">
                    {job.origin} <span className="text-gray-400">➝</span> {job.destination}
                  </span>
                  
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    job.status === 'DELIVERED' ? 'bg-green-200 text-green-800' : 
                    job.status === 'IN_TRANSIT' ? 'bg-orange-200 text-orange-800' : 
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {job.status}
                    
                  </span>
                  <button 
  onClick={() => setActiveChat({ id: job.id, title: `Shipment to ${job.destination}` })}
  className="mt-2 w-full border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-bold hover:bg-gray-50"
>
  💬 Chat with Warehouse
</button>
                  
                </div>

                {/* Job Details */}
                <div className="mt-2 text-sm text-gray-600">
                  <p>Cargo: {job.totalWeight}kg | {job.totalVolume}m³</p>
                  <p className="mt-1 font-semibold">Truck: {job.assignedTruck.licensePlate}</p>
                </div>

                {/* --- NEW: DRIVER CONTROLS --- */}
                <div className="mt-4 flex gap-2">
                  
                  {/* Button 1: Start Trip */}
                  {job.status === "ASSIGNED" && (
                    <button 
                      onClick={async () => {
                        if(!confirm("Start this trip?")) return;
                        await fetch("/api/shipments", {
                          method: "PATCH",
                          body: JSON.stringify({ shipmentId: job.id, status: "IN_TRANSIT" }),
                        });
                        alert("Trip Started!");
                        window.location.reload();
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 w-full"
                    >
                      Start Trip 🚚
                    </button>
                  )}

                  {/* Button 2: Mark Delivered */}
                  {job.status === "IN_TRANSIT" && (
                    <button 
                      onClick={async () => {
                        if(!confirm("Confirm delivery? This will generate the invoice.")) return;
                        await fetch("/api/shipments", {
                          method: "PATCH",
                          body: JSON.stringify({ shipmentId: job.id, status: "DELIVERED" }),
                        });
                        alert("Delivered! CO2 & Cost Report Generated.");
                        window.location.reload();
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700 w-full"
                    >
                      Mark Delivered ✅
                    </button>
                  )}

                  {job.status === "DELIVERED" && (
                    <div className="text-xs text-green-700 font-semibold text-center w-full py-2 bg-green-100 rounded">
                      Trip Completed
                    </div>
                  )}
                </div>
                {/* --- END CONTROLS --- */}

              </div>
            ))}
          </div>
        )}
      </div>
      {/* ... inside the return div, at the very end ... */}
{activeChat && (
  <ChatWindow 
    shipmentId={activeChat.id} 
    currentUserId={userId} 
    title={activeChat.title}
    onClose={() => setActiveChat(null)} 
  />
)}
    </div>
  );
}