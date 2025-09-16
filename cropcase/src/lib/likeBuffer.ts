/**
 * Like Buffer System
 * Instagram-like approach for handling likes/unlikes
 * Optimized with Redis Lists and batch processing
 */

import redis from './redis';
import { prisma } from './prisma';

interface LikeOperation {
    userId: string;
    caseId: string;
    action: 'like' | 'unlike';
    timestamp: number;
}

export class LikeBufferManager {
    private static instance: LikeBufferManager;
    private flushInterval: NodeJS.Timeout | null = null;
    private readonly BUFFER_KEY = 'like_buffer';
    private readonly FLUSH_INTERVAL = 10000; // 10 seconds
    private readonly MAX_BUFFER_SIZE = 100;

    private constructor() {
        this.startFlushScheduler();
    }

    static getInstance(): LikeBufferManager {
        if (!LikeBufferManager.instance) {
            LikeBufferManager.instance = new LikeBufferManager();
        }
        return LikeBufferManager.instance;
    }

    /**
     * Add like/unlike operation to buffer
     */
    async bufferOperation(userId: string, caseId: string, action: 'like' | 'unlike'): Promise<void> {
        const operation: LikeOperation = {
            userId,
            caseId,
            action,
            timestamp: Date.now()
        };

        // Store in Redis list for buffering
        await redis.lpush(this.BUFFER_KEY, JSON.stringify(operation));

        // Check if we need immediate flush due to buffer size
        const bufferSize = await redis.llen(this.BUFFER_KEY);
        if (bufferSize >= this.MAX_BUFFER_SIZE) {
            await this.flushBuffer();
        }
    }

    /**
     * Get current like state from buffer + cache for instant UI feedback
     */
    async getLikeState(userId: string, caseId: string): Promise<{ isLiked: boolean; optimistic: boolean }> {
        // Check buffer for latest operation
        const bufferedOperations = await this.getBufferedOperations();
        const userOperations = bufferedOperations
            .filter(op => op.userId === userId && op.caseId === caseId)
            .sort((a, b) => b.timestamp - a.timestamp);

        if (userOperations.length > 0) {
            const latestOp = userOperations[0];
            return {
                isLiked: latestOp.action === 'like',
                optimistic: true // This is from buffer, not DB
            };
        }

        // Fallback to database/cache
        const existingLike = await prisma.caseLike.findUnique({
            where: {
                caseId_userId: { caseId, userId }
            }
        });

        return {
            isLiked: !!existingLike,
            optimistic: false
        };
    }

    /**
     * Flush buffer to database
     */
    private async flushBuffer(): Promise<void> {
        try {
            // console.log('🔄 Flushing like buffer...');

            const operations = await this.getBufferedOperations();
            if (operations.length === 0) return;

            // Group operations by user+case and keep only the latest
            const latestOperations = this.deduplicateOperations(operations);

            // Batch process operations
            await this.processBatchOperations(latestOperations);

            // Clear the buffer
            await redis.del(this.BUFFER_KEY);

            // Invalidate affected caches
            await this.invalidateAffectedCaches(latestOperations);

            console.log(`✅ Flushed ${latestOperations.length} like operations`);

        } catch (error) {
            console.error('❌ Error flushing like buffer:', error);
        }
    }

    private async getBufferedOperations(): Promise<LikeOperation[]> {
        const rawOperations = await redis.lrange(this.BUFFER_KEY, 0, -1);
        return rawOperations.map(op => JSON.parse(op));
    }

    /**
     * Keep only the latest operation per user+case combination
     */
    private deduplicateOperations(operations: LikeOperation[]): LikeOperation[] {
        const latest = new Map<string, LikeOperation>();

        operations
            .sort((a, b) => b.timestamp - a.timestamp) // Latest first
            .forEach(op => {
                const key = `${op.userId}:${op.caseId}`;
                if (!latest.has(key)) {
                    latest.set(key, op);
                }
            });

        return Array.from(latest.values());
    }

    private async processBatchOperations(operations: LikeOperation[]): Promise<void> {
        const likes = operations.filter(op => op.action === 'like');
        const unlikes = operations.filter(op => op.action === 'unlike');

        // Process likes
        if (likes.length > 0) {
            await prisma.caseLike.createMany({
                data: likes.map(op => ({
                    userId: op.userId,
                    caseId: op.caseId
                })),
                skipDuplicates: true
            });
        }

        // Process unlikes
        if (unlikes.length > 0) {
            for (const unlike of unlikes) {
                await prisma.caseLike.deleteMany({
                    where: {
                        userId: unlike.userId,
                        caseId: unlike.caseId
                    }
                });
            }
        }
    }

    private async invalidateAffectedCaches(operations: LikeOperation[]): Promise<void> {
        const affectedCases = new Set(operations.map(op => op.caseId));

        // Invalidate case detail caches
        for (const caseId of affectedCases) {
            await redis.del(`case:detail:${caseId}`);
        }

        // Invalidate community and search caches (batch)
        const [communityKeys, searchKeys] = await Promise.all([
            redis.keys('community:*'),
            redis.keys('search:*')
        ]);

        const keysToDelete = [...communityKeys, ...searchKeys];
        if (keysToDelete.length > 0) {
            await redis.del(...keysToDelete);
        }
    }

    private startFlushScheduler(): void {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }

        this.flushInterval = setInterval(async () => {
            await this.flushBuffer();
        }, this.FLUSH_INTERVAL);
    }

    /**
     * Graceful shutdown
     */
    async shutdown(): Promise<void> {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        await this.flushBuffer(); // Final flush
    }

    /**
     * Get current buffer size (for monitoring)
     */
    async getBufferSize(): Promise<number> {
        try {
            return await redis.llen(this.BUFFER_KEY);
        } catch {
            return 0;
        }
    }
}

// Initialize singleton
export const likeBuffer = LikeBufferManager.getInstance();
