import { NextResponse } from "next/server";
import { verifyToken, TokenPayload } from "./auth";

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

export type RouteHandler = (
  request: AuthenticatedRequest,
  context: any
) => Promise<Response> | Response;

/**
 * Protect API routes by checking and verifying the JWT token.
 * Passes the verified user payload to the nested handler.
 */
export function withAuth(handler: RouteHandler) {
  return async (request: Request, context: any) => {
    try {
      const authHeader = request.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Access Denied: Missing or malformed authentication header" },
          { status: 401 }
        );
      }

      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { error: "Access Denied: Invalid or expired security key" },
          { status: 401 }
        );
      }

      // Attach decoded user payload to request
      const authRequest = request as AuthenticatedRequest;
      authRequest.user = decoded;

      return await handler(authRequest, context);
    } catch (error) {
      console.error("Auth Middleware Exception:", error);
      return NextResponse.json(
        { error: "Internal Authorization Failure" },
        { status: 500 }
      );
    }
  };
}

/**
 * Enforces Role-Based Access Control (RBAC) on the wrapped route handler.
 * Verifies that the user role matches one of the allowed role definitions.
 */
export function withRole(
  allowedRoles: ("ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER")[],
  handler: RouteHandler
) {
  return withAuth(async (request, context) => {
    const userRole = request.user.role;
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: `Access Denied: Restricted to roles [${allowedRoles.join(", ")}]` },
        { status: 403 }
      );
    }
    return await handler(request, context);
  });
}
