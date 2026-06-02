import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";

/**
 * GET /api/activity
 * Fetches all activity logs, ordered by timestamp descending.
 * Secured with JWT session validation.
 */
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 100, // Cap at 100 entries for efficiency
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET Activity Logs Exception:", error);
    return NextResponse.json(
      { error: "Failed to query system activity logs" },
      { status: 500 }
    );
  }
});
