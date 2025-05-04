import { NextResponse } from "next/server";
import { collection, getCountFromServer } from "firebase/firestore";
// import { db } from '@/lib/firebase'; // Old import
import { db } from "@/app/config/firebase"; // Correct import path

export async function GET() {
  try {
    const jobsCol = collection(db, "jobs");
    const snapshot = await getCountFromServer(jobsCol);
    const count = snapshot.data().count;

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching jobs count:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs count" },
      { status: 500 }
    );
  }
}

// Optional: Add specific security checks here if needed
