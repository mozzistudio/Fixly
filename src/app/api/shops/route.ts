import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { shopSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (category) {
      where.specialties = {
        some: { category },
      };
    }
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    if (verified === 'true') {
      where.isVerified = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const shops = await prisma.shop.findMany({
      where,
      include: {
        specialties: true,
        _count: {
          select: {
            repairRequests: true,
            reviews: true,
          },
        },
      },
      orderBy: [
        { isVerified: 'desc' },
        { rating: 'desc' },
      ],
    });

    return NextResponse.json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SHOP_OWNER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only shop owners can create shops' }, { status: 403 });
    }

    // Check if user already has a shop
    const existingShop = await prisma.shop.findUnique({
      where: { ownerId: session.user.id },
    });

    if (existingShop) {
      return NextResponse.json({ error: 'You already have a registered shop' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = shopSchema.parse(body);

    const shop = await prisma.shop.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        phone: validatedData.phone,
        email: validatedData.email,
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Add specialties if provided
    if (validatedData.specialties && validatedData.specialties.length > 0) {
      await prisma.shopSpecialty.createMany({
        data: validatedData.specialties.map((category) => ({
          shopId: shop.id,
          category: category as any,
        })),
      });
    }

    return NextResponse.json(shop, { status: 201 });
  } catch (error) {
    console.error('Error creating shop:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
