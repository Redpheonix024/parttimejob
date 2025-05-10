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
import {
  ArrowLeft,
  MapPin,
  Loader2,
  Mic,
  Square,
  Play,
  Pause,
  Link2,
  Unlink2,
} from "lucide-react";
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
import {
  doc,
  setDoc,
  collection,
  Timestamp,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { uploadToS3 } from "@/app/utils/aws-config";
import { v4 as uuidv4 } from "uuid";
import dynamic from "next/dynamic";
import { checkAdminRole } from "@/app/utils/admin";
import AdminLayout from "@/components/admin/admin-layout";

// Add type declarations for Window interface
declare global {
  interface Window {
    initMap: () => void;
  }
}

// Define a proper interface for contacts
interface Contact {
  name: string;
  phone: string;
}

// Define interface for location data
interface LocationData {
  lat: number;
  lng: number;
}

// Define interface for address data
interface AddressData {
  address: string;
  city: string;
  state: string;
  zip: string;
  buildingName: string; // Add new field for building name/number
}

// Define interface for form data
interface FormData {
  title: string;
  company: string;
  salaryType: string;
  salaryAmount: string;
  positions: string;
  gender: string;
  minAge: string;
  maxAge: string;
  startDate: string;
  endDate: string;
  description: string;
  category: string;
  skills: string;
  jobType: string;
  hours: string;
  duration: string;
  payType: string;
  applicationInstructions: string;
  termsAccepted: boolean;
  address: string;
  city: string;
  state: string;
  zip: string;
  buildingName: string; // Building number or house name
}

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full bg-muted animate-pulse rounded-md" />
  ),
});

