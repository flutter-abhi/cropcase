// Force Node.js runtime for JWT support
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import redis from "../../../../lib/redis";

// GET /api/cases/[id] - Get single case by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: caseId } = await params;

        // Build cache key for case detail
        const cacheKey = `case:detail:${caseId}`;

        // Try to get from cache first
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                console.log('✅ Cache HIT for case detail API');
                return NextResponse.json(JSON.parse(cachedData));
            }
        } catch (cacheError) {
            console.log('⚠️ Cache error (continuing with DB):', (cacheError as Error).message);
        }

        const caseData = await prisma.case.findUnique({
            where: { id: caseId },
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

        if (!caseData) {
            return NextResponse.json(
                { error: "Case not found" },
                { status: 404 }
            );
        }

        // Cache the response for 10 minutes (case details change less frequently)
        try {
            await redis.setex(cacheKey, 600, JSON.stringify(caseData));
            console.log('💾 Cached case detail API response');
        } catch (cacheError) {
            console.log('⚠️ Failed to cache case detail response:', (cacheError as Error).message);
        }

        return NextResponse.json(caseData);
    } catch (error) {
        console.error("Error fetching case:", error);
        return NextResponse.json(
            { error: "Failed to fetch case" },
            { status: 500 }
        );
    }
}

// PUT /api/cases/[id] - Update case by ID
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: caseId } = await params;
        const body = await request.json();

        // Get authenticated user ID from middleware
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Check if case exists and user owns it
        const existingCase = await prisma.case.findUnique({
            where: { id: caseId }
        });

        if (!existingCase) {
            return NextResponse.json(
                { error: "Case not found" },
                { status: 404 }
            );
        }

        // Check ownership
        if (existingCase.userId !== userId) {
            return NextResponse.json(
                { error: "You can only update your own cases" },
                { status: 403 }
            );
        }

        // Prepare update data
        const updateData: {
            name: string;
            description: string | null;
            totalLand: number;
            location: string | null;
            isPublic: boolean;
            startDate: Date | null;
            endDate: Date | null;
            budget: number | null;
            notes: string | null;
            status: string;
            tags: string;
            efficiency: number | null;
            estimatedProfit: number | null;
            crops?: {
                deleteMany: {};
                create: Array<{
                    cropId: string;
                    weight: number;
                    notes: string | null;
                }>;
            };
        } = {
            name: body.name || existingCase.name,
            description: body.description !== undefined ? body.description : existingCase.description,
            totalLand: body.totalLand ? parseFloat(body.totalLand) : existingCase.totalLand,
            location: body.location !== undefined ? body.location : existingCase.location,
            isPublic: body.isPublic !== undefined ? body.isPublic : existingCase.isPublic,
            startDate: body.startDate ? new Date(body.startDate) : existingCase.startDate,
            endDate: body.endDate ? new Date(body.endDate) : existingCase.endDate,
            budget: body.budget !== undefined ? (body.budget ? parseFloat(body.budget) : null) : existingCase.budget,
            notes: body.notes !== undefined ? body.notes : existingCase.notes,
            status: body.status || existingCase.status,
            tags: body.tags ? JSON.stringify(body.tags) : existingCase.tags,
            efficiency: body.efficiency ? parseFloat(body.efficiency) : existingCase.efficiency,
            estimatedProfit: body.estimatedProfit ? parseFloat(body.estimatedProfit) : existingCase.estimatedProfit,
        };

        // Handle crops update if provided
        if (body.crops && Array.isArray(body.crops)) {
            updateData.crops = {
                deleteMany: {}, // Delete all existing crops
                create: body.crops.map((crop: { cropId: string; weight: string | number; notes?: string }) => ({
                    cropId: crop.cropId,
                    weight: parseInt(crop.weight),
                    notes: crop.notes || null,
                }))
            };
        }

        // Update case
        const updatedCase = await prisma.case.update({
            where: { id: caseId },
            data: updateData,
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

        // Invalidate cache when case is updated
        try {
            // Invalidate case detail cache
            await redis.del(`case:detail:${caseId}`);
            console.log('🗑️ Invalidated case detail cache after update');

            // Invalidate my-cases cache for this user (all pages and sort options)
            const myCasesPattern = `my-cases:user:${userId}:*`;
            const myCasesKeys = await redis.keys(myCasesPattern);
            if (myCasesKeys.length > 0) {
                await redis.del(...myCasesKeys);
                console.log(`🗑️ Invalidated ${myCasesKeys.length} my-cases cache entries for user ${userId}`);
            }
        } catch (cacheError) {
            console.log('⚠️ Failed to invalidate case cache:', (cacheError as Error).message);
        }

        return NextResponse.json(updatedCase);
    } catch (error) {
        console.error("Error updating case:", error);
        return NextResponse.json(
            { error: "Failed to update case" },
            { status: 500 }
        );
    }
}

// DELETE /api/cases/[id] - Delete case by ID
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: caseId } = await params;

        // Get authenticated user ID from middleware
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Check if case exists and user owns it
        const existingCase = await prisma.case.findUnique({
            where: { id: caseId }
        });

        if (!existingCase) {
            return NextResponse.json(
                { error: "Case not found" },
                { status: 404 }
            );
        }

        // Check ownership
        if (existingCase.userId !== userId) {
            return NextResponse.json(
                { error: "You can only delete your own cases" },
                { status: 403 }
            );
        }

        // Delete case (cascade will handle related records)
        await prisma.case.delete({
            where: { id: caseId }
        });

        // Invalidate cache when case is deleted
        try {
            // Invalidate case detail cache
            await redis.del(`case:detail:${caseId}`);
            console.log('🗑️ Invalidated case detail cache after deletion');

            // Invalidate my-cases cache for this user (all pages and sort options)
            const myCasesPattern = `my-cases:user:${userId}:*`;
            const myCasesKeys = await redis.keys(myCasesPattern);
            if (myCasesKeys.length > 0) {
                await redis.del(...myCasesKeys);
                console.log(`🗑️ Invalidated ${myCasesKeys.length} my-cases cache entries for user ${userId}`);
            }
        } catch (cacheError) {
            console.log('⚠️ Failed to invalidate case cache:', (cacheError as Error).message);
        }

        return NextResponse.json(
            { message: "Case deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting case:", error);
        return NextResponse.json(
            { error: "Failed to delete case" },
            { status: 500 }
        );
    }
}
