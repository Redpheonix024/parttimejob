import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');
  
  if (userId) {
    // Get single user by ID
    try {
      // This would typically fetch user from a database
      return NextResponse.json({ 
        user: { id: userId, name: 'Example User', email: 'user@example.com' } 
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
  } else {
    // Get all users
    try {
      // This would typically fetch users from a database
      return NextResponse.json({ 
        users: [
          { id: '1', name: 'User One', email: 'user1@example.com' },
          { id: '2', name: 'User Two', email: 'user2@example.com' }
        ] 
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userData = await request.json();
    const { id, ...fieldsToUpdate } = userData;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userDocRef = doc(db, 'users', id);
    await updateDoc(userDocRef, fieldsToUpdate);

    return NextResponse.json({ 
      success: true, 
      user: { id, ...fieldsToUpdate }
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
} 