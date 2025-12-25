🚛 Smart Truck Loading & Route Optimization SystemA comprehensive AI-powered logistics platform that optimizes supply chain efficiency by matching shipments with the best-fit trucks and calculating the most efficient multi-stop routes.🌟 Key Features1. 🧠 AI Optimization EngineLoad Matching: Automatically calculates "Utilization Score" to match shipment volume/weight with available truck capacity.Route Optimization: Uses a Genetic Algorithm (via Python backend) to solve the Traveling Salesman Problem (TSP) for multi-stop deliveries.Green Logistics: Estimates CO₂ emissions and calculates savings compared to empty return trips.2. 👥 Role-Based DashboardsWarehouse Manager:Post shipments with weight/volume details.Visual "Build Route" tool to add multiple city stops.Live map tracking using Leaflet.js & OpenStreetMap.Chat directly with drivers regarding specific loads.Truck Dealer:Register fleet (Truck type, capacity, cost/km)."Driver Controls" to Start Trip and Mark Delivered.Real-time job board with booking notifications.Admin:System-wide analytics (Total Spend, CO₂ Saved, User Stats).User management (Ban/Delete users).3. 💬 Real-Time CollaborationContext-Aware Chat: Built-in messaging system linked to specific shipment IDs.Live Status Updates: PENDING $\to$ ASSIGNED $\to$ IN_TRANSIT $\to$ DELIVERED.🛠️ Tech StackComponentTechnologyFrontendNext.js 14 (App Router), Tailwind CSS, React LeafletBackendNext.js API Routes, Python (FastAPI for Optimization)DatabasePostgreSQL (via Supabase/Neon), Prisma ORMAuthClerk (JWT-based authentication)MapsOpenStreetMap, Nominatim API (Geocoding)🚀 Getting StartedPrerequisitesNode.js 18+PostgreSQL Database URL (Supabase/Neon)Clerk API KeysInstallationClone the RepositoryBashgit clone https://github.com/your-username/smart-truck-logistics.git
cd smart-truck-logistics
Install DependenciesBashnpm install
# or
bun install
Environment SetupCreate a .env file in the root directory:Code snippet# Database
DATABASE_URL="postgresql://user:password@host:5432/db"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# External AI API (Optional - defaults to internal logic if unused)
EXTERNAL_OPTIMIZER_URL="https://your-python-backend.onrender.com/optimize"
Database SyncBashnpx prisma db push
npx prisma generate
Run the AppBashnpm run dev
Visit http://localhost:3000.📸 ScreenshotsWarehouse DashboardOptimization MapVisual route builder interfaceMulti-stop path on OpenStreetMapAnalytics ReportDealer ControlsCO₂ and Cost savings graphsTrip management & Chat🧪 How to Test (Walkthrough)Sign Up: Create an account (select "Truck Dealer" role).Add Supply: Go to Dashboard $\to$ Add a Truck (e.g., "Tata 407", 5000kg capacity).Switch User: Open an Incognito window and Sign Up as "Warehouse".Create Demand:Add stops: "Mumbai" $\to$ "Pune".Click "Run AI Optimization".See the map draw the route.Book: Select the dealer's truck from the "Best Matches" list.Execute:Dealer clicks "Start Trip".Warehouse sees status change to "In Transit".Dealer clicks "Delivered".Warehouse sees "Impact Report" (CO₂ Saved).🛡️ Admin AccessTo access the Admin Panel (/dashboard with admin privileges):Sign up as a normal user.Access your database (Prisma Studio or Supabase).Update the User table: change your role from WAREHOUSE to ADMIN.Refresh the app.📄 LicenseThis project is licensed under the MIT License.
