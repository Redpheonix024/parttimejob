"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Mail, CheckCircle2, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simple email validation
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Validate that it's an admin email (in a real app, this would be done server-side)
    if (!email.includes("admin") && !email.includes("Parttimejob.com")) {
      setError("This email is not registered as an admin account");
      setIsLoading(false);
      return;
    }

    // Simulate API request to send password reset email
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Parttimejob
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link
          href="/admin/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Login
        </Link>

        <div className="max-w-md mx-auto">
          {isSubmitted ? (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Check Your Email</CardTitle>
                <CardDescription>
                  We've sent a password reset link to{" "}
                  <span className="font-medium">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>
                  If you don't see the email in your inbox, please check your
                  spam folder or junk mail.
                </p>
                <p className="mt-2">
                  The link will expire in 30 minutes for security reasons.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try a different email
                </Button>
                <Button
                  className="w-full"
                  onClick={() => router.push("/admin/login")}
                >
                  Return to Admin Login
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">
                  Admin Password Reset
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your admin email address to receive a password reset
                  link
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Admin Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@Parttimejob.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Reset Link
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-center w-full text-muted-foreground">
                  If you're not an administrator, please contact the system
                  administrator for assistance.
                </p>
              </CardFooter>
            </Card>
          )}
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
