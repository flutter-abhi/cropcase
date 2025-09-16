import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MyCasesResponse, ApiErrorResponse } from '@/types/api';
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
        const totalLand = cases.reduce((sum, case_) => sum + case_.totalLand, 0);
        const averageLandPerCase = totalCount > 0 ? totalLand / totalCount : 0;

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
            likes: (case_ as { likes?: unknown[] }).likes?.length || 0,
            views: case_.views || 0
        }));

        const response: MyCasesResponse = {
            cases: transformedCases as unknown as UICaseData[],
            stats: {
                totalCases: totalCount,
                totalLand,
                averageLandPerCase: Math.round(averageLandPerCase * 100) / 100
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
        console.error('Error fetching user cases:', error);
        return NextResponse.json<ApiErrorResponse>({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}
