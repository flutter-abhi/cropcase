import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis';
import { ApiErrorResponse } from '@/types/api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract user ID from middleware headers
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json<ApiErrorResponse>({
                error: 'Authentication required',
                code: 'MISSING_AUTH'
            }, { status: 401 });
        }

        // Extract parameters
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50 per page
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Extract filter parameters
        const q = searchParams.get('q') || '';
        const season = searchParams.get('season');
        const minLand = searchParams.get('minLand') ? parseFloat(searchParams.get('minLand')!) : undefined;
        const maxLand = searchParams.get('maxLand') ? parseFloat(searchParams.get('maxLand')!) : undefined;
        const tags = searchParams.get('tags') ? searchParams.get('tags')!.split(',') : [];

        // Validate pagination parameters
        if (page < 1 || limit < 1) {
            return NextResponse.json<ApiErrorResponse>({
                error: 'Invalid pagination parameters',
                code: 'INVALID_PAGINATION'
            }, { status: 400 });
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Build cache key for community cases with filters
        const cacheKey = `community:user:${userId}:page:${page}:limit:${limit}:sort:${sortBy}:${sortOrder}:q:${q}:season:${season || 'all'}:land:${minLand || 'min'}-${maxLand || 'max'}:tags:${tags.join(',')}`;

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

        // Build where clause with filters
        interface WhereClause {
            userId: { not: string };
            isPublic: boolean;
            name?: { contains: string; mode: 'insensitive' };
            totalLand?: { gte?: number; lte?: number };
            tags?: { contains: string };
        }

        const whereClause: WhereClause = {
            userId: { not: userId }, // Exclude user's own cases
            isPublic: true // Only public cases
        };

        // Text search in name
        if (q.trim()) {
            whereClause.name = {
                contains: q,
                mode: 'insensitive'
            };
        }

        // Land size filters
        if (minLand !== undefined || maxLand !== undefined) {
            whereClause.totalLand = {};
            if (minLand !== undefined) {
                whereClause.totalLand.gte = minLand;
            }
            if (maxLand !== undefined) {
                whereClause.totalLand.lte = maxLand;
            }
        }

        // Tags filter (simplified - search in tags string)
        if (tags.length > 0) {
            // For now, we'll search for any of the tags in the tags field
            // This is a simplified approach - in production you might want more sophisticated tag matching
            whereClause.tags = {
                contains: tags[0] // Use first tag for now
            };
        }

        // Build sort order - map frontend sort options to database fields
        const orderBy: Record<string, 'asc' | 'desc'> = {};

        // Map frontend sort options to actual database fields
        const sortFieldMap: Record<string, string> = {
            'recent': 'createdAt',
            'popular': 'views', // Using views as popularity proxy
            'views': 'views',
            'alphabetical': 'name'
        };

        const dbSortField = sortFieldMap[sortBy] || 'createdAt';
        orderBy[dbSortField] = sortOrder as 'asc' | 'desc';

        // Fetch community cases (exclude user's own cases)
        const [cases, totalCount, statsData] = await Promise.all([
            prisma.case.findMany({
                where: whereClause,
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
                where: whereClause
            }),
            // Get community stats (using base where clause without filters for overall stats)
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
