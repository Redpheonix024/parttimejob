import { NextRequest, NextResponse } from 'next/server';
import { getAuth, signOut } from "firebase/auth";
import { app } from "../../config/firebase";

export async function POST(request: NextRequest) {
  const { action } = await request.json();
  
  if (action === 'logout') {
    const success = await handleLogout();
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to logout' }, { status: 500 });
    }
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

async function handleLogout() {
  const auth = getAuth(app);
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
} 