/**
 * Graceful Shutdown Handler
 * Ensures all buffers are flushed before process termination
 */

import { likeBuffer } from './likeBuffer';

export function setupGracefulShutdown(): void {
    // Handle SIGTERM (production deployments)
    process.on('SIGTERM', async () => {
        console.log('🛑 SIGTERM received, flushing buffers...');
        await likeBuffer.shutdown();
        process.exit(0);
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
        console.log('🛑 SIGINT received, flushing buffers...');
        await likeBuffer.shutdown();
        process.exit(0);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
        console.error('💥 Uncaught Exception:', error);
        await likeBuffer.shutdown();
        process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
        console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
        await likeBuffer.shutdown();
        process.exit(1);
    });

    console.log('✅ Graceful shutdown handlers registered');
}
