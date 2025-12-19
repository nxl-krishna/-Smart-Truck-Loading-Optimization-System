import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "../../components/dashboard/DashboardClient"; // We will create this wrapper

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!dbUser) return redirect("/onboarding");

  // We pass the user data to a Client Component to handle the Tab State
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <DashboardClient 
        userId={dbUser.id} 
        role={dbUser.role} 
        userName={dbUser.name || "User"} 
      />
    </div>
  );
}