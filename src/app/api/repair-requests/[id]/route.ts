import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repairRequest = await prisma.repairRequest.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        shop: {
          select: { id: true, name: true, address: true, phone: true, email: true },
        },
        technician: {
          select: { id: true, name: true, email: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        review: true,
      },
    });

    if (!repairRequest) {
      return NextResponse.json({ error: 'Repair request not found' }, { status: 404 });
    }

    // Check access permissions
    const hasAccess =
      repairRequest.customerId === session.user.id ||
      repairRequest.shop?.id === session.user.shopId ||
      session.user.role === 'ADMIN';

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(repairRequest);
  } catch (error) {
    console.error('Error fetching repair request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, shopId, technicianId, actualCost, scheduledDate } = body;

    const repairRequest = await prisma.repairRequest.findUnique({
      where: { id: params.id },
    });

    if (!repairRequest) {
      return NextResponse.json({ error: 'Repair request not found' }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedDate = new Date();
      }
    }
    if (shopId) updateData.shopId = shopId;
    if (technicianId) updateData.technicianId = technicianId;
    if (actualCost !== undefined) updateData.actualCost = actualCost;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);

    const updatedRequest = await prisma.repairRequest.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        shop: {
          select: { id: true, name: true },
        },
        technician: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating repair request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repairRequest = await prisma.repairRequest.findUnique({
      where: { id: params.id },
    });

    if (!repairRequest) {
      return NextResponse.json({ error: 'Repair request not found' }, { status: 404 });
    }

    // Only the customer or admin can delete
    if (repairRequest.customerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow deletion if not in progress
    if (['IN_PROGRESS', 'COMPLETED'].includes(repairRequest.status)) {
      return NextResponse.json(
        { error: 'Cannot delete a repair request that is in progress or completed' },
        { status: 400 }
      );
    }

    await prisma.repairRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting repair request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
