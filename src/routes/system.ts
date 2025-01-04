import { prisma } from "@/lib/prisma";
import Elysia from "elysia";

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
                console.log(`"Kocak bapak lu: ${error}"`)
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