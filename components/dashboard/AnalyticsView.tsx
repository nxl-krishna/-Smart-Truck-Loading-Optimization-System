"use client";

import { useEffect, useState } from "react";

export default function AnalyticsView({ userId, role }: { userId: string, role: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/analytics?userId=${userId}&role=${role}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Analytics fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, role]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Analytics...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Failed to load data</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-800">📊 Performance Analytics</h2>

      {/* 1. Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Total Trips</p>
          <p className="text-3xl font-bold">{data.totalMoves}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">{role === 'DEALER' ? 'Total Revenue' : 'Total Spend'}</p>
          <p className="text-3xl font-bold text-blue-600">₹{data.totalMoney.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Avg Utilization</p>
          <p className={`text-3xl font-bold ${data.avgUtilization > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
            {data.avgUtilization}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">CO₂ Saved</p>
          <p className="text-3xl font-bold text-green-600">{data.totalCO2} kg</p>
        </div>
      </div>

      {/* 2. Utilization Trend Chart */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-bold text-lg mb-6">📈 Truck Utilization Trend (Last Trips)</h3>
        
        {data.chartData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-400">
            No completed trips data available yet.
          </div>
        ) : (
          // FIXED: Added 'items-end' to align bars to bottom
          <div className="flex items-end justify-between h-64 space-x-2 px-4 pb-2">
            {data.chartData.map((item: any, i: number) => (
              // FIXED: Added 'h-full justify-end' here so the wrapper fills the height
              <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end relative">
                
                {/* Tooltip (Absolute position to float above) */}
                <div className="opacity-0 group-hover:opacity-100 mb-2 text-xs bg-black text-white p-2 rounded absolute -top-10 transition-opacity whitespace-nowrap z-10">
                  {item.value}% Utilized • ₹{item.cost}
                </div>

                {/* The Bar */}
                <div 
                  className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${
                    item.value > 80 ? 'bg-green-500' : item.value > 50 ? 'bg-blue-500' : 'bg-yellow-400'
                  }`}
                  style={{ height: `${item.value}%` }}
                ></div>
                
                {/* Label */}
                <p className="text-xs text-gray-500 mt-2">Trip {i + 1}</p>
              </div>
            ))}
          </div>
        )}
        <div className="border-t mt-0 pt-2 text-xs text-gray-400 text-center">
          Recent Shipments &rarr;
        </div>
      </div>
    </div>
  );
}