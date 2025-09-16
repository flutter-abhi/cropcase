import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiErrorResponse } from '@/types/api';
import { likeBuffer } from '@/lib/likeBuffer';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: caseId } = await params;

        // Get user ID from middleware (already authenticated)
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json<ApiErrorResponse>({
                error: 'User not authenticated',
                code: 'NOT_AUTHENTICATED'
            }, { status: 401 });
        }

        // Validate case ID
        if (!caseId) {
            return NextResponse.json<ApiErrorResponse>({
                error: 'Case ID is required',
                code: 'MISSING_CASE_ID'
            }, { status: 400 });
        }

        // Check if case exists
        const caseExists = await prisma.case.findUnique({
            where: { id: caseId },
            select: { id: true, userId: true, isPublic: true }
        });

        if (!caseExists) {
            return NextResponse.json<ApiErrorResponse>({
                error: 'Case not found',
                code: 'CASE_NOT_FOUND'
            }, { status: 404 });
        }


        // Check current state to prevent double-liking
        const { isLiked } = await likeBuffer.getLikeState(userId, caseId);

        if (isLiked) {
            return NextResponse.json<ApiErrorResponse>({
                error: 'Case already liked',
                code: 'ALREADY_LIKED'
            }, { status: 400 });
        }

        // Buffer the like operation (instant response!)
        await likeBuffer.bufferOperation(userId, caseId, 'like');

        return NextResponse.json({
            success: true,
            message: 'Case liked successfully',
            data: {
                caseId,
                userId,
                isLiked: true,
                buffered: true // Indicates this is optimistic
            }
        });

    } catch (error) {
        console.error('Error liking case:', error);
        return NextResponse.json<ApiErrorResponse>({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: caseId } = await params;

        // Get user ID from middleware (already authenticated)
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json<ApiErrorResponse>({
                error: 'User not authenticated',
                code: 'NOT_AUTHENTICATED'
            }, { status: 401 });
        }

        // Validate case ID
        if (!caseId) {
            return NextResponse.json<ApiErrorResponse>({
                error: 'Case ID is required',
                code: 'MISSING_CASE_ID'
            }, { status: 400 });
        }

        // Check current state
        const { isLiked } = await likeBuffer.getLikeState(userId, caseId);

        if (!isLiked) {
            return NextResponse.json<ApiErrorResponse>({
                error: 'Case not liked',
                code: 'NOT_LIKED'
            }, { status: 404 });
        }

        // Buffer the unlike operation
        await likeBuffer.bufferOperation(userId, caseId, 'unlike');

        return NextResponse.json({
            success: true,
            message: 'Case unliked successfully',
            data: {
                caseId,
                userId,
                isLiked: false,
                buffered: true
            }
        });

    } catch (error) {
        console.error('Error unliking case:', error);
        return NextResponse.json<ApiErrorResponse>({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        }, { status: 500 });
    }
}
