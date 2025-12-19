import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cities } = body; 

    if (!cities || cities.length < 2) {
      return new NextResponse("Need at least 2 cities", { status: 400 });
    }

    // 1. Get the URL from env
    const apiUrl = process.env.EXTERNAL_OPTIMIZER_URL;
    
    if (!apiUrl) {
      console.error("❌ Missing EXTERNAL_OPTIMIZER_URL in .env file");
      return new NextResponse("Server Misconfiguration", { status: 500 });
    }

    console.log(`🚀 Sending request to AI Engine: ${apiUrl}`);

    // 2. Call your Python Backend
    const externalResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cities }),
    });

    // 3. Handle Errors
    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      console.error("❌ External API Error:", errorText);
      return new NextResponse(`AI Engine Failed: ${externalResponse.statusText}`, { status: externalResponse.status });
    }

    // 4. Return Data
    const data = await externalResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("[OPTIMIZE_PROXY_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}