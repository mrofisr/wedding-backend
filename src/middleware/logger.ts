// src/middleware/logger.ts
import { Elysia } from 'elysia';
import Logger from '@/utils/logger';

// Define types for the store and error
type Store = {
  requestId: string;
  startTime: number;
};

type ErrorWithStatus = Error & {
  status?: number;
};

export const loggerMiddleware = new Elysia()
  .derive(({ request }) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    return { requestId, startTime } as Store;
  })
  .onRequest(({ request, store }) => {
    const { requestId, startTime } = store as Store;
    console.log(`\x1b[90m[${new Date().toISOString()}]\x1b[0m 🔄 Starting ${request.method} ${request.url}`);
  })
  .onAfterHandle(({ request, store, path }) => {
    const { startTime, requestId } = store as Store;
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const url = new URL(request.url);

    Logger.log({
      timestamp: new Date().toISOString(),
      method: request.method,
      path: path || url.pathname,
      status: 200, // Default success status
      responseTime,
      requestId,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          undefined,
      query: Object.fromEntries(url.searchParams)
    });
  })
  .onError(({ error, request, store, path }) => {
    const { startTime, requestId } = store as Store;
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const url = new URL(request.url);
    const typedError = error as ErrorWithStatus;

    Logger.log({
      timestamp: new Date().toISOString(),
      method: request.method,
      path: path || url.pathname,
      status: typedError.status || 500,
      responseTime,
      requestId,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          undefined,
      query: Object.fromEntries(url.searchParams),
      error: {
        message: typedError.message || 'Unknown error',
        stack: typedError.stack
      }
    });
  });