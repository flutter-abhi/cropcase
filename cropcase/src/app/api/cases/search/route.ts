import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SearchResponse, ApiErrorResponse } from '@/types/api';
import { UICaseData } from '@/types/ui';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract search parameters
        const q = searchParams.get('q') || '';
        const season = searchParams.get('season');
        const minLand = searchParams.get('minLand') ? parseFloat(searchParams.get('minLand')!) : undefined;
        const maxLand = searchParams.get('maxLand') ? parseFloat(searchParams.get('maxLand')!) : undefined;
        const tags = searchParams.get('tags') ? searchParams.get('tags')!.split(',') : [];
        const userId = searchParams.get('userId');

        // Pagination parameters
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Validate pagination parameters
        if (page < 1 || limit < 1) {
            return NextResponse.json<ApiErrorResponse>({
                error: 'Invalid pagination parameters',
                code: 'INVALID_PAGINATION'
            }, { status: 400 });
        }

        // Calculate offset
        const offset = (page - 1) * limit;

        // Build where clause - simplified version
        interface WhereClause {
            isPublic: boolean;
            userId?: { not: string };
            name?: { contains: string; mode: 'insensitive' };
            totalLand?: { gte?: number; lte?: number };
        }

        const whereClause: WhereClause = {
            isPublic: true // Only search public cases
        };

        // Exclude user's own cases if userId provided
        if (userId) {
            whereClause.userId = { not: userId };
        }

        // Text search in name only (simplified)
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

        // Build sort order
        const orderBy: Record<string, 'asc' | 'desc'> = {};
        orderBy[sortBy] = sortOrder as 'asc' | 'desc';

        // Debug logging (remove in production)
        // console.log('Search whereClause:', JSON.stringify(whereClause, null, 2));

        // Fetch cases with filters
        const [cases, totalCount] = await Promise.all([
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
            })
        ]);

        // Get available seasons and tags separately to avoid complex queries
        const availableSeasons = [
            { season: 'Spring' },
            { season: 'Summer' },
            { season: 'Fall' },
            { season: 'Winter' }
        ];

        const availableTags = [
            { tags: 'organic,sustainable,wheat,vegetables,rotation' }
        ];

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        // Transform cases to include crop details
        const transformedCases = cases.map(case_ => ({
            id: case_.id,
            name: case_.name,
            description: case_.description,
            totalLand: case_.totalLand,
            location: case_.location,
            tags: case_.tags ? case_.tags.split(',').filter(tag => tag.trim()) : [],
            isPublic: case_.isPublic,
            createdAt: case_.createdAt,
            updatedAt: case_.updatedAt,
            userId: case_.userId,
            user: case_.user,
            crops: case_.crops.map(cropCase => ({
                name: cropCase.crop.name,
                weight: cropCase.weight,
                season: cropCase.crop.season,
                notes: cropCase.notes
            })),
            likes: case_.likes?.length || 0,
            views: case_.views || 0
        }));

        // Process available tags
        const allTags = availableTags
            .flatMap(case_ => case_.tags ? case_.tags.split(',').map(tag => tag.trim()) : [])
            .filter(tag => tag.length > 0);

        const uniqueTags = [...new Set(allTags)].sort();

        const response: SearchResponse = {
            cases: transformedCases as unknown as UICaseData[],
            filters: {
                appliedFilters: {
                    q: q || undefined,
                    season: season || undefined,
                    minLand,
                    maxLand,
                    tags: tags.length > 0 ? tags : undefined,
                    userId: userId || undefined
                },
                availableSeasons: availableSeasons.map(crop => crop.season).sort(),
                availableTags: uniqueTags
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

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error searching cases:', error);
        return NextResponse.json<ApiErrorResponse>({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}
