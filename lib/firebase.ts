import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Job related functions
export const getJob = async (id: string) => {
  try {
    if (!id) {
      console.error('Job ID is required')
      return null
    }
    
    const jobRef = doc(db, 'jobs', id)
    const jobSnap = await getDoc(jobRef)
    
    if (!jobSnap.exists()) {
      console.log('Job not found:', id)
      return null
    }
    
    const jobData = { id: jobSnap.id, ...jobSnap.data() }
    console.log('Job found:', jobData)
    return jobData
  } catch (error) {
    console.error('Error getting job:', error)
    return null
  }
}

export const updateJob = async (id: string, data: any) => {
  try {
    if (!id) throw new Error('Job ID is required')
    
    const jobRef = doc(db, 'jobs', id)
    await updateDoc(jobRef, data)
  } catch (error) {
    console.error('Error updating job:', error)
    throw error
  }
}

export const createTimelineEvent = async (jobId: string, action: string) => {
  try {
    if (!jobId) throw new Error('Job ID is required')
    
    const timelineRef = collection(db, 'jobs', jobId, 'timeline')
    await setDoc(doc(timelineRef), {
      action,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error creating timeline event:', error)
    throw error
  }
}

// User related functions
export const getUser = async (id: string) => {
  try {
    if (!id) throw new Error('User ID is required')
    
    const userRef = doc(db, 'users', id)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return null
    }
    
    return { id: userSnap.id, ...userSnap.data() }
  } catch (error) {
    console.error('Error getting user:', error)
    throw error
  }
}

// Application related functions
export const getJobApplications = async (jobId: string) => {
  try {
    if (!jobId) throw new Error('Job ID is required')
    
    const applicationsRef = collection(db, 'jobs', jobId, 'applications')
    const applicationsSnap = await getDocs(applicationsRef)
    return applicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting job applications:', error)
    throw error
  }
}

export const updateApplication = async (jobId: string, applicationId: string, data: any) => {
  try {
    if (!jobId || !applicationId) throw new Error('Job ID and Application ID are required')
    
    const applicationRef = doc(db, 'jobs', jobId, 'applications', applicationId)
    await updateDoc(applicationRef, data)
  } catch (error) {
    console.error('Error updating application:', error)
    throw error
  }
}

export const getJobs = async () => {
  try {
    const jobsRef = collection(db, 'jobs')
    const jobsSnap = await getDocs(jobsRef)
    return jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting jobs:', error)
    return null
  }
}

export const deleteJob = async (id: string) => {
  try {
    if (!id) throw new Error('Job ID is required')
    
    const jobRef = doc(db, 'jobs', id)
    await deleteDoc(jobRef)
    return true
  } catch (error) {
    console.error('Error deleting job:', error)
    return false
  }
} 