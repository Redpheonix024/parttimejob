import { NextResponse } from "next/server";
import { collection, getCountFromServer } from "firebase/firestore";
// import { db } from '@/lib/firebase'; // Old import
import { db } from "@/app/config/firebase"; // Correct import path

export async function GET() {
  console.log("API Route /api/admin/users/count invoked");
  try {
    console.log("Attempting to get users collection reference...");
    const usersCol = collection(db, "users");
    console.log(
      "Got collection reference. Attempting to get count from server..."
    );
    const snapshot = await getCountFromServer(usersCol);
    console.log("Successfully got count snapshot:", snapshot.data());
    const count = snapshot.data().count;

    console.log("Returning count:", count);
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error inside /api/admin/users/count:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user count",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Optional: Add specific security checks here if needed
// e.g., check if the user making the request is an admin
