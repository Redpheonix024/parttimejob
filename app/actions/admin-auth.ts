"use server";

import { auth, db } from "@/app/config/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { cookies } from "next/headers";

// Admin login function
export async function adminLogin(email: string, password: string) {
  try {
    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user has admin role in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();
    
    if (!userData || userData.role !== "admin") {
      await signOut(auth);
      return {
        success: false,
        error: "You do not have admin privileges",
      };
    }
    
    // Set session cookie for server-side auth checks
    const idToken = await user.getIdToken();
    const cookieStore = cookies();
    cookieStore.set("admin-session", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || user.displayName,
      },
    };
  } catch (error: any) {
    let message = "Authentication failed";
    
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      message = "Invalid email or password";
    } else if (error.code === "auth/too-many-requests") {
      message = "Too many failed login attempts. Please try again later";
    }
    
    return {
      success: false,
      error: message,
    };
  }
}

// Admin logout function
export async function adminLogout() {
  try {
    await signOut(auth);
    
    // Clear session cookie
    const cookieStore = cookies();
    cookieStore.delete("admin-session");
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Failed to logout",
    };
  }
}

// Verify admin session
export async function verifyAdminSession() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("admin-session");
    
    if (!sessionCookie) {
      return { isAdmin: false };
    }
    
    // Get the user from the token
    const decodedToken = await auth.verifyIdToken(sessionCookie.value);
    
    // Check if the user has admin role
    const userDoc = await getDoc(doc(db, "users", decodedToken.uid));
    const userData = userDoc.data();
    
    if (!userData || userData.role !== "admin") {
      return { isAdmin: false };
    }
    
    return {
      isAdmin: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: userData.displayName,
      },
    };
  } catch (error) {
    return { isAdmin: false };
  }
} 