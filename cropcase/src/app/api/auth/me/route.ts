import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware-injected headers
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user,
    });

  } catch (error) {
    console.error('Get user profile error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}