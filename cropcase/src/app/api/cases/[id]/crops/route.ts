import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// POST /api/cases/[id]/crops - Add crops to case
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const caseId = params.id;
        const body = await request.json();

        // Validate required fields
        if (!body.crops || !Array.isArray(body.crops)) {
            return NextResponse.json(
                { error: "Crops array is required" },
                { status: 400 }
            );
        }

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

        // Add crops to case
        const caseCrops = await prisma.caseCrop.createMany({
            data: body.crops.map((crop: any) => ({
                caseId: caseId,
                cropId: crop.cropId,
                weight: parseInt(crop.weight),
                notes: crop.notes || null,
            })),
            skipDuplicates: true // Skip if crop already exists in case
        });

        // Fetch updated case with crops
        const updatedCase = await prisma.case.findUnique({
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

        return NextResponse.json(updatedCase);
    } catch (error) {
        console.error("Error adding crops to case:", error);
        return NextResponse.json(
            { error: "Failed to add crops to case" },
            { status: 500 }
        );
    }
}

// PUT /api/cases/[id]/crops - Update case crops
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const caseId = params.id;
        const body = await request.json();

        // Validate required fields
        if (!body.crops || !Array.isArray(body.crops)) {
            return NextResponse.json(
                { error: "Crops array is required" },
                { status: 400 }
            );
        }

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

        // Delete existing crops for this case
        await prisma.caseCrop.deleteMany({
            where: { caseId: caseId }
        });

        // Add new crops
        if (body.crops.length > 0) {
            await prisma.caseCrop.createMany({
                data: body.crops.map((crop: any) => ({
                    caseId: caseId,
                    cropId: crop.cropId,
                    weight: parseInt(crop.weight),
                    notes: crop.notes || null,
                }))
            });
        }

        // Fetch updated case with crops
        const updatedCase = await prisma.case.findUnique({
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

        return NextResponse.json(updatedCase);
    } catch (error) {
        console.error("Error updating case crops:", error);
        return NextResponse.json(
            { error: "Failed to update case crops" },
            { status: 500 }
        );
    }
}
