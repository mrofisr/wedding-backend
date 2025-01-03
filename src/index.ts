// src/index.ts
import { Elysia, t } from "elysia";
import { swagger } from '@elysiajs/swagger';
import { prisma } from './lib/prisma';
import { cors } from '@elysiajs/cors';
import { loggerMiddleware } from "./middleware/logger";

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

const startTime = Date.now();

const AttendingStatus = {
  ATTENDING: 'ATTENDING',
  NOT_ATTENDING: 'NOT_ATTENDING',
  MAYBE: 'MAYBE'
} as const;

// Define the types
const WishDTO = t.Object({
  name: t.String({
    minLength: 2,
    maxLength: 100,
    description: "Name of the person sending the wish"
  }),
  message: t.String({
    minLength: 1,
    maxLength: 500,
    description: "The wish message"
  }),
  attending: t.Enum(AttendingStatus, {
    description: "Attendance status"
  })
});

const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: "Wedding Wishes API",
        version: "1.0.0",
        description: "API for managing wedding wishes and attendance",
        contact: {
          name: "mrofisr",
          url: "https://github.com/mrofisr"
        },
        license: {
          name: "Apache 2.0",
          url: "https://www.apache.org/licenses/LICENSE-2.0.html"
        }
      },
      tags: [
        { name: "system", description: "System endpoints" },
        { name: "wishes", description: "Wishes endpoints" }
      ]
    }
  }))
  .use(cors())
  .use(loggerMiddleware)
  
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

  // Get all wishes
  .get("/wishes", 
    async () => {
      try {
        const wishes = await prisma.wish.findMany({
          orderBy: { timestamp: 'desc' }
        });
        return { success: true, data: wishes };
      } catch (error) {
        return { success: false, error: "Failed to fetch wishes" };
      }
    }, 
    {
      detail: {
        tags: ["wishes"],
        summary: "Get all wishes",
        description: "Retrieves all wishes ordered by timestamp"
      }
    }
  )

  // Get wish by ID
  .get("/wishes/:id", 
    async ({ params: { id } }) => {
      try {
        const wish = await prisma.wish.findUnique({
          where: { id: Number(id) }
        });
        if (!wish) return { success: false, error: "Wish not found" };
        return { success: true, data: wish };
      } catch (error) {
        return { success: false, error: "Failed to fetch wish" };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "The ID of the wish" })
      }),
      detail: {
        tags: ["wishes"],
        summary: "Get wish by ID",
        description: "Retrieves a specific wish by its ID"
      }
    }
  )

  // Create new wish
  .post("/wishes",
    async ({ body }) => {
      try {
        const wish = await prisma.wish.create({
          data: {
            name: body.name,
            message: body.message,
            attending: body.attending,
            timestamp: new Date()
          }
        });
        return { success: true, data: wish };
      } catch (error) {
        return { success: false, error: "Failed to create wish" };
      }
    },
    {
      body: WishDTO,
      detail: {
        tags: ["wishes"],
        summary: "Create new wish",
        description: "Creates a new wish with the provided details"
      }
    }
  )

  // Update wish
  .put("/wishes/:id",
    async ({ params: { id }, body }) => {
      try {
        const wish = await prisma.wish.update({
          where: { id: Number(id) },
          data: {
            name: body.name,
            message: body.message,
            attending: body.attending
          }
        });
        return { success: true, data: wish };
      } catch (error) {
        return { success: false, error: "Failed to update wish" };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "The ID of the wish to update" })
      }),
      body: WishDTO,
      detail: {
        tags: ["wishes"],
        summary: "Update wish",
        description: "Updates an existing wish with the provided details"
      }
    }
  )

  // Delete wish
  .delete("/wishes/:id",
    async ({ params: { id } }) => {
      try {
        await prisma.wish.delete({
          where: { id: Number(id) }
        });
        return { success: true, message: "Wish deleted successfully" };
      } catch (error) {
        return { success: false, error: "Failed to delete wish" };
      }
    },
    {
      params: t.Object({
        id: t.Numeric({ description: "The ID of the wish to delete" })
      }),
      detail: {
        tags: ["wishes"],
        summary: "Delete wish",
        description: "Deletes a specific wish by its ID"
      }
    }
  )

  // Get wishes statistics
  .get("/wishes/stats",
    async () => {
      try {
        const totalWishes = await prisma.wish.count();
        const attendingCount = await prisma.wish.count({
          where: { attending: "ATTENDING" }
        });
        const notAttendingCount = await prisma.wish.count({
          where: { attending: "NOT_ATTENDING" }
        });
        const maybeCount = await prisma.wish.count({
          where: { attending: "MAYBE" }
        });

        return {
          success: true,
          data: {
            total: totalWishes,
            attending: attendingCount,
            notAttending: notAttendingCount,
            maybe: maybeCount
          }
        };
      } catch (error) {
        return { success: false, error: "Failed to fetch statistics" };
      }
    },
    {
      detail: {
        tags: ["wishes"],
        summary: "Get wishes statistics",
        description: "Retrieves statistics about wishes and attendance"
      }
    }
  )

  .listen(3000);

console.log(`
  🎉 Wedding Wishes API is running!
  🔗 HTTP Server: http://${app.server?.hostname}:${app.server?.port}
  📚 Documentation: http://${app.server?.hostname}:${app.server?.port}/swagger
  ⏰ Started at: ${new Date().toISOString()}
`);

export type App = typeof app;