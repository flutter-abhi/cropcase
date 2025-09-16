import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis';
import { CommunityCasesResponse, ApiErrorResponse } from '@/types/api';
import { UICaseData } from '@/types/ui';

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

        // Build cache key for community cases
        const cacheKey = `community:user:${userId}:page:${page}:limit:${limit}:sort:${sortBy}:${sortOrder}`;

        // Try to get from cache first
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                console.log('✅ Cache HIT for community API');
                return NextResponse.json(JSON.parse(cachedData));
            }
        } catch (cacheError) {
            console.log('⚠️ Cache error (continuing with DB):', (cacheError as Error).message);
        }

        // Build sort order
        const orderBy: Record<string, 'asc' | 'desc'> = {};
        orderBy[sortBy] = sortOrder as 'asc' | 'desc';

        // Fetch community cases (exclude user's own cases)
        const [cases, totalCount, statsData] = await Promise.all([
            prisma.case.findMany({
                where: {
                    userId: { not: userId }, // Exclude user's own cases
                    isPublic: true // Only public cases
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
                            userId: true
                        }
                    }
                },
                orderBy,
                skip: offset,
                take: limit
            }),
            prisma.case.count({
                where: {
                    userId: { not: userId },
                    isPublic: true
                }
            }),
            // Get community stats
            prisma.$transaction([
                // Total community cases
                prisma.case.count({
                    where: {
                        userId: { not: userId },
                        isPublic: true
                    }
                }),
                // Total unique farmers
                prisma.case.findMany({
                    where: {
                        userId: { not: userId },
                        isPublic: true
                    },
                    select: {
                        userId: true
                    },
                    distinct: ['userId']
                }),
                // Total likes across all community cases (count from CaseLike table)
                prisma.caseLike.count({
                    where: {
                        case: {
                            userId: { not: userId },
                            isPublic: true
                        }
                    }
                })
            ])
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        // Calculate stats
        const [totalCommunityCases, uniqueFarmers, totalLikes] = statsData;
        const totalFarmers = uniqueFarmers.length;
        const averageLikesPerCase = totalCommunityCases > 0 ? totalLikes / totalCommunityCases : 0;

        // Transform cases to include crop details


        const response = {
            data: cases,
            stats: {
                totalCommunityCases,
                totalFarmers,
                totalLikes,
                averageLikesPerCase: Math.round(averageLikesPerCase * 100) / 100
            },
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages,
                hasNext,
                hasPrev
            }
        };


        // Cache the response for 5 minutes (medium TTL for community data)
        try {
            await redis.setex(cacheKey, 300, JSON.stringify(response));
            console.log('💾 Cached community API response');
        } catch (cacheError: unknown) {
            console.log('⚠️ Failed to cache community response:', (cacheError as Error).message);
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching community cases:', error);
        return NextResponse.json<ApiErrorResponse>({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}
