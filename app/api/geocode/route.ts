import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "parttimejob-app/1.0 (contact@yourdomain.com)"; // Change to your real contact email/domain

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  let url = "";
  if (type === "reverse") {
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  } else if (type === "search") {
    const q = searchParams.get("q");
    url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(
      q || ""
    )}&limit=1`;
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en",
        Referer: "https://yourdomain.com", // Change to your real domain
      },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch from Nominatim" },
      { status: 500 }
    );
  }
}
