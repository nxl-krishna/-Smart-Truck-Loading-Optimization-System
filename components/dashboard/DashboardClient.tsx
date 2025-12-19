"use client";

import { useState } from "react";
import WarehouseView from "./WarehouseView";
import DealerView from "./DealerView";
import AnalyticsView from "./AnalyticsView";
import AdminView from "./AdminView";
interface DashboardClientProps {
  userId: string;
  role: string;
  userName: string;
}

export default function DashboardClient({ userId, role, userName }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"OPERATIONS" | "ANALYTICS">("OPERATIONS");

  return (
    <div>
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold">Welcome, {userName}</h1>
           <p className="text-gray-500">Role: <span className="font-semibold text-blue-600">{role}</span></p>
        </div>
        
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button 
            onClick={() => setActiveTab("OPERATIONS")}
            className={`px-6 py-2 rounded-md font-medium text-sm transition ${
              activeTab === "OPERATIONS" ? "bg-white shadow text-black" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Operations
          </button>
          <button 
            onClick={() => setActiveTab("ANALYTICS")}
            className={`px-6 py-2 rounded-md font-medium text-sm transition ${
              activeTab === "ANALYTICS" ? "bg-white shadow text-black" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Analytics Reports
          </button>
        </div>
      </div>

     

{/* Tab Content */}
{activeTab === "OPERATIONS" ? (
   // If ADMIN, show AdminView. Else check Warehouse/Dealer
   role === "ADMIN" ? <AdminView /> :
   role === "WAREHOUSE" ? <WarehouseView userId={userId} /> : <DealerView userId={userId} />
) : (
   <AnalyticsView userId={userId} role={role} />
)}
    </div>
  );
}