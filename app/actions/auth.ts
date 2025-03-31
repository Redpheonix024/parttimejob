import { getAuth, signOut } from "firebase/auth";
import { app } from "../config/firebase";


export async function handleLogout() {
  const auth = getAuth(app);
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}
