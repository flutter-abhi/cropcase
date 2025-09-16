// Force Node.js runtime for JWT support
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findRefreshToken, deleteRefreshToken, createRefreshToken } from '@/lib/auth';
import { verifyRefreshToken, generateTokens } from '@/lib/jwt';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = refreshSchema.parse(body);

    // Verify the refresh token
    try {
      verifyRefreshToken(refreshToken);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Find refresh token in database
    const storedToken = await findRefreshToken(refreshToken);

    if (!storedToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await deleteRefreshToken(refreshToken);
      return NextResponse.json(
        { error: 'Refresh token expired' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    // Delete old refresh token and create new one
    await deleteRefreshToken(refreshToken);
    const newRefreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await createRefreshToken(newRefreshToken, storedToken.user.id, newRefreshTokenExpiry);

    return NextResponse.json({
      message: 'Token refreshed successfully',
      user: storedToken.user,
      accessToken,
      refreshToken: newRefreshToken,
    });

  } catch (error) {
    console.error('Token refresh error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}