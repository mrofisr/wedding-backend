// src/index.ts
import { Context, Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { loggerMiddleware } from "@/middleware/logger";
import { systemRoutes } from "@/routes/system";
import { wishesRoutes } from "@/routes/wishes";

interface Env {
  // Add your environment variables here
  DATABASE_URL: string;
  NODE_ENV: string;
}

const app = new Elysia({ aot: false })
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
  .use(wishesRoutes);

// Create handler for Cloudflare Workers
const handler = {
  async fetch(
    request: Request,
    env: Env,
    ctx: Context
  ): Promise<Response> {
    // Add startup logging for development
    if (env.NODE_ENV === 'development') {
      const startupMessage = `
🎉 Wedding Wishes API is running!
⚡️ Mode: ${env.NODE_ENV}
⏰ Started at: ${new Date().toISOString()}
👤 Made by: mrofisr
      `;
      console.log(startupMessage);
    }

    try {
      // Add environment variables to the context
      app.derive(() => ({
        env: {
          DATABASE_URL: env.DATABASE_URL,
          NODE_ENV: env.NODE_ENV
        }
      }));

      // Handle the request
      const response = await app.fetch(request);

      // Add custom headers
      response.headers.set('X-Powered-By', 'Elysia + Cloudflare Workers');
      response.headers.set('X-Response-Time', Date.now().toString());
      response.headers.set('X-Request-ID', crypto.randomUUID());

      return response;
    } catch (error) {
      // Handle errors
      console.error('Error processing request:', error);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal Server Error',
          timestamp: new Date().toISOString(),
          requestId: request.headers.get('cf-ray') || crypto.randomUUID()
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'X-Error-ID': crypto.randomUUID()
          }
        }
      );
    }
  }
};

// Export the handler
export default handler;

// For development with Wrangler
if (process.env.NODE_ENV === 'development') {
  console.log(`
🎉 Wedding Wishes API is ready for development!
📝 Use 'wrangler dev' to start the development server
⏰ Timestamp: ${new Date().toISOString()}
👤 Developer: mrofisr
  `);
}