import { NextRequest } from 'next/server';
import { db } from '@/app/config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export const dynamic = 'force-dynamic'; // Ensure this route is always dynamic

export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Set up SSE headers
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };

  // Flags to ignore initial snapshot for each collection
  let isInitialJobs = true;
  let isInitialApplications = true;
  let isInitialUsers = true;

  // Listen to Firestore 'jobs' collection
  const unsubscribeJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
    if (isInitialJobs) {
      isInitialJobs = false;
      return;
    }
    writer.write(encoder.encode(`event: update\ndata: jobs changed\n\n`));
  });

  // Listen to Firestore 'applications' collection
  const unsubscribeApplications = onSnapshot(collection(db, 'applications'), (snapshot) => {
    if (isInitialApplications) {
      isInitialApplications = false;
      return;
    }
    writer.write(encoder.encode(`event: update\ndata: applications changed\n\n`));
  });

  // Listen to Firestore 'users' collection
  const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
    if (isInitialUsers) {
      isInitialUsers = false;
      return;
    }
    writer.write(encoder.encode(`event: update\ndata: users changed\n\n`));
  });

  // Clean up when the connection is closed
  req.signal.addEventListener('abort', () => {
    unsubscribeJobs();
    unsubscribeApplications();
    unsubscribeUsers();
    writer.close();
  });

  // Initial comment to keep connection open
  writer.write(encoder.encode(': connected\n\n'));

  return new Response(readable, { headers });
} 