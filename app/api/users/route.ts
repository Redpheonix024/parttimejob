import { NextRequest, NextResponse } from 'next/server';

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
    
    // This would typically update the user in a database
    // For now, we'll just return the user data as if it was updated
    
    return NextResponse.json({ 
      success: true, 
      user: userData 
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
} 