import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: { id: true, name: true },
        },
        specialties: true,
        technicians: {
          select: { id: true, name: true, specialties: true, certifications: true },
        },
        reviews: {
          include: {
            customer: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            repairRequests: true,
            reviews: true,
          },
        },
      },
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
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

    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    if (shop.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, address, city, state, zipCode, phone, email, specialties } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (zipCode) updateData.zipCode = zipCode;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    const updatedShop = await prisma.shop.update({
      where: { id: params.id },
      data: updateData,
    });

    // Update specialties if provided
    if (specialties && Array.isArray(specialties)) {
      // Remove existing specialties
      await prisma.shopSpecialty.deleteMany({
        where: { shopId: params.id },
      });

      // Add new specialties
      if (specialties.length > 0) {
        await prisma.shopSpecialty.createMany({
          data: specialties.map((category: string) => ({
            shopId: params.id,
            category: category as any,
          })),
        });
      }
    }

    return NextResponse.json(updatedShop);
  } catch (error) {
    console.error('Error updating shop:', error);
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

    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
    });

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    if (shop.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.shop.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
