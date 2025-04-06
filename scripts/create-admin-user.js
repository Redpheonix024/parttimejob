// This script is used to create an admin user in Firebase
// Run it with: node scripts/create-admin-user.js

const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const dotenv = require('dotenv');

dotenv.config();

// Admin user credentials - should be environment variables in production
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@Parttimejob.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'securePassword123!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Administrator';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

async function createAdminUser() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    // Try to create a new user
    console.log(`Creating admin user with email: ${ADMIN_EMAIL}...`);
    
    let userCredential;
    
    try {
      // Try to create the user
      userCredential = await createUserWithEmailAndPassword(
        auth,
        ADMIN_EMAIL,
        ADMIN_PASSWORD
      );
      console.log('Admin user created successfully!');
    } catch (error) {
      // If user already exists, try to sign in
      if (error.code === 'auth/email-already-in-use') {
        console.log('User already exists, signing in...');
        userCredential = await signInWithEmailAndPassword(
          auth,
          ADMIN_EMAIL,
          ADMIN_PASSWORD
        );
        console.log('Signed in successfully!');
      } else {
        throw error;
      }
    }

    // Create or update the user document in Firestore
    const user = userCredential.user;
    const userRef = doc(db, 'users', user.uid);

    await setDoc(userRef, {
      uid: user.uid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`Admin user saved to Firestore with ID: ${user.uid}`);
    console.log('Admin user setup completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser(); 