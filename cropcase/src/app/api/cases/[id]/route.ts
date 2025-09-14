import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// GET /api/cases/[id] - Get single case by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const caseId = params.id;

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
    { params }: { params: { id: string } }
) {
    try {
        const caseId = params.id;
        const body = await request.json();

        // Check if case exists
        const existingCase = await prisma.case.findUnique({
            where: { id: caseId }
        });

        if (!existingCase) {
            return NextResponse.json(
                { error: "Case not found" },
                { status: 404 }
            );
        }

        // Update case
        const updatedCase = await prisma.case.update({
            where: { id: caseId },
            data: {
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
    { params }: { params: { id: string } }
) {
    try {
        const caseId = params.id;

        // Check if case exists
        const existingCase = await prisma.case.findUnique({
            where: { id: caseId }
        });

        if (!existingCase) {
            return NextResponse.json(
                { error: "Case not found" },
                { status: 404 }
            );
        }

        // Delete case (cascade will handle related records)
        await prisma.case.delete({
            where: { id: caseId }
        });

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
