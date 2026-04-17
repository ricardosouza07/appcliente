import { NextResponse } from 'next/server';
import { PrismaClient, PipelineStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    const clients = await prisma.client.findMany({
      where: status ? { pipelineStatus: status as PipelineStatus } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, pipelineStatus } = body;

    if (!id || !pipelineStatus) {
      return NextResponse.json({ error: 'Missing id or pipelineStatus' }, { status: 400 });
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: { pipelineStatus: pipelineStatus as PipelineStatus },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}
