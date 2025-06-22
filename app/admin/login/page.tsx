"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/config/firebase";
import { checkAdminRole } from "@/app/utils/admin";

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user has admin privileges
          const isAdmin = await checkAdminRole(user.uid);
          if (isAdmin) {
            // User is already authenticated as admin, redirect to dashboard or callback URL
            router.push(callbackUrl);
          }
        } catch (error) {
          console.error("Error checking admin role:", error);
        }
      }
      // Set loading to false in all cases to ensure the login form is displayed
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, callbackUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsProcessingLogin(true);

    // Get form data
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user has admin role
      const isAdmin = await checkAdminRole(user.uid);
      
      if (isAdmin) {
        // User is authenticated and has admin role
        // Generate the session cookie for middleware
        const idToken = await user.getIdToken();
          // Set the admin-session cookie with 4-hour expiration
        document.cookie = `admin-session=${idToken}; path=/; max-age=${60 * 60 * 4}; SameSite=Strict;`;
        
        // Redirect to callback URL or dashboard
        router.push(callbackUrl);
      } else {
        // User doesn't have admin role
        setError("You do not have admin privileges. Access denied.");
        // Sign out the user since they don't have admin access
        await auth.signOut();
      }
    } catch (error: any) {
      // Handle authentication errors
      let errorMessage = "Authentication failed";
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessingLogin(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <img 
              src="/icons/PTJ SVG.svg" 
              alt="Parttimejob Logo" 
              className="h-8 w-auto"
            />
            <span>Parttimejob</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex flex-col items-center justify-center mb-4 space-y-2">
                <img 
                  src="/icons/PTJ SVG.svg" 
                  alt="Parttimejob Logo" 
                  className="h-12 w-auto"
                />
                <div className="h-1 w-12 bg-primary/20 rounded-full"></div>
              </div>
              <CardTitle className="text-2xl text-center">
                Admin Login
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@Parttimejob.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/admin/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isProcessingLogin}>
                  {isProcessingLogin ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-center w-full text-muted-foreground">
                This area is restricted to authorized personnel only.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="bg-background border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Parttimejob. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
