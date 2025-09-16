import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteRefreshToken } from '@/lib/auth';

const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = logoutSchema.parse(body);

    // Delete refresh token from database
    try {
      await deleteRefreshToken(refreshToken);
    } catch (error) {
      // Token might not exist, but that's okay for logout
      console.log('Refresh token not found during logout:', error);
    }

    return NextResponse.json({
      message: 'Logout successful',
    });

  } catch (error) {
    console.error('Logout error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}