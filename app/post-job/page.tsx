"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, MapPin, Loader2, Mic, Square, Play, Pause } from "lucide-react";
import Script from "next/script";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, MessageSquare, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { doc, setDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { uploadToS3 } from "@/app/utils/aws-config";
import { v4 as uuidv4 } from "uuid";

// Define a proper interface for contacts
interface Contact {
  name: string;
  phone: string;
}

// Add Google Maps type declaration
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

// Define interface for location data
interface LocationData {
  lat: number;
  lng: number;
}

export default function PostJob() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile, getProfilePicture } = useUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workLocation, setWorkLocation] = useState("on-site");
  const [location, setLocation] = useState<LocationData>({
    lat: 40.7128,
    lng: -74.0060, // Default to New York coordinates if geolocation fails
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([{ name: "", phone: "" }]);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const scriptLoaded = useRef(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const MAX_RECORDING_TIME = 120; // maximum recording time in seconds

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    salaryType: "",
    salaryAmount: "",
    positions: "1",
    gender: "",
    minAge: "18",
    maxAge: "",
    startDate: "",
    endDate: "",
    description: "",
    category: "",
    skills: "",
    jobType: "part-time",
    hours: "",
    duration: "",
    payType: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    applicationInstructions: "",
    termsAccepted: false
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Handle voice recording
  const startRecording = async () => {
    audioChunksRef.current = [];
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioUrl(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Use a more compatible MIME type and set options properly
      const options = { mimeType: 'audio/webm;codecs=opus' };
      let mediaRecorder;
      
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (err) {
        console.log('MediaRecorder with specified options failed, trying default');
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        try {
          // Use a more specific MIME type for blob creation
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          setAudioBlob(audioBlob);
          setAudioUrl(audioUrl);
        } catch (error) {
          console.error("Error creating audio blob:", error);
          toast.error("There was an error processing the recording. Please try again.");
        }
        
        // Stop all audio tracks
        stream.getAudioTracks().forEach(track => track.stop());
      };
      
      // Request data at regular intervals to ensure we collect data
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => {
          if (prevTime >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prevTime + 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone. Please check your browser permissions.");
    }
  };
  
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      // Pause timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => {
          if (prevTime >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Cleanup function for audio recording
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setMapError("Geolocation is not supported by this browser.");
      return;
    }
    
    setIsLoadingLocation(true);
    setMapError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        setLocation({
          lat: latitude,
          lng: longitude,
        });
        
        // If map is already initialized, update its center
        if (googleMapRef.current) {
          googleMapRef.current.setCenter({ lat: latitude, lng: longitude });
          
          if (markerRef.current) {
            markerRef.current.setPosition({ lat: latitude, lng: longitude });
          }
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setMapError(`Error getting location: ${error.message}`);
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // Try to get user's location when component mounts
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[id]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };
  
  // Handle select change
  const handleSelectChange = (value: string, id: string) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[id]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      termsAccepted: checked
    }));
    
    // Clear error if it exists
    if (formErrors.termsAccepted) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.termsAccepted;
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Job title is required";
    if (!formData.company.trim()) errors.company = "Company name is required";
    if (!formData.salaryType) errors.salaryType = "Salary type is required";
    if (!formData.salaryAmount) errors.salaryAmount = "Salary amount is required";
    if (!formData.positions) errors.positions = "Number of positions is required";
    if (!formData.gender) errors.gender = "Gender preference is required";
    if (!formData.category) errors.category = "Job category is required";
    if (!formData.termsAccepted) errors.termsAccepted = "You must accept the terms and conditions";
    
    if (workLocation === "on-site") {
      if (!formData.address.trim()) errors.address = "Address is required";
      if (!formData.city.trim()) errors.city = "City is required";
      if (!formData.state.trim()) errors.state = "State is required";
      if (!formData.zip.trim()) errors.zip = "ZIP code is required";
    }
    
    // If there are validation errors, show them and stop submission
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      // Scroll to the first error
      const firstErrorField = document.getElementById(Object.keys(errors)[0]);
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }
    
    try {
      // Check if user is authenticated
      if (!user) {
        toast.error("You must be logged in to post a job");
        router.push("/login");
        return;
      }
      
      // Format contacts data
      const formattedContacts = contacts.map((contact: Contact, index: number) => {
        const nameElement = document.getElementById(`contact-name-${index}`) as HTMLInputElement;
        const phoneElement = document.getElementById(`contact-phone-${index}`) as HTMLInputElement;
        
        return {
          name: nameElement?.value || contact.name || "",
          phone: phoneElement?.value || contact.phone || "",
        };
      }).filter((contact: Contact) => contact.name && contact.phone);
      
      // Generate unique job ID
      const jobId = uuidv4();
      
      // Prepare job data
      const jobData: any = {
        id: jobId,
        userId: user.uid,
        title: formData.title,
        company: formData.company,
        salaryType: formData.salaryType,
        salaryAmount: parseFloat(formData.salaryAmount),
        positions: parseInt(formData.positions),
        gender: formData.gender,
        ageRange: {
          min: parseInt(formData.minAge),
          max: formData.maxAge ? parseInt(formData.maxAge) : null,
        },
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        description: formData.description,
        hasAudioDescription: !!audioUrl,
        hasTextDescription: !!formData.description.trim(),
        category: formData.category,
        skills: formData.skills ? formData.skills.split(",").map(skill => skill.trim()) : [],
        jobType: formData.jobType,
        hours: formData.hours,
        duration: formData.duration,
        payType: formData.payType,
        workLocation: workLocation,
        contacts: formattedContacts,
        applicationInstructions: formData.applicationInstructions,
        status: "pending", // pending, approved, rejected
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      // Add location data if on-site
      if (workLocation === "on-site") {
        jobData.location = {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          coordinates: {
            lat: location.lat,
            lng: location.lng,
          }
        };
      }
      
      // Upload audio to S3 if exists
      if (audioBlob) {
        try {
          // Create a more robust file object with proper MIME type
          const fileType = "audio/webm";
          const fileName = `job-audio-${jobId}.webm`;
          const audioFile = new File([audioBlob], fileName, { type: fileType });
          
          const s3Key = `job-descriptions/${user.uid}/${jobId}-${Date.now()}.webm`;
          
          // Log the file details for debugging
          console.log("Uploading audio file:", {
            name: audioFile.name,
            type: audioFile.type,
            size: audioFile.size
          });
          
          try {
            const audioFileUrl = await uploadToS3(audioFile, s3Key);
            console.log("Audio file uploaded successfully:", audioFileUrl);
            
            // Add audio data to job data
            jobData.audioDescription = {
              url: audioFileUrl,
              duration: recordingTime,
              key: s3Key
            };
            
            // Log the full job data with audio URL
            console.log("Job data with audio:", JSON.stringify(jobData, null, 2));
          } catch (uploadError) {
            console.error("Error in S3 upload:", uploadError);
            toast.error("Error uploading audio: " + (uploadError instanceof Error ? uploadError.message : String(uploadError)));
            throw uploadError;
          }
        } catch (error) {
          console.error("Error preparing audio:", error);
          toast.error("Failed to process audio description. Job will be submitted without audio.");
        }
      } else {
        console.log("No audio blob available for upload");
      }
      
      // Save to Firestore with explicit handling
      try {
        console.log("Saving job data to Firestore:", JSON.stringify(jobData, null, 2));
        const jobRef = doc(db, "jobs", jobId);
        await setDoc(jobRef, jobData);
        console.log("Job data saved successfully with ID:", jobId);
      } catch (firestoreError) {
        console.error("Error saving to Firestore:", firestoreError);
        toast.error("Failed to save job data. Please try again.");
        throw firestoreError;
      }
      
      // Success! Redirect to confirmation page
      toast.success("Job posted successfully! It's now pending review.");
      router.push("/job-posted");
    } catch (error) {
      console.error("Error submitting job:", error);
      toast.error("Failed to submit job. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Initialize Google Maps 
  const initializeMap = useCallback(() => {
    console.log("Initializing map...");
    setMapError(null);
    
    if (!mapRef.current) {
      console.error("Map reference not found");
      setMapError("Map container not found");
      return;
    }
    
    if (typeof window.google === 'undefined' || typeof window.google.maps === 'undefined') {
      console.error("Google Maps not loaded");
      setMapError("Google Maps API not loaded");
      return;
    }
    
    try {
      console.log("Creating map with coordinates:", location.lat, location.lng);
      
      const mapOptions: google.maps.MapOptions = {
        center: { lat: location.lat, lng: location.lng },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      };
      
      // Create new map instance
      googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
      
      // Create marker
      markerRef.current = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: googleMapRef.current,
        draggable: true,
      });
      
      // Set up event listener for marker drag end
      markerRef.current.addListener('dragend', () => {
        if (markerRef.current) {
          const position = markerRef.current.getPosition();
          if (position) {
            const newLocation = {
              lat: position.lat(),
              lng: position.lng(),
            };
            setLocation(prev => ({ ...prev, ...newLocation }));
          }
        }
      });
      
      // Also allow clicking on map to set marker
      googleMapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (markerRef.current && e.latLng) {
          markerRef.current.setPosition(e.latLng);
          const newLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          setLocation(prev => ({ ...prev, ...newLocation }));
        }
      });
      
      console.log("Map initialized successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(`Error initializing map: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [location.lat, location.lng]);

  // External initialization function for Google Maps
  useEffect(() => {
    // Define the global callback function that Google Maps will call
    window.initMap = () => {
      console.log("Google Maps API loaded via callback");
      scriptLoaded.current = true;
      setMapLoaded(true);
      
      if (showMap && mapRef.current && !googleMapRef.current) {
        initializeMap();
      }
    };
    
    return () => {
      // Clean up - fix delete operator error
      window.initMap = () => {}; // Replace with empty function rather than deleting
    };
  }, [showMap, initializeMap]);

  // Toggle map visibility
  const toggleMap = useCallback(() => {
    setShowMap(prev => !prev);
  }, []);

  // Initialize map when map container becomes visible and script is loaded
  useEffect(() => {
    console.log("Map visibility changed:", showMap, "Map loaded:", mapLoaded);
    
    if (showMap) {
      if (mapLoaded && mapRef.current) {
        if (!googleMapRef.current) {
          console.log("Creating new map instance");
          setTimeout(initializeMap, 100);
        } else {
          console.log("Map already exists, refreshing");
          try {
            // If map already exists, trigger resize and update center
            window.google?.maps?.event.trigger(googleMapRef.current, 'resize');
            googleMapRef.current.setCenter({ lat: location.lat, lng: location.lng });
          } catch (error) {
            console.error("Error refreshing map:", error);
            // If there was an error, try reinitializing the map
            googleMapRef.current = null;
            markerRef.current = null;
            setTimeout(initializeMap, 100);
          }
        }
      } else {
        console.log("Map or script not ready yet");
      }
    }
  }, [showMap, mapLoaded, location.lat, location.lng, initializeMap]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`}
        strategy="lazyOnload"
      />
      
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Parttimejob
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="mr-2 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
            </Button>
            <Button variant="ghost" size="icon" className="mr-2 relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage 
                      src={`${profile?.profilePicture || profile?.photoURL || user?.photoURL || "/placeholder-user.jpg"}?t=${Date.now()}`}
                      alt={profile?.firstName || user?.displayName || "User"} 
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = "/placeholder-user.jpg";
                      }}
                    />
                    <AvatarFallback>
                      {profile?.firstName?.[0]?.toUpperCase() || user?.displayName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
          </div>
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

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
          <p className="text-muted-foreground mb-8">
            Fill out the form below to post your part-time job opportunity.
          </p>

          <form onSubmit={handleSubmit}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Provide the basic information about the job you're posting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Weekend Barista, Event Photographer"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className={formErrors.title ? "border-red-500" : ""}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company/Organization</Label>
                    <Input
                      id="company"
                      placeholder="Your company name"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className={formErrors.company ? "border-red-500" : ""}
                    />
                    {formErrors.company && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.company}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryType">Salary Type</Label>
                    <Select 
                      required
                      value={formData.salaryType}
                      onValueChange={(value) => handleSelectChange(value, "salaryType")}
                    >
                      <SelectTrigger id="salaryType" className={formErrors.salaryType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select salary type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Per Hour</SelectItem>
                        <SelectItem value="daily">Per Day</SelectItem>
                        <SelectItem value="weekly">Per Week</SelectItem>
                        <SelectItem value="monthly">Per Month</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.salaryType && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.salaryType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="positions">Number of Positions</Label>
                    <Input
                      id="positions"
                      type="number"
                      min="1"
                      placeholder="Number of people needed"
                      required
                      value={formData.positions}
                      onChange={handleChange}
                      className={formErrors.positions ? "border-red-500" : ""}
                    />
                    {formErrors.positions && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.positions}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender Preference</Label>
                    <Select 
                      required
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange(value, "gender")}
                    >
                      <SelectTrigger id="gender" className={formErrors.gender ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select gender preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male Only</SelectItem>
                        <SelectItem value="female">Female Only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.gender && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.gender}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Age Range Required</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minAge" className="text-sm text-muted-foreground">Minimum Age (18+)</Label>
                        <Input
                          id="minAge"
                          type="number"
                          min="18"
                          value={formData.minAge}
                          onChange={handleChange}
                          className={`mt-1 ${formErrors.minAge ? "border-red-500" : ""}`}
                          required
                        />
                        {formErrors.minAge && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.minAge}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="maxAge" className="text-sm text-muted-foreground">Maximum Age</Label>
                        <Input
                          id="maxAge"
                          type="number"
                          min="18"
                          value={formData.maxAge}
                          onChange={handleChange}
                          className={`mt-1 ${formErrors.maxAge ? "border-red-500" : ""}`}
                          required
                        />
                        {formErrors.maxAge && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.maxAge}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Job Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={handleChange}
                      className={formErrors.startDate ? "border-red-500" : ""}
                    />
                    {formErrors.startDate && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Job End Date (if applicable)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={formErrors.endDate ? "border-red-500" : ""}
                    />
                    <p className="text-xs text-muted-foreground">Leave blank for ongoing positions</p>
                    {formErrors.endDate && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Job Description</Label>
                    <div className="flex flex-col gap-4">
                      <div className="border rounded-md p-4 bg-muted/30">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Voice Description</h4>
                          <p className="text-xs text-muted-foreground mb-4">Record a voice description of the job (max 2 minutes)</p>
                        
                          <div className="flex items-center gap-2 mb-3">
                            {!isRecording && !audioUrl && (
                              <Button 
                                type="button"
                                onClick={startRecording}
                                className="flex items-center gap-2"
                                variant="secondary"
                                size="sm"
                              >
                                <Mic className="h-4 w-4" />
                                Start Recording
                              </Button>
                            )}
                            
                            {isRecording && !isPaused && (
                              <>
                                <Button 
                                  type="button"
                                  onClick={pauseRecording}
                                  className="flex items-center gap-2"
                                  variant="outline"
                                  size="sm"
                                >
                                  <Pause className="h-4 w-4" />
                                  Pause
                                </Button>
                                <Button 
                                  type="button"
                                  onClick={stopRecording}
                                  className="flex items-center gap-2"
                                  variant="destructive"
                                  size="sm"
                                >
                                  <Square className="h-4 w-4" />
                                  Stop
                                </Button>
                              </>
                            )}
                            
                            {isRecording && isPaused && (
                              <>
                                <Button 
                                  type="button"
                                  onClick={resumeRecording}
                                  className="flex items-center gap-2"
                                  variant="outline"
                                  size="sm"
                                >
                                  <Play className="h-4 w-4" />
                                  Resume
                                </Button>
                                <Button 
                                  type="button"
                                  onClick={stopRecording}
                                  className="flex items-center gap-2"
                                  variant="destructive"
                                  size="sm"
                                >
                                  <Square className="h-4 w-4" />
                                  Stop
                                </Button>
                              </>
                            )}
                            
                            {audioUrl && !isRecording && (
                              <>
                                <audio 
                                  ref={audioRef} 
                                  src={audioUrl} 
                                  controls 
                                  className="w-full max-w-[300px] h-10"
                                />
                                <div className="flex gap-2 mt-2">
                                  <Button 
                                    type="button"
                                    onClick={() => {
                                      setAudioBlob(null);
                                      setAudioUrl(null);
                                      setRecordingTime(0);
                                    }}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    Delete Recording
                                  </Button>
                                  <Button 
                                    type="button"
                                    onClick={startRecording}
                                    variant="outline"
                                    size="sm"
                                  >
                                    Record Again
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {isRecording && (
                            <div className="mb-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Recording {isPaused ? "(Paused)" : ""}</span>
                                <span>{formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}</span>
                              </div>
                              <Progress value={(recordingTime / MAX_RECORDING_TIME) * 100} className="h-2" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Or type your description below</h4>
                          <Textarea
                            id="description"
                            placeholder="Describe the responsibilities, requirements, and any other relevant details"
                            value={formData.description}
                            onChange={handleChange}
                            className={`min-h-[150px] ${formErrors.description ? "border-red-500" : ""}`}
                          />
                          {audioUrl && (
                            <p className="text-xs text-amber-600 mt-1">
                              You have provided both a voice and text description. Both will be available to applicants.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Job Category</Label>
                    <Select 
                      required
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange(value, "category")}
                    >
                      <SelectTrigger id="category" className={formErrors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food-service">Food Service</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="admin">Administrative</SelectItem>
                        <SelectItem value="customer-service">Customer Service</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="creative">Creative & Design</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="labor">Manual Labor</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.category && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Required Skills (Optional)</Label>
                    <Input
                      id="skills"
                      placeholder="e.g. Customer service, Excel, Photography"
                      value={formData.skills}
                      onChange={handleChange}
                      className={formErrors.skills ? "border-red-500" : ""}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Schedule & Compensation</CardTitle>
                <CardDescription>
                  Provide details about the work schedule and payment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Job Type</Label>
                  <RadioGroup
                    defaultValue="part-time"
                    className="flex flex-col space-y-2"
                    value={formData.jobType}
                    onValueChange={(value) => handleSelectChange(value, "jobType")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="part-time" id="part-time" />
                      <Label htmlFor="part-time" className="font-normal">
                        Part-time (Regular schedule)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="temporary" id="temporary" />
                      <Label htmlFor="temporary" className="font-normal">
                        Temporary/Seasonal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="one-time" id="one-time" />
                      <Label htmlFor="one-time" className="font-normal">
                        One-time job
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="internship" id="internship" />
                      <Label htmlFor="internship" className="font-normal">
                        Internship
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours per Week</Label>
                    <Select 
                      required
                      value={formData.hours}
                      onValueChange={(value) => handleSelectChange(value, "hours")}
                    >
                      <SelectTrigger id="hours" className={formErrors.hours ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less-than-10">
                          Less than 10 hours
                        </SelectItem>
                        <SelectItem value="10-15">10-15 hours</SelectItem>
                        <SelectItem value="15-20">15-20 hours</SelectItem>
                        <SelectItem value="20-30">20-30 hours</SelectItem>
                        <SelectItem value="flexible">Flexible hours</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.hours && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.hours}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select 
                      required
                      value={formData.duration}
                      onValueChange={(value) => handleSelectChange(value, "duration")}
                    >
                      <SelectTrigger id="duration" className={formErrors.duration ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time task</SelectItem>
                        <SelectItem value="less-than-month">
                          Less than a month
                        </SelectItem>
                        <SelectItem value="1-3-months">1-3 months</SelectItem>
                        <SelectItem value="3-6-months">3-6 months</SelectItem>
                        <SelectItem value="6-12-months">6-12 months</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.duration && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.duration}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pay-type">Pay Type</Label>
                    <Select 
                      required
                      value={formData.payType}
                      onValueChange={(value) => handleSelectChange(value, "payType")}
                    >
                      <SelectTrigger id="pay-type" className={formErrors.payType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select pay type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly rate</SelectItem>
                        <SelectItem value="fixed">Fixed price</SelectItem>
                        <SelectItem value="commission">Commission</SelectItem>
                        <SelectItem value="volunteer">
                          Volunteer/Unpaid
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.payType && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.payType}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryAmount">Salary Amount (per person)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                      <Input
                        id="salaryAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        className={`pl-7 ${formErrors.salaryAmount ? "border-red-500" : ""}`}
                        placeholder="Enter amount"
                        required
                        value={formData.salaryAmount}
                        onChange={handleChange}
                      />
                    </div>
                    {formErrors.salaryAmount && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.salaryAmount}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Location & Contact</CardTitle>
                <CardDescription>
                  Provide location details and how applicants should contact
                  you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Work Location</Label>
                  <RadioGroup
                    defaultValue="on-site"
                    className="flex flex-col space-y-2"
                    value={workLocation}
                    onValueChange={setWorkLocation}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="on-site" id="on-site" />
                      <Label htmlFor="on-site" className="font-normal">
                        On-site
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="remote" id="remote" />
                      <Label htmlFor="remote" className="font-normal">
                        Work from home
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {workLocation === "on-site" && (
                  <>
                    <div className="space-y-4">
                      <Label>Select Location on Map</Label>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1 flex items-center justify-center gap-2"
                          onClick={toggleMap}
                        >
                          <MapPin className="h-4 w-4" />
                          {showMap ? "Hide Map" : "Show Map to Select Location"}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="secondary"
                          className="flex items-center justify-center gap-2"
                          onClick={getCurrentLocation}
                          disabled={isLoadingLocation}
                        >
                          {isLoadingLocation ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                          My Location
                        </Button>
                      </div>
                      
                      {mapError && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs">
                          Error: {mapError}
                          <Button 
                            type="button" 
                            variant="link" 
                            className="text-xs underline text-red-700 p-0 h-auto ml-2"
                            onClick={() => {
                              setMapError(null);
                              if (showMap) {
                                googleMapRef.current = null;
                                initializeMap();
                              }
                            }}
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                      
                      {showMap && (
                        <div className="border rounded-md overflow-hidden">
                          <div 
                            ref={mapRef} 
                            className="h-[350px] w-full"
                          ></div>
                          <div className="bg-muted p-2 text-xs text-muted-foreground">
                            Click on the map or drag the marker to select your precise location
                          </div>
                        </div>
                      )}
                      
                      {location.lat && location.lng && (
                        <div className="text-xs text-muted-foreground">
                          Selected coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">
                        Address
                      </Label>
                      <Input 
                        id="address" 
                        placeholder="Street address" 
                        required 
                        value={formData.address}
                        onChange={handleChange}
                        className={formErrors.address ? "border-red-500" : ""}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          placeholder="City" 
                          required 
                          value={formData.city}
                          onChange={handleChange}
                          className={formErrors.city ? "border-red-500" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input 
                          id="state" 
                          placeholder="State" 
                          required 
                          value={formData.state}
                          onChange={handleChange}
                          className={formErrors.state ? "border-red-500" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP/Postal Code</Label>
                        <Input 
                          id="zip" 
                          placeholder="ZIP code" 
                          required 
                          value={formData.zip}
                          onChange={handleChange}
                          className={formErrors.zip ? "border-red-500" : ""}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="application-instructions">
                    Application Instructions (Optional)
                  </Label>
                  <Textarea
                    id="application-instructions"
                    placeholder="Provide any specific instructions for applicants"
                    value={formData.applicationInstructions}
                    onChange={handleChange}
                    className={formErrors.applicationInstructions ? "border-red-500" : ""}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Add contact persons for this job posting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {contacts.map((contact: Contact, index: number) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <Input 
                            id={`contact-name-${index}`}
                            placeholder="Contact person name"
                            required
                            value={contact.name}
                            onChange={(e) => {
                              const newContacts = [...contacts];
                              newContacts[index].name = e.target.value;
                              setContacts(newContacts);
                            }}
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">+91</span>
                          <Input
                            id={`contact-phone-${index}`}
                            type="tel"
                            className="pl-12"
                            placeholder="Phone number"
                            required
                            value={contact.phone}
                            onChange={(e) => {
                              const newContacts = [...contacts];
                              newContacts[index].phone = e.target.value;
                              setContacts(newContacts);
                            }}
                          />
                        </div>
                      </div>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            const newContacts = [...contacts];
                            newContacts.splice(index, 1);
                            setContacts(newContacts);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setContacts([...contacts, { name: "", phone: "" }])}
                    className="mt-2"
                  >
                    Add Another Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    required
                    checked={formData.termsAccepted}
                    onCheckedChange={handleCheckboxChange}
                    className={formErrors.termsAccepted ? "border-red-500" : ""}
                  />
                  <Label htmlFor="terms" className="font-normal">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                    >
                      Terms and Conditions
                    </Link>
                  </Label>
                </div>
                {formErrors.termsAccepted && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.termsAccepted}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : "Submit for Review"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </main>

      <footer className="bg-background border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Parttimejob. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
