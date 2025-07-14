// Centralized Firebase client utility for safe initialization

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

interface FirebaseInstance {
  auth: any;
  db: any;
}

let firebaseInstance: FirebaseInstance | null = null;

// Safe Firebase initialization
export const initializeFirebase = async (): Promise<FirebaseInstance | null> => {
  try {
    // Return cached instance if already initialized
    if (firebaseInstance) {
      return firebaseInstance;
    }

    const { initializeApp, getApps } = await import("firebase/app");
    const { getAuth } = await import("firebase/auth");
    const { getFirestore } = await import("firebase/firestore");
    
    const firebaseConfig: FirebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    // Check if config is valid
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn("Firebase configuration is incomplete");
      return null;
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    firebaseInstance = { auth, db };
    return firebaseInstance;
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    return null;
  }
};

// Get Firebase auth instance
export const getFirebaseAuth = async () => {
  const firebase = await initializeFirebase();
  return firebase?.auth || null;
};

// Get Firebase Firestore instance
export const getFirebaseDb = async () => {
  const firebase = await initializeFirebase();
  return firebase?.db || null;
};

// Check if Firebase is available
export const isFirebaseAvailable = async (): Promise<boolean> => {
  const firebase = await initializeFirebase();
  return firebase !== null;
};

// Clear Firebase instance (useful for testing or reinitialization)
export const clearFirebaseInstance = () => {
  firebaseInstance = null;
}; 