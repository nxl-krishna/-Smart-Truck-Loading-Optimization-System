"use client";

import { useEffect, useState } from "react";

export default function AdminView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Admin Data
  const loadData = async () => {
    const res = await fetch("/api/admin");
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Ban User
  const handleDeleteUser = async (userId: string) => {
    if(!confirm("Are you sure? This will delete the user and all their data.")) return;
    
    await fetch(`/api/admin?id=${userId}`, { method: "DELETE" });
    alert("User Deleted");
    loadData(); // Refresh list
  };

  if (loading) return <div>Loading System Data...</div>;

  return (
    <div className="space-y-8">
      
      {/* 1. System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <h3 className="font-medium opacity-80">Total Users</h3>
          <p className="text-4xl font-bold mt-2">{data.stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-gray-500 text-sm">Total Shipments</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{data.stats.totalShipments}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-gray-500 text-sm">Active Trucks</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{data.stats.totalTrucks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. User Management Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h3 className="font-bold text-lg">User Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Stats</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'DEALER' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {u.role === 'DEALER' 
                        ? `${u._count.trucks} Trucks` 
                        : `${u._count.shipments} Shipments`
                      }
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 px-3 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. System Logs / Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border h-fit">
          <div className="p-6 border-b bg-gray-50">
            <h3 className="font-bold text-lg">Live Activity Log</h3>
          </div>
          <div className="p-4 space-y-4">
            {data.recentActivity.map((log: any) => (
              <div key={log.id} className="flex gap-3 text-sm border-b pb-3 last:border-0">
                <div className={`w-2 h-2 mt-1.5 rounded-full ${
                  log.status === 'DELIVERED' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <p className="text-gray-800">
                    <span className="font-semibold">{log.warehouse?.name || "User"}</span> 
                    {log.status === 'PENDING' ? ' posted a shipment.' : ' booked a truck.'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {data.recentActivity.length === 0 && <p className="text-gray-400 text-center">No activity yet</p>}
          </div>
        </div>

      </div>
    </div>
  );
}