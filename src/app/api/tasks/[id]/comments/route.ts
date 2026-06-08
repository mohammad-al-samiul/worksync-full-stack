import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';
import type { AuthenticatedRequest } from '@/lib/middleware';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { userId } = request.user;
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error('GET Comments Error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
});

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { userId } = request.user;
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
    const body = await request.json();
    const { text } = body;
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Comment text required' }, { status: 400 });
    }
    const comment = await prisma.comment.create({
      data: { text, taskId, authorId: userId },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    const task = await prisma.task.findUnique({ where: { id: taskId }, select: { title: true } });
    if (task) {
      await prisma.activityLog.create({
        data: {
          userId,
          actionDescription: `Comment added on task "${task.title}"`,
        },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('POST Comment Error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
});
