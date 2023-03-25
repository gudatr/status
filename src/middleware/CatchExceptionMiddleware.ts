import { RequestData, NextFunction } from "uws-router";

/**
 * Catches unhandled exceptions as long as the request handler is awaitable
 * @param request 
 * @param next 
 */
export async function CatchExceptionMiddleware(request: RequestData, next: NextFunction): Promise<void> {
    try {
        await next(request);
    } catch (err: any) {
        console.log(err);
        request.writeStatus('500 Internal Server Error');
        request.end('Unhandled exception');
    }
}
