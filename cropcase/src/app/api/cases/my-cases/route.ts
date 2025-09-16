import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis';
import { ApiErrorResponse } from '@/types/api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract parameters
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50 per page
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Validate required parameters
        if (!userId) {
            return NextResponse.json<ApiErrorResponse>({
                error: 'User ID is required',
                code: 'MISSING_USER_ID'
            }, { status: 400 });
        }

        // Validate pagination parameters
        if (page < 1 || limit < 1) {
            return NextResponse.json<ApiErrorResponse>({
                error: 'Invalid pagination parameters',
                code: 'INVALID_PAGINATION'
            }, { status: 400 });
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Build cache key for my-cases
        const cacheKey = `my-cases:user:${userId}:page:${page}:limit:${limit}:sort:${sortBy}:${sortOrder}`;

        // Try to get from cache first
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                console.log('✅ Cache HIT for my-cases API');
                return NextResponse.json(JSON.parse(cachedData));
            }
        } catch (cacheError) {
            console.log('⚠️ Cache error (continuing with DB):', cacheError.message);
        }

        // Build sort order
        const orderBy: Record<string, 'asc' | 'desc'> = {};
        orderBy[sortBy] = sortOrder as 'asc' | 'desc';

        // Fetch user's cases with pagination
        const [cases, totalCount] = await Promise.all([
            prisma.case.findMany({
                where: {
                    userId: userId
                },
                include: {
                    crops: {
                        include: {
                            crop: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    likes: {
                        select: {
                            id: true,
                            userId: true,
                        }
                    }
                },
                orderBy,
                skip: offset,
                take: limit
            }),
            prisma.case.count({
                where: {
                    userId: userId
                }
            })
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        // Calculate stats
       // const totalLand = cases.reduce((sum, case_) => sum + case_.totalLand, 0);
       // const averageLandPerCase = totalCount > 0 ? totalLand / totalCount : 0;

        const responseData = {
                data: cases,
                pagination: {
                    page: page,
                    limit: limit,
                    total: totalCount,
                    totalPages,
                    hasNext,
                    hasPrev
                }
            };
        // Cache the response for 10 minutes (user's own data changes less frequently)
        try {
            await redis.setex(cacheKey, 600, JSON.stringify(responseData));
            console.log('💾 Cached my-cases API response');
        } catch (cacheError) {
            console.log('⚠️ Failed to cache my-cases response:', cacheError.message);
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error fetching user cases:', error);
        return NextResponse.json<ApiErrorResponse>({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}
