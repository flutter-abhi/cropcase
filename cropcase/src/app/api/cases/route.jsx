import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET /api/cases - Fetch all cases with relations (with optional pagination)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        // Check if pagination parameters are provided
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        const filterUserId = searchParams.get('userId'); // For filtering specific user's cases
        const authenticatedUserId = request.headers.get('x-user-id'); // Current authenticated user

        // If pagination parameters are provided, use new paginated response
        if (page || limit || filterUserId) {
            const pageNum = parseInt(page || '1');
            const limitNum = Math.min(parseInt(limit || '10'), 50);
            const offset = (pageNum - 1) * limitNum;

            // Build where clause
            const whereClause = {};
            if (filterUserId) {
                whereClause.userId = filterUserId;
            }

            const [cases, totalCount] = await Promise.all([
                prisma.case.findMany({
                    where: whereClause,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        },
                        crops: {
                            include: {
                                crop: true
                            }
                        },
                        likes: {
                            select: {
                                id: true,
                                userId: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip: offset,
                    take: limitNum
                }),
                prisma.case.count({
                    where: whereClause
                })
            ]);

            // Calculate pagination metadata
            const totalPages = Math.ceil(totalCount / limitNum);
            const hasNext = pageNum < totalPages;
            const hasPrev = pageNum > 1;

            return NextResponse.json({
                data: cases,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: totalCount,
                    totalPages,
                    hasNext,
                    hasPrev
                }
            });
        }

        // Legacy behavior - return all cases without pagination
        const cases = await prisma.case.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                crops: {
                    include: {
                        crop: true
                    }
                },
                likes: {
                    select: {
                        id: true,
                        userId: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(cases);
    } catch (error) {
        console.error("Error fetching cases:", error);
        return NextResponse.json(
            { error: "Failed to fetch cases" },
            { status: 500 }
        );
    }
}

// POST /api/cases - Create new case
export async function POST(request) {
    try {
        const body = await request.json();

        // Get authenticated user ID from middleware
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!body.name || !body.totalLand) {
            return NextResponse.json(
                { error: "Missing required fields: name, totalLand" },
                { status: 400 }
            );
        }

        // Create case with crops
        const newCase = await prisma.case.create({
            data: {
                userId: userId,
                name: body.name,
                description: body.description || null,
                totalLand: parseFloat(body.totalLand),
                location: body.location || null,
                isPublic: body.isPublic || false,
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
                budget: body.budget ? parseFloat(body.budget) : null,
                notes: body.notes || null,
                status: body.status || 'active',
                tags: body.tags ? (Array.isArray(body.tags) ? body.tags.join(',') : body.tags) : '',
                crops: body.crops ? {
                    create: body.crops.map((crop) => ({
                        cropId: crop.cropId,
                        weight: parseInt(crop.weight),
                        notes: crop.notes || null,
                    }))
                } : undefined
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                crops: {
                    include: {
                        crop: true
                    }
                },
                likes: {
                    select: {
                        id: true,
                        userId: true,
                    }
                }
            }
        });

        return NextResponse.json(newCase, { status: 201 });
    } catch (error) {
        console.error("Error creating case:", error);
        return NextResponse.json(
            { error: "Failed to create case" },
            { status: 500 }
        );
    }
}

