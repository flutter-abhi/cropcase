import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// POST /api/cases/[id]/like - Like/unlike a case
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const caseId = params.id;
        const body = await request.json();

        // Validate required fields
        if (!body.userId) {
            return NextResponse.json(
                { error: "userId is required" },
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

        // Check if user already liked this case
        const existingLike = await prisma.caseLike.findUnique({
            where: {
                caseId_userId: {
                    caseId: caseId,
                    userId: body.userId
                }
            }
        });

        let action: string;
        let likeCount: number;

        if (existingLike) {
            // Unlike the case
            await prisma.caseLike.delete({
                where: {
                    caseId_userId: {
                        caseId: caseId,
                        userId: body.userId
                    }
                }
            });
            action = "unliked";
        } else {
            // Like the case
            await prisma.caseLike.create({
                data: {
                    caseId: caseId,
                    userId: body.userId
                }
            });
            action = "liked";
        }

        // Get updated like count
         likeCount = await prisma.caseLike.count({
            where: { caseId: caseId }
        });

        return NextResponse.json({
            action,
            likeCount,
            isLiked: action === "liked"
        });
    } catch (error) {
        console.error("Error toggling case like:", error);
        return NextResponse.json(
            { error: "Failed to toggle case like" },
            { status: 500 }
        );
    }
}

// GET /api/cases/[id]/like - Check if user liked a case
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const caseId = params.id;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: "userId query parameter is required" },
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

        // Check if user liked this case
        const existingLike = await prisma.caseLike.findUnique({
            where: {
                caseId_userId: {
                    caseId: caseId,
                    userId: userId
                }
            }
        });

        // Get total like count
        const likeCount = await prisma.caseLike.count({
            where: { caseId: caseId }
        });

        return NextResponse.json({
            isLiked: !!existingLike,
            likeCount
        });
    } catch (error) {
        console.error("Error checking case like:", error);
        return NextResponse.json(
            { error: "Failed to check case like" },
            { status: 500 }
        );
    }
}
