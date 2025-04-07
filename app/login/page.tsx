"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth, db } from "../config/firebase"; // Add this import
import { doc, setDoc, getDoc } from "firebase/firestore"; // Add this import
import { checkAdminRole } from "@/app/utils/admin";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Github, Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState({
    title: "",
    description: "",
  });
  const [countryCode, setCountryCode] = useState("91"); // Default to India
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const form = e.target as HTMLFormElement;
      const email = (form.elements.namedItem("email") as HTMLInputElement)
        .value;
      const password = (form.elements.namedItem("password") as HTMLInputElement)
        .value;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      // Check if user has admin role
      const isAdmin = await checkAdminRole(userCredential.user.uid);
      
      if (isAdmin) {
        // Sign out the admin user and show error
        await auth.signOut();
        setError("Admin accounts must log in through the admin login page.");
        setIsLoading(false);
        return;
      }

      const token = await userCredential.user.getIdToken();

      // Set authentication cookie
      document.cookie = `auth=${token}; path=/; max-age=3600; secure; samesite=strict`;

      // Immediate redirect after successful login
      router.push("/");
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email-signup") as HTMLInputElement)
      .value;
    const password = (
      form.elements.namedItem("password-signup") as HTMLInputElement
    ).value;
    const confirmPassword = (
      form.elements.namedItem("confirm-password") as HTMLInputElement
    ).value;
    const firstName = (
      form.elements.namedItem("first-name") as HTMLInputElement
    ).value;
    const lastName = (form.elements.namedItem("last-name") as HTMLInputElement)
      .value;
    const dateOfBirth = selectedDate ? selectedDate.toISOString() : "";
    const gender = (form.elements.namedItem("gender") as HTMLSelectElement)
      .value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName,
        lastName,
        email,
        dateOfBirth,
        gender,
        phone,
        role: 'job seeker', // Set default role as job seeker
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setDialogMessage({
        title: "Account Created!",
        description: "Your account has been successfully created.",
      });
      setShowSuccessDialog(true);
      setTimeout(() => {
        setShowSuccessDialog(false);
        router.push("/");
      }, 2000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // const checkUserData = async (uid: string) => {
  //   const userDoc = await getDoc(doc(db, "users", uid));
  //   if (!userDoc.exists()) {
  //     throw new Error("User profile not found. Please sign up first.");
  //   }
  //   const userData = userDoc.data();
  //   if (!userData.phone || !userData.email) {
  //     throw new Error(
  //       "Please complete your profile with phone and email first."
  //     );
  //   }
  //   return userData;
  // };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, "users", result.user.uid));

      if (!userDoc.exists()) {
        // If user doesn't exist, create new user document
        const userData = {
          firstName: result.user.displayName?.split(" ")[0] || "",
          lastName:
            result.user.displayName?.split(" ").slice(1).join(" ") || "",
          email: result.user.email,
          phone: result.user.phoneNumber || "",
          role: 'job seeker', // Set default role as job seeker
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authProvider: "google",
        };

        await setDoc(doc(db, "users", result.user.uid), userData);
      }

      setDialogMessage({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
      setShowSuccessDialog(true);
      setTimeout(() => {
        setShowSuccessDialog(false);
        router.push("/");
      }, 2000);
    } catch (error: any) {
      setError(error.message);
      if (auth.currentUser) {
        await auth.signOut();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  };

  const handlePhoneSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = `+${countryCode}${phoneNumber.replace(/^0+/, "")}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );
      setVerificationId(confirmationResult.verificationId);
      setShowOtpInput(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const credential = await signInWithPhoneNumber(auth, phoneNumber);
      await credential.confirm(otp);
      router.push("/");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            part time jobs
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                          href="/forgot-password"
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <Input id="password" type="password" required />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                    {error && (
                      <p className="text-sm text-red-500 mt-2">{error}</p>
                    )}
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      onClick={() => setShowOtpInput(true)}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Phone
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      onClick={handleGoogleSignIn}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                  </div>

                  {showOtpInput && (
                    <div className="space-y-4 mt-4">
                      {!verificationId ? (
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="flex space-x-2">
                            <Select
                              defaultValue={countryCode}
                              onValueChange={setCountryCode}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="+91" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="91">+91 🇮🇳</SelectItem>
                                <SelectItem value="1">+1 🇺🇸</SelectItem>
                                <SelectItem value="44">+44 🇬🇧</SelectItem>
                                <SelectItem value="86">+86 🇨🇳</SelectItem>
                                {/* Add more countries as needed */}
                              </SelectContent>
                            </Select>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="Phone number"
                              value={phoneNumber}
                              onChange={(e) =>
                                setPhoneNumber(
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                              className="flex-1"
                            />
                            <Button
                              onClick={handlePhoneSignIn}
                              disabled={isLoading || !phoneNumber}
                            >
                              Send OTP
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="otp">Enter OTP</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="otp"
                              type="text"
                              placeholder="Enter OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              maxLength={6}
                            />
                            <Button
                              onClick={verifyOtp}
                              disabled={isLoading || otp.length !== 6}
                            >
                              Verify
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div id="recaptcha-container"></div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/login?tab=signup"
                      className="text-primary hover:underline"
                    >
                      Sign up
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>
                    Choose how you want to create your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full h-12"
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Continue with Google
                    </Button>

                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setShowOtpInput(true)}
                      disabled={isLoading}
                      className="w-full h-12"
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      Continue with Phone
                    </Button>
                  </div>

                  {showOtpInput && (
                    <div className="space-y-4">
                      {!verificationId ? (
                        <div className="space-y-2">
                          <Label htmlFor="phone-signup">Phone Number</Label>
                          <div className="flex space-x-2">
                            <Select
                              defaultValue={countryCode}
                              onValueChange={setCountryCode}
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="+91" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="91">+91 🇮🇳</SelectItem>
                                <SelectItem value="1">+1 🇺🇸</SelectItem>
                                <SelectItem value="44">+44 🇬🇧</SelectItem>
                                <SelectItem value="86">+86 🇨🇳</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              id="phone-signup"
                              type="tel"
                              placeholder="Phone number"
                              value={phoneNumber}
                              onChange={(e) =>
                                setPhoneNumber(
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                              className="flex-1"
                            />
                            <Button
                              onClick={handlePhoneSignIn}
                              disabled={isLoading || !phoneNumber}
                            >
                              Send OTP
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="otp-signup">Enter OTP</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="otp-signup"
                              type="text"
                              placeholder="Enter OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              maxLength={6}
                              className="flex-1"
                            />
                            <Button
                              onClick={verifyOtp}
                              disabled={isLoading || otp.length !== 6}
                            >
                              Verify
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or sign up with email
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-signup">Email</Label>
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2 relative">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="text"
                        required
                        value={
                          selectedDate ? selectedDate.toLocaleDateString() : ""
                        }
                        onClick={() => setShowCalendar(!showCalendar)}
                        readOnly
                        className="cursor-pointer"
                      />
                      {showCalendar && (
                        <div className="absolute z-50 mt-1">
                          <Calendar
                            onChange={handleDateSelect}
                            value={selectedDate}
                            maxDate={new Date()}
                            minDate={new Date(1900, 0, 1)}
                            className="rounded-md border bg-white shadow-md"
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select defaultValue="" required>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        defaultValue="+91"
                        placeholder="+91"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">Password</Label>
                      <Input id="password-signup" type="password" required />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="terms"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          required
                        />
                        <Label htmlFor="terms" className="text-sm font-normal">
                          I agree to the{" "}
                          <Link
                            href="/terms"
                            className="text-primary hover:underline"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy"
                            className="text-primary hover:underline"
                          >
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                    {error && (
                      <p className="text-sm text-red-500 mt-2">{error}</p>
                    )}
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/login?tab=signin"
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogMessage.title}</DialogTitle>
            <DialogDescription>{dialogMessage.description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <footer className="bg-background border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} part time jobs. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
