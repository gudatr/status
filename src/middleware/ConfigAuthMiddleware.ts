import { RequestData, NextFunction } from "uws-router";
import { Environment } from '../services/Environment';

/**
 * Authorizes requests to the configuration part of the app
 * @param request 
 * @param next 
 */
export async function ConfigAuthMiddleware(request: RequestData, next: NextFunction): Promise<void> {

    if (request.headers['Authorization'] === Environment.config.password) {
        await next(request);
    } else {
        request.writeStatus('403 Unauthorized');
        await request.end(' ');
    }
}
