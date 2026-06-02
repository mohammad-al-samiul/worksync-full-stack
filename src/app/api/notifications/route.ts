import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';
import type { AuthenticatedRequest } from '@/lib/middleware';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { userId, role } = request.user;
    // Fetch activity logs relevant to the user
    const logs = await prisma.activityLog.findMany({
      where: {
        OR: [
          // Assigned task notifications (Team Members)
          { actionDescription: { contains: userId, mode: 'insensitive' } },
          // Completed task notifications (Managers)
          { actionDescription: { contains: 'COMPLETED', mode: 'insensitive' } },
        ],
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error('GET Notifications Error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
});
