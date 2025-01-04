import Elysia, { t } from "elysia";
import { prisma } from '@/lib/prisma';

const startTime = Date.now();

// Server info type
const ServerInfoResponse = t.Object({
    success: t.Boolean(),
    data: t.Object({
        timestamp: t.String(),
        timezone: t.String(),
        name: t.String(),
        version: t.String(),
        uptime: t.Number(),
        database: t.String(),
        memory: t.Object({
            heapUsed: t.String(),
            heapTotal: t.String()
        })
    })
});

export const systemRoutes = new Elysia()
    // Root endpoint
    .get("/",
        () => {
            const now = new Date();
            return {
                success: true,
                data: {
                    name: "Wedding Wishes API",
                    timestamp: now.toISOString(),
                    documentation: "/swagger",
                    status: "operational"
                }
            };
        },
        {
            detail: {
                tags: ["system"],
                summary: "Root endpoint",
                description: "Returns basic API information"
            }
        }
    )
    // Ping endpoint
    .get("/ping",
        () => {
            const now = new Date();
            return {
                success: true,
                data: {
                    timestamp: now.toISOString(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    name: "Wedding Wishes API",
                    version: "1.0.0",
                    uptime: Math.floor((Date.now() - startTime) / 1000),
                    database: "connected",
                    memory: {
                        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100 + 'MB',
                        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100 + 'MB'
                    }
                }
            };
        },
        {
            response: ServerInfoResponse,
            detail: {
                tags: ["system"],
                summary: "Ping endpoint",
                description: "Returns server status and health information"
            }
        }
    )
    // Health check endpoint
    .get("/health",
        async () => {
            try {
                // Check database connection
                await prisma.$queryRaw`SELECT 1`;

                return {
                    success: true,
                    data: {
                        status: "healthy",
                        timestamp: new Date().toISOString(),
                        services: {
                            api: "operational",
                            database: "operational"
                        }
                    }
                };
            } catch (error) {
                return {
                    success: false,
                    data: {
                        status: "unhealthy",
                        timestamp: new Date().toISOString(),
                        services: {
                            api: "operational",
                            database: "failed"
                        }
                    }
                };
            }
        },
        {
            detail: {
                tags: ["system"],
                summary: "Health check",
                description: "Checks the health status of the API and its dependencies"
            }
        }
    )