import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/auth';
import redis from '@/lib/redis';

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

    // Build cache key for user profile
    const cacheKey = `user:profile:${userId}`;

    // Try to get from cache first
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log('✅ Cache HIT for user profile API');
        return NextResponse.json(JSON.parse(cachedData));
      }
    } catch (cacheError) {
      console.log('⚠️ Cache error (continuing with DB):', cacheError.message);
    }

    // Get user from database
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const response = {
      user,
    };

    // Cache the response for 15 minutes (user profile changes infrequently)
    try {
      await redis.setex(cacheKey, 900, JSON.stringify(response));
      console.log('💾 Cached user profile API response');
    } catch (cacheError) {
      console.log('⚠️ Failed to cache user profile response:', cacheError.message);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get user profile error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}