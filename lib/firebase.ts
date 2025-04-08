import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/app/config/firebase';

export async function getJobs() {
  try {
    const jobsRef = collection(db, 'jobs');
    const snapshot = await getDocs(jobsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

export async function getUser(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function deleteJob(jobId: string) {
  try {
    const jobRef = doc(db, 'jobs', jobId);
    await deleteDoc(jobRef);
    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    return false;
  }
} 