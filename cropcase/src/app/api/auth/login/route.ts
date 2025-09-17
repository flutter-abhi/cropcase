// Force Node.js runtime for JWT support
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserByEmail, updateUserLastLogin, createRefreshToken, verifyPassword } from '@/lib/auth';
import { generateTokens } from '@/lib/jwt';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user by email
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify the password
    const isPasswordValid = await verifyPassword(password, user.password!);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
    });

    // Store refresh token in database
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await createRefreshToken(refreshToken, user.id, refreshTokenExpiry);

    // Update last login
    await updateUserLastLogin(user.id);

    // Return user without sensitive data
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error('Login error:', error);

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