"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  showNav?: boolean;
  activeLink?: string;
  userData: any;
  toggleMobileSidebar?: () => void;
}

export default function Header({
  showNav = true,
  activeLink,
  userData,
  toggleMobileSidebar,
}: HeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [firebaseAuth, setFirebaseAuth] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    const setupFirebase = async () => {
      try {
        const { getFirebaseAuth } = await import("@/utils/firebase-client");
        const auth = await getFirebaseAuth();
        if (auth) {
          setFirebaseAuth(auth);
          
          const { onAuthStateChanged } = await import("firebase/auth");
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
          });
          
          return unsubscribe;
        }
      } catch (error) {
        console.error("Failed to setup Firebase auth:", error);
      }
    };

    setupFirebase();
  }, []);

  const handleLogout = async () => {
    try {
      if (firebaseAuth) {
        const { signOut } = await import("firebase/auth");
        await signOut(firebaseAuth);
        router.push("/");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {isMounted && user && (
            <button
              className="mr-2 p-2 hover:bg-muted rounded-md"
              onClick={toggleMobileSidebar}
            >
              <span className="text-lg">☰</span>
            </button>
          )}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <img 
                src="/icons/PTJ SVG.svg" 
                alt="Parttimejob Logo" 
                className="h-8 w-auto drop-shadow-lg"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Parttimejob
            </span>
          </Link>
        </div>

        {showNav && (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={
                activeLink === "jobs"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              Browse Jobs
            </Link>
            <Link
              href="/how-it-works"
              className={
                activeLink === "how-it-works"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              How it Works
            </Link>
            <Link
              href="/about"
              className={
                activeLink === "about"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              About
            </Link>
          </nav>
        )}
        <div className="flex items-center gap-4">
          {/* Simple theme toggle placeholder */}
          <div className="w-9 h-9 flex items-center justify-center">
            <span className="text-lg">🌙</span>
          </div>

          <div className="flex items-center gap-4">
            {isMounted ? (
              <>
                {user ? (
                  <>
                    <div className="relative">
                      <button className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {userData?.firstName?.[0]?.toUpperCase() ||
                            user?.displayName?.[0] ||
                            "U"}
                        </div>
                      </button>
                      {/* Simple dropdown menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg hidden hover:block">
                        <Link href="/dashboard" className="block px-4 py-2 hover:bg-muted">
                          Dashboard
                        </Link>
                        <Link href="/dashboard/profile" className="block px-4 py-2 hover:bg-muted">
                          Profile
                        </Link>
                        <hr className="my-1" />
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-muted">
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <Link href="/login">
                    <button className="px-4 py-2 border rounded-md hover:bg-muted whitespace-nowrap">
                      Sign In
                    </button>
                  </Link>
                )}
              </>
            ) : (
              <div className="w-[72px] h-[32px]" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