export default function PostJob() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile, getProfilePicture } = useUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workLocation, setWorkLocation] = useState("on-site");
  const [location, setLocation] = useState<LocationData>({
    lat: 10.52753, // Default to Thrissur, Kerala
    lng: 76.214514, // Default to Thrissur, Kerala
  });
  const [address, setAddress] = useState<AddressData>({
    address: "",
    city: "",
    state: "",
    zip: "",
    buildingName: "", // Initialize building name field
  });
  const [showMap, setShowMap] = useState(true); // Open map by default
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([
    { name: "", phone: "" },
  ]);
  const [mapLoaded, setMapLoaded] = useState(false);
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

  const [formData, setFormData] = useState<FormData>({
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
    applicationInstructions: "",
    termsAccepted: false,
    address: "",
    city: "",
    state: "",
    zip: "",
    buildingName: "", // Initialize building name field
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Add state for map attachment
  const [isMapAttached, setIsMapAttached] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);

  // Add state to track if admin contact has been initialized
  const [adminContactInitialized, setAdminContactInitialized] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const hasAdminRole = await checkAdminRole(user.uid);
        setIsAdmin(hasAdminRole);

        // If user is admin and we haven't initialized the admin contact yet
        if (hasAdminRole && !adminContactInitialized) {
          try {
            // Get the admin's actual name from their profile
            const userDoc = await getDoc(doc(db, "users", user.uid));
            let adminName = "Admin"; // Default if no name found
            let adminPhone = ""; // Default empty phone

            if (userDoc.exists()) {
              const userData = userDoc.data();
              // Use actual admin name if available
              if (userData.firstName && userData.lastName) {
                adminName = `${userData.firstName} ${userData.lastName}`.trim();
              } else if (userData.displayName) {
                adminName = userData.displayName;
              } else if (user.displayName) {
                adminName = user.displayName;
              }

              // Use admin phone if available
              if (userData.phone) {
                adminPhone = userData.phone;
              } else if (user.phoneNumber) {
                adminPhone = user.phoneNumber;
              }
            }

            setContacts([
              {
                name: adminName,
                phone: adminPhone,
              },
            ]);
          } catch (error) {
            console.error("Error fetching admin profile:", error);
            // Fallback to generic admin contact if there's an error
            setContacts([
              {
                name: "Admin",
                phone: "",
              },
            ]);
          }

          setAdminContactInitialized(true);
        }
      }
    };
    checkAdmin();
  }, [user, adminContactInitialized, db]);

  // Voice recording
  const startRecording = async () => {
    audioChunksRef.current = [];
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Use a more compatible MIME type and set options properly
      const options = { mimeType: "audio/webm;codecs=opus" };
      let mediaRecorder;

      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (err) {
        console.log(
          "MediaRecorder with specified options failed, trying default"
        );
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
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const audioUrl = URL.createObjectURL(audioBlob);

          setAudioBlob(audioBlob);
          setAudioUrl(audioUrl);
        } catch (error) {
          console.error("Error creating audio blob:", error);
          toast.error(
            "There was an error processing the recording. Please try again."
          );
        }

        // Stop all audio tracks
        stream.getAudioTracks().forEach((track) => track.stop());
      };

      // Request data at regular intervals to ensure we collect data
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prevTime + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        "Could not access microphone. Please check your browser permissions."
      );
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
        setRecordingTime((prevTime) => {
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
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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

  // Handle map click to update location
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setLocation({ lat, lng }); // Always update marker position

      if (!isMapAttached) {
        return; // Do not geocode and update form fields if map is detached
      }

      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();

        if (data.address) {
          const address = data.address;
          setFormData((prev) => ({
            ...prev,
            address:
              address.road || address.highway || address.pedestrian || "",
            city:
              address.city ||
              address.town ||
              address.village ||
              address.suburb ||
              "",
            state: address.state || address.region || "",
            zip: address.postcode || "",
          }));
        }
      } catch (error) {
        console.error("Error getting address:", error);
        toast.error("Could not fetch address details");
      }
    },
    [isMapAttached]
  ); // Added isMapAttached

  // Handle address search
  const handleAddressSearch = useCallback(async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });

        // Get address details
        const addressResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
        );
        const addressData = await addressResponse.json();

        if (addressData.address) {
          const address = addressData.address;
          setFormData((prev) => ({
            ...prev,
            address:
              address.road || address.highway || address.pedestrian || "",
            city:
              address.city ||
              address.town ||
              address.village ||
              address.suburb ||
              "",
            state: address.state || address.region || "",
            zip: address.postcode || "",
          }));
        }
      } else {
        toast.error("No location found for the given address");
      }
    } catch (error) {
      console.error("Error searching address:", error);
      toast.error("Could not search for the address");
    }
  }, []);

  // Get user's current location using browser's geolocation
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setMapError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoadingLocation(true);
    setMapError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setLocation({
          // Always update map center
          lat: latitude,
          lng: longitude,
        });

        if (isMapAttached) {
          // Check if map is attached
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            if (data.address) {
              const address = data.address;
              setFormData((prev) => ({
                ...prev,
                address:
                  address.road || address.highway || address.pedestrian || "",
                city:
                  address.city ||
                  address.town ||
                  address.village ||
                  address.suburb ||
                  "",
                state: address.state || address.region || "",
                zip: address.postcode || "",
              }));
            }
          } catch (error) {
            console.error("Error getting address:", error);
            toast.error("Could not fetch address details");
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
  }, [isMapAttached]); // Added isMapAttached

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear error for this field if it exists
    if (formErrors[id]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // Handle select change
  const handleSelectChange = (value: string, id: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear error for this field if it exists
    if (formErrors[id]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      termsAccepted: checked,
    }));

    // Clear error if it exists
    if (formErrors.termsAccepted) {
      setFormErrors((prev) => {
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
    if (!formData.salaryAmount)
      errors.salaryAmount = "Salary amount is required";
    if (!formData.positions)
      errors.positions = "Number of positions is required";
    if (!formData.gender) errors.gender = "Gender preference is required";
    if (!formData.category) errors.category = "Job category is required";

    // Only check terms for non-admin users
    if (!isAdmin && !formData.termsAccepted) {
      errors.termsAccepted = "You must accept the terms and conditions";
    }

    // Add validation for description (either voice or text)
    if (!audioUrl && !formData.description.trim()) {
      errors.description = "Please provide either a voice or text description";
    }

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
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
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
      const formattedContacts = contacts
        .map((contact: Contact, index: number) => {
          const nameElement = document.getElementById(
            `contact-name-${index}`
          ) as HTMLInputElement;
          const phoneElement = document.getElementById(
            `contact-phone-${index}`
          ) as HTMLInputElement;

          return {
            name: nameElement?.value || contact.name || "",
            phone: phoneElement?.value || contact.phone || "",
          };
        })
        .filter((contact: Contact) => contact.name && contact.phone);

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
        skills: formData.skills
          ? formData.skills.split(",").map((skill) => skill.trim())
          : [],
        jobType: formData.jobType,
        hours: formData.hours,
        duration: formData.duration,
        payType: formData.payType,
        workLocation: workLocation,
        contacts: formattedContacts,
        applicationInstructions: formData.applicationInstructions,
        status: isAdmin ? "Active" : "Draft", // Set status as Active for admin, Draft for normal users
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Add location data if on-site
      if (workLocation === "on-site") {
        // Create a Google Maps URL for the location
        const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

        jobData.location = {
          buildingName: formData.buildingName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          coordinates: {
            lat: location.lat,
            lng: location.lng,
          },
          googleMapsUrl: googleMapsUrl, // Add Google Maps URL
        };
      }

      // Upload audio to S3 if exists
      if (audioBlob) {
        try {
          // Create a more robust file object with proper MIME type
          const fileType = "audio/webm";
          const fileName = `job-audio-${jobId}.webm`;
          const audioFile = new File([audioBlob], fileName, { type: fileType });

          const s3Key = `job-descriptions/${
            user.uid
          }/${jobId}-${Date.now()}.webm`;

          // Log the file details for debugging
          console.log("Uploading audio file:", {
            name: audioFile.name,
            type: audioFile.type,
            size: audioFile.size,
          });

          try {
            const audioFileUrl = await uploadToS3(audioFile, s3Key);
            console.log("Audio file uploaded successfully:", audioFileUrl);

            // Add audio data to job data
            jobData.audioDescription = {
              url: audioFileUrl,
              duration: recordingTime,
              key: s3Key,
            };

            // Log the full job data with audio URL
            console.log(
              "Job data with audio:",
              JSON.stringify(jobData, null, 2)
            );
          } catch (uploadError) {
            console.error("Error in S3 upload:", uploadError);
            toast.error(
              "Error uploading audio: " +
                (uploadError instanceof Error
                  ? uploadError.message
                  : String(uploadError))
            );
            throw uploadError;
          }
        } catch (error) {
          console.error("Error preparing audio:", error);
          toast.error(
            "Failed to process audio description. Job will be submitted without audio."
          );
        }
      } else {
        console.log("No audio blob available for upload");
      }

      // Save to Firestore with explicit handling
      try {
        console.log(
          "Saving job data to Firestore:",
          JSON.stringify(jobData, null, 2)
        );
        const jobRef = doc(db, "jobs", jobId);
        await setDoc(jobRef, jobData);
        console.log("Job data saved successfully with ID:", jobId);
      } catch (firestoreError) {
        console.error("Error saving to Firestore:", firestoreError);
        toast.error("Failed to save job data. Please try again.");
        throw firestoreError;
      }

      // Success! Redirect to confirmation page
      toast.success(
        isAdmin
          ? "Job posted successfully!"
          : "Job saved as draft. It will be reviewed before publishing."
      );
      router.push(isAdmin ? "/admin/jobs" : "/dashboard/jobs");
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

    if (
      typeof window.google === "undefined" ||
      typeof window.google.maps === "undefined"
    ) {
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
      googleMapRef.current = new window.google.maps.Map(
        mapRef.current,
        mapOptions
      );

      // Create marker
      markerRef.current = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: googleMapRef.current,
        draggable: true,
      });

      // Set up event listener for marker drag end
      markerRef.current.addListener("dragend", () => {
        if (markerRef.current) {
          const position = markerRef.current.getPosition();
          if (position) {
            const newLocation = {
              lat: position.lat(),
              lng: position.lng(),
            };
            setLocation((prev) => ({ ...prev, ...newLocation }));
          }
        }
      });

      // Also allow clicking on map to set marker
      googleMapRef.current.addListener(
        "click",
        (e: google.maps.MapMouseEvent) => {
          if (markerRef.current && e.latLng) {
            markerRef.current.setPosition(e.latLng);
            const newLocation = {
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            };
            setLocation((prev) => ({ ...prev, ...newLocation }));
          }
        }
      );

      console.log("Map initialized successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(
        `Error initializing map: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
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
    setShowMap((prev) => !prev);
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
            window.google?.maps?.event.trigger(googleMapRef.current, "resize");
            googleMapRef.current.setCenter({
              lat: location.lat,
              lng: location.lng,
            });
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
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return isAdmin ? (
    <AdminLayout activeLink="jobs" title="Post Job">
      {/* Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />

      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Post a Job</h1>
            {isAdmin && (
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                Admin
              </span>
            )}
          </div>
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
                    placeholder="e.g. Cattering,loading unloading etc"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className={formErrors.title ? "border-red-500" : ""}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Agency Name</Label>
                    <Input
                      id="company"
                      placeholder="Agency name if you wish to specify the agency"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className={formErrors.company ? "border-red-500" : ""}
                    />
                    {formErrors.company && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.company}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryType">Salary Type</Label>
                    <Select
                      required
                      value={formData.salaryType}
                      onValueChange={(value) =>
                        handleSelectChange(value, "salaryType")
                      }
                    >
                      <SelectTrigger
                        id="salaryType"
                        className={
                          formErrors.salaryType ? "border-red-500" : ""
                        }
                      >
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
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.salaryType}
                      </p>
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
                      onChange={(e) => {
                        const value = Math.abs(
                          Math.floor(Number(e.target.value))
                        );
                        // Create a synthetic event object that matches the expected type
                        const syntheticEvent = {
                          target: { id: "positions", value: value.toString() },
                          currentTarget: e.currentTarget,
                          bubbles: e.bubbles,
                          cancelable: e.cancelable,
                          defaultPrevented: e.defaultPrevented,
                          eventPhase: e.eventPhase,
                          isTrusted: e.isTrusted,
                          nativeEvent: e.nativeEvent,
                          preventDefault: e.preventDefault,
                          isDefaultPrevented: e.isDefaultPrevented,
                          stopPropagation: e.stopPropagation,
                          isPropagationStopped: e.isPropagationStopped,
                          persist: e.persist,
                          timeStamp: e.timeStamp,
                          type: e.type,
                        } as React.ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >;
                        handleChange(syntheticEvent);
                      }}
                      className={formErrors.positions ? "border-red-500" : ""}
                    />
                    {formErrors.positions && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.positions}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender Preference</Label>
                    <Select
                      required
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleSelectChange(value, "gender")
                      }
                    >
                      <SelectTrigger
                        id="gender"
                        className={formErrors.gender ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select gender preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male Only</SelectItem>
                        <SelectItem value="female">Female Only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.gender && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.gender}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Age Range Required</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="minAge"
                          className="text-sm text-muted-foreground"
                        >
                          Minimum Age (18+)
                        </Label>
                        <Input
                          id="minAge"
                          type="number"
                          min="18"
                          value={formData.minAge}
                          onChange={handleChange}
                          className={`mt-1 ${
                            formErrors.minAge ? "border-red-500" : ""
                          }`}
                          required
                        />
                        {formErrors.minAge && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.minAge}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="maxAge"
                          className="text-sm text-muted-foreground"
                        >
                          Maximum Age
                        </Label>
                        <Input
                          id="maxAge"
                          type="number"
                          min="18"
                          value={formData.maxAge}
                          onChange={handleChange}
                          className={`mt-1 ${
                            formErrors.maxAge ? "border-red-500" : ""
                          }`}
                          required
                        />
                        {formErrors.maxAge && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.maxAge}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Job Date(Working date)</Label>
                    <Input
                      id="startDate"
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={handleChange}
                      className={formErrors.startDate ? "border-red-500" : ""}
                    />
                    {formErrors.startDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.startDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">
                      Specify a date to withdraw the specific job listing(if not
                      applicaple leave blank)
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={formErrors.endDate ? "border-red-500" : ""}
                    />
                    {/* <p className="text-xs text-muted-foreground">
                      Leave blank for ongoing positions
                    </p> */}
                    {formErrors.endDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.endDate}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Provide a detailed description of the job responsibilities and
                  requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-muted/30">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">
                        Voice Description
                      </h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Record a voice description of the job (max 2 minutes).
                        This helps applicants better understand the role.
                      </p>

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
                            <div className="flex flex-col gap-3 bg-muted/50 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Mic className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    Voice Description
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(recordingTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <audio
                                  ref={audioRef}
                                  src={audioUrl}
                                  controls
                                  className="flex-1 h-10 [&::-webkit-media-controls-panel]:bg-muted/50 [&::-webkit-media-controls-current-time-display]:text-xs [&::-webkit-media-controls-time-remaining-display]:text-xs"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      setAudioBlob(null);
                                      setAudioUrl(null);
                                      setRecordingTime(0);
                                    }}
                                    variant="destructive"
                                    size="sm"
                                    className="h-8"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-4 w-4"
                                    >
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={startRecording}
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-4 w-4"
                                    >
                                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                      <line x1="12" y1="19" x2="12" y2="22" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {isRecording && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Recording {isPaused ? "(Paused)" : ""}</span>
                            <span>
                              {formatTime(recordingTime)} /{" "}
                              {formatTime(MAX_RECORDING_TIME)}
                            </span>
                          </div>
                          <Progress
                            value={(recordingTime / MAX_RECORDING_TIME) * 100}
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Text Description
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        Provide a detailed written description of the job.
                        Include responsibilities, requirements, and any other
                        relevant information.
                      </p>
                      <Textarea
                        id="description"
                        placeholder="Describe the responsibilities, requirements, and any other relevant details"
                        value={formData.description}
                        onChange={handleChange}
                        className={`min-h-[150px] ${
                          formErrors.description ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.description && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.description}
                        </p>
                      )}
                      {audioUrl && (
                        <p className="text-xs text-amber-600 mt-1">
                          You have provided both a voice and text description.
                          Both will be available to applicants.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Job Category</Label>
                    <Select
                      required
                      value={formData.category}
                      onValueChange={(value) =>
                        handleSelectChange(value, "category")
                      }
                    >
                      <SelectTrigger
                        id="category"
                        className={formErrors.category ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food-service">
                          Food Service
                        </SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="admin">Administrative</SelectItem>
                        <SelectItem value="customer-service">
                          Customer Service
                        </SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="creative">
                          Creative & Design
                        </SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="labor">Manual Labor</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.category && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.category}
                      </p>
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
                    <p className="text-xs text-muted-foreground">
                      Separate skills with commas
                    </p>
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
                    onValueChange={(value) =>
                      handleSelectChange(value, "jobType")
                    }
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
                      onValueChange={(value) =>
                        handleSelectChange(value, "hours")
                      }
                    >
                      <SelectTrigger
                        id="hours"
                        className={formErrors.hours ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less-than-10">
                          Less than 10 hours
                        </SelectItem>
                        <SelectItem value="unable-to-mention">
                          Unable to mention
                        </SelectItem>
                        <SelectItem value="10-15">10-15 hours</SelectItem>
                        <SelectItem value="15-20">15-20 hours</SelectItem>
                        <SelectItem value="20-30">20-30 hours</SelectItem>
                        <SelectItem value="flexible">Flexible hours</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.hours && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.hours}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      required
                      value={formData.duration}
                      onValueChange={(value) =>
                        handleSelectChange(value, "duration")
                      }
                    >
                      <SelectTrigger
                        id="duration"
                        className={formErrors.duration ? "border-red-500" : ""}
                      >
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
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.duration}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pay-type">Pay Type</Label>
                    <Select
                      required
                      value={formData.payType}
                      onValueChange={(value) =>
                        handleSelectChange(value, "payType")
                      }
                    >
                      <SelectTrigger
                        id="pay-type"
                        className={formErrors.payType ? "border-red-500" : ""}
                      >
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
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.payType}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryAmount">
                      Salary Amount (per person)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        ₹
                      </span>
                      <Input
                        id="salaryAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        className={`pl-7 ${
                          formErrors.salaryAmount ? "border-red-500" : ""
                        }`}
                        placeholder="Enter amount"
                        required
                        value={formData.salaryAmount}
                        onChange={handleChange}
                      />
                    </div>
                    {formErrors.salaryAmount && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.salaryAmount}
                      </p>
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
                      <div className="flex items-center justify-between">
                        <Label>Select Location on Map</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newAttachState = !isMapAttached;
                            setIsMapAttached(newAttachState);
                            // If attaching the map, show it; if detaching, hide it
                            setShowMap(newAttachState);
                          }}
                          className="flex items-center gap-2"
                        >
                          {isMapAttached ? (
                            <>
                              <Unlink2 className="h-4 w-4" />
                              <span className="text-sm">Detach Map</span>
                            </>
                          ) : (
                            <>
                              <Link2 className="h-4 w-4" />
                              <span className="text-sm">Attach Map</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-2"
                          onClick={() => setShowMap(!showMap)}
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
                                getCurrentLocation();
                              }
                            }}
                          >
                            Retry
                          </Button>
                        </div>
                      )}

                      {showMap && (
                        <div className="border rounded-md overflow-hidden">
                          <Map
                            center={[location.lat, location.lng]}
                            onMapClick={handleMapClick}
                            markerPosition={[location.lat, location.lng]}
                          />
                          <div className="bg-muted p-2 text-xs text-muted-foreground">
                            Click on the map or drag the marker to select your
                            precise location
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="buildingName">
                            Building No/House Name please fill this feild
                          </Label>
                          <Input
                            id="buildingName"
                            placeholder="Enter building number or house name"
                            value={formData.buildingName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                buildingName: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            placeholder="Enter address to search"
                            value={formData.address}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }));
                              if (isMapAttached) {
                                handleAddressSearch(e.target.value);
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            disabled={!isMapAttached}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province</Label>
                          <Input
                            id="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                state: e.target.value,
                              }))
                            }
                            disabled={!isMapAttached}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zip">ZIP/Postal Code</Label>
                          <Input
                            id="zip"
                            placeholder="ZIP code"
                            value={formData.zip}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                zip: e.target.value,
                              }))
                            }
                            disabled={!isMapAttached}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="applicationInstructions">
                    Application Instructions
                  </Label>
                  <Textarea
                    id="applicationInstructions"
                    placeholder="Provide any specific instructions for applicants"
                    value={formData.applicationInstructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        applicationInstructions: e.target.value,
                      }))
                    }
                    className={
                      formErrors.applicationInstructions ? "border-red-500" : ""
                    }
                  />
                  {formErrors.applicationInstructions && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.applicationInstructions}
                    </p>
                  )}
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
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            +91
                          </span>
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setContacts([...contacts, { name: "", phone: "" }])
                    }
                    className="mt-2"
                  >
                    Add Another Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Remove terms and conditions card for admin */}
            {!isAdmin && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Terms and Conditions</CardTitle>
                  <CardDescription>
                    Please review and accept the terms and conditions before
                    submitting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="termsAccepted"
                        checked={formData.termsAccepted}
                        onCheckedChange={handleCheckboxChange}
                        className={
                          formErrors.termsAccepted ? "border-red-500" : ""
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="termsAccepted"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Accept Terms and Conditions
                        </label>
                        <p className="text-sm text-muted-foreground">
                          By checking this box, you agree to our terms and
                          conditions
                        </p>
                      </div>
                    </div>
                  </div>
                  {formErrors.termsAccepted && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.termsAccepted}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : isAdmin ? (
                  "Post Job"
                ) : (
                  "Submit for Review"
                )}
              </Button>
            </CardFooter>
          </form>
        </div>
      </main>
    </AdminLayout>
  ) : (
    <div className="min-h-screen bg-background">
      {/* Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
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
                      src={`${
                        profile?.profilePicture ||
                        profile?.photoURL ||
                        user?.photoURL ||
                        "/placeholder-user.jpg"
                      }?t=${Date.now()}`}
                      alt={profile?.firstName || user?.displayName || "User"}
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = "/placeholder-user.jpg";
                      }}
                    />
                    <AvatarFallback>
                      {profile?.firstName?.[0]?.toUpperCase() ||
                        user?.displayName?.[0] ||
                        "U"}
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
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Post a Job</h1>
            {isAdmin && (
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                Admin
              </span>
            )}
          </div>
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
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.title}
                    </p>
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
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.company}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryType">Salary Type</Label>
                    <Select
                      required
                      value={formData.salaryType}
                      onValueChange={(value) =>
                        handleSelectChange(value, "salaryType")
                      }
                    >
                      <SelectTrigger
                        id="salaryType"
                        className={
                          formErrors.salaryType ? "border-red-500" : ""
                        }
                      >
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
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.salaryType}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="positions">Number of Positions</Label>
                    <Input
                      id="positions"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Number of people needed"
                      required
                      value={formData.positions}
                      onChange={(e) => {
                        const value = Math.abs(
                          Math.floor(Number(e.target.value))
                        );
                        // Create a synthetic event object that matches the expected type
                        const syntheticEvent = {
                          target: { id: "positions", value: value.toString() },
                          currentTarget: e.currentTarget,
                          bubbles: e.bubbles,
                          cancelable: e.cancelable,
                          defaultPrevented: e.defaultPrevented,
                          eventPhase: e.eventPhase,
                          isTrusted: e.isTrusted,
                          nativeEvent: e.nativeEvent,
                          preventDefault: e.preventDefault,
                          isDefaultPrevented: e.isDefaultPrevented,
                          stopPropagation: e.stopPropagation,
                          isPropagationStopped: e.isPropagationStopped,
                          persist: e.persist,
                          timeStamp: e.timeStamp,
                          type: e.type,
                        } as React.ChangeEvent<
                          HTMLInputElement | HTMLTextAreaElement
                        >;
                        handleChange(syntheticEvent);
                      }}
                      className={formErrors.positions ? "border-red-500" : ""}
                    />
                    {formErrors.positions && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.positions}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender Preference</Label>
                    <Select
                      required
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleSelectChange(value, "gender")
                      }
                    >
                      <SelectTrigger
                        id="gender"
                        className={formErrors.gender ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select gender preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male Only</SelectItem>
                        <SelectItem value="female">Female Only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.gender && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.gender}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Age Range Required</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="minAge"
                          className="text-sm text-muted-foreground"
                        >
                          Minimum Age (18+)
                        </Label>
                        <Input
                          id="minAge"
                          type="number"
                          min="18"
                          value={formData.minAge}
                          onChange={handleChange}
                          className={`mt-1 ${
                            formErrors.minAge ? "border-red-500" : ""
                          }`}
                          required
                        />
                        {formErrors.minAge && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.minAge}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="maxAge"
                          className="text-sm text-muted-foreground"
                        >
                          Maximum Age
                        </Label>
                        <Input
                          id="maxAge"
                          type="number"
                          min="18"
                          value={formData.maxAge}
                          onChange={handleChange}
                          className={`mt-1 ${
                            formErrors.maxAge ? "border-red-500" : ""
                          }`}
                          required
                        />
                        {formErrors.maxAge && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.maxAge}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Job Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={handleChange}
                      className={formErrors.startDate ? "border-red-500" : ""}
                    />
                    {formErrors.startDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.startDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">
                      Job End Date (if applicable)
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={formErrors.endDate ? "border-red-500" : ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank for ongoing positions
                    </p>
                    {formErrors.endDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.endDate}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Provide a detailed description of the job responsibilities and
                  requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-muted/30">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">
                        Voice Description
                      </h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Record a voice description of the job (max 2 minutes).
                        This helps applicants better understand the role.
                      </p>

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
                            <div className="flex flex-col gap-3 bg-muted/50 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Mic className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    Voice Description
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(recordingTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <audio
                                  ref={audioRef}
                                  src={audioUrl}
                                  controls
                                  className="flex-1 h-10 [&::-webkit-media-controls-panel]:bg-muted/50 [&::-webkit-media-controls-current-time-display]:text-xs [&::-webkit-media-controls-time-remaining-display]:text-xs"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      setAudioBlob(null);
                                      setAudioUrl(null);
                                      setRecordingTime(0);
                                    }}
                                    variant="destructive"
                                    size="sm"
                                    className="h-8"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-4 w-4"
                                    >
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={startRecording}
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="h-4 w-4"
                                    >
                                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                      <line x1="12" y1="19" x2="12" y2="22" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {isRecording && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Recording {isPaused ? "(Paused)" : ""}</span>
                            <span>
                              {formatTime(recordingTime)} /{" "}
                              {formatTime(MAX_RECORDING_TIME)}
                            </span>
                          </div>
                          <Progress
                            value={(recordingTime / MAX_RECORDING_TIME) * 100}
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Text Description
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        Provide a detailed written description of the job.
                        Include responsibilities, requirements, and any other
                        relevant information.
                      </p>
                      <Textarea
                        id="description"
                        placeholder="Describe the responsibilities, requirements, and any other relevant details"
                        value={formData.description}
                        onChange={handleChange}
                        className={`min-h-[150px] ${
                          formErrors.description ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.description && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.description}
                        </p>
                      )}
                      {audioUrl && (
                        <p className="text-xs text-amber-600 mt-1">
                          You have provided both a voice and text description.
                          Both will be available to applicants.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Job Category</Label>
                    <Select
                      required
                      value={formData.category}
                      onValueChange={(value) =>
                        handleSelectChange(value, "category")
                      }
                    >
                      <SelectTrigger
                        id="category"
                        className={formErrors.category ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food-service">
                          Food Service
                        </SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="admin">Administrative</SelectItem>
                        <SelectItem value="customer-service">
                          Customer Service
                        </SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="creative">
                          Creative & Design
                        </SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="labor">Manual Labor</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.category && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.category}
                      </p>
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
                    <p className="text-xs text-muted-foreground">
                      Separate skills with commas
                    </p>
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
                    onValueChange={(value) =>
                      handleSelectChange(value, "jobType")
                    }
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
                      onValueChange={(value) =>
                        handleSelectChange(value, "hours")
                      }
                    >
                      <SelectTrigger
                        id="hours"
                        className={formErrors.hours ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less-than-10">
                          Less than 10 hours
                        </SelectItem>
                        <SelectItem value="unable-to-mention">
                          Unable to mention
                        </SelectItem>
                        <SelectItem value="10-15">10-15 hours</SelectItem>
                        <SelectItem value="15-20">15-20 hours</SelectItem>
                        <SelectItem value="20-30">20-30 hours</SelectItem>
                        <SelectItem value="flexible">Flexible hours</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.hours && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.hours}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      required
                      value={formData.duration}
                      onValueChange={(value) =>
                        handleSelectChange(value, "duration")
                      }
                    >
                      <SelectTrigger
                        id="duration"
                        className={formErrors.duration ? "border-red-500" : ""}
                      >
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
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.duration}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pay-type">Pay Type</Label>
                    <Select
                      required
                      value={formData.payType}
                      onValueChange={(value) =>
                        handleSelectChange(value, "payType")
                      }
                    >
                      <SelectTrigger
                        id="pay-type"
                        className={formErrors.payType ? "border-red-500" : ""}
                      >
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
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.payType}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryAmount">
                      Salary Amount (per person)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        ₹
                      </span>
                      <Input
                        id="salaryAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        className={`pl-7 ${
                          formErrors.salaryAmount ? "border-red-500" : ""
                        }`}
                        placeholder="Enter amount"
                        required
                        value={formData.salaryAmount}
                        onChange={handleChange}
                      />
                    </div>
                    {formErrors.salaryAmount && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.salaryAmount}
                      </p>
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
                      <div className="flex items-center justify-between">
                        <Label>Select Location on Map</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newAttachState = !isMapAttached;
                            setIsMapAttached(newAttachState);
                            // If attaching the map, show it; if detaching, hide it
                            setShowMap(newAttachState);
                          }}
                          className="flex items-center gap-2"
                        >
                          {isMapAttached ? (
                            <>
                              <Unlink2 className="h-4 w-4" />
                              <span className="text-sm">Detach Map</span>
                            </>
                          ) : (
                            <>
                              <Link2 className="h-4 w-4" />
                              <span className="text-sm">Attach Map</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-2"
                          onClick={() => setShowMap(!showMap)}
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
                                getCurrentLocation();
                              }
                            }}
                          >
                            Retry
                          </Button>
                        </div>
                      )}

                      {showMap && (
                        <div className="border rounded-md overflow-hidden">
                          <Map
                            center={[location.lat, location.lng]}
                            onMapClick={handleMapClick}
                            markerPosition={[location.lat, location.lng]}
                          />
                          <div className="bg-muted p-2 text-xs text-muted-foreground">
                            Click on the map or drag the marker to select your
                            precise location
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="buildingName">
                            Building No/House Name
                          </Label>
                          <Input
                            id="buildingName"
                            placeholder="Enter building number or house name"
                            value={formData.buildingName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                buildingName: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            placeholder="Enter address to search"
                            value={formData.address}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }));
                              if (isMapAttached) {
                                handleAddressSearch(e.target.value);
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            disabled={!isMapAttached}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province</Label>
                          <Input
                            id="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                state: e.target.value,
                              }))
                            }
                            disabled={!isMapAttached}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zip">ZIP/Postal Code</Label>
                          <Input
                            id="zip"
                            placeholder="ZIP code"
                            value={formData.zip}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                zip: e.target.value,
                              }))
                            }
                            disabled={!isMapAttached}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="applicationInstructions">
                    Application Instructions
                  </Label>
                  <Textarea
                    id="applicationInstructions"
                    placeholder="Provide any specific instructions for applicants"
                    value={formData.applicationInstructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        applicationInstructions: e.target.value,
                      }))
                    }
                    className={
                      formErrors.applicationInstructions ? "border-red-500" : ""
                    }
                  />
                  {formErrors.applicationInstructions && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.applicationInstructions}
                    </p>
                  )}
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
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            +91
                          </span>
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setContacts([...contacts, { name: "", phone: "" }])
                    }
                    className="mt-2"
                  >
                    Add Another Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Terms and Conditions</CardTitle>
                <CardDescription>
                  Please review and accept the terms and conditions before
                  submitting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="termsAccepted"
                      checked={formData.termsAccepted}
                      onCheckedChange={handleCheckboxChange}
                      className={
                        formErrors.termsAccepted ? "border-red-500" : ""
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="termsAccepted"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Accept Terms and Conditions
                      </label>
                      <p className="text-sm text-muted-foreground">
                        By checking this box, you agree to our terms and
                        conditions
                      </p>
                    </div>
                  </div>
                </div>
                {formErrors.termsAccepted && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.termsAccepted}
                  </p>
                )}
              </CardContent>
            </Card>

            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Review"
                )}
              </Button>
            </CardFooter>
          </form>
        </div>
      </main>
    </div>
  );
}
