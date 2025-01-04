// src/index.ts
import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { loggerMiddleware } from "@/middleware/logger";
import { systemRoutes } from "@/routes/system";
import { wishesRoutes } from "@/routes/wishes";

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
  .use(systemRoutes)
  .use(wishesRoutes)
  .listen(3000);

console.log(`
  🎉 Wedding Wishes API is running!
  🔗 HTTP Server: http://${app.server?.hostname}:${app.server?.port}
  📚 Documentation: http://${app.server?.hostname}:${app.server?.port}/swagger
  ⏰ Started at: ${new Date().toISOString()}
`);

export type App = typeof app;