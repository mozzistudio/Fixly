import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { repairRequestSchema } from '@/lib/validations';
import { generateRepairDiagnosis } from '@/lib/ai/diagnosis';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: Record<string, unknown> = {};

    // Filter by user role
    if (session.user.role === 'CUSTOMER') {
      where.customerId = session.user.id;
    } else if (session.user.role === 'SHOP_OWNER') {
      where.shopId = session.user.shopId;
    }

    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const repairRequests = await prisma.repairRequest.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        shop: {
          select: { id: true, name: true, address: true },
        },
        technician: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(repairRequests);
  } catch (error) {
    console.error('Error fetching repair requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = repairRequestSchema.parse(body);

    // Generate AI diagnosis
    const aiDiagnosis = await generateRepairDiagnosis({
      category: validatedData.category,
      description: validatedData.description,
      deviceType: validatedData.deviceType,
      deviceBrand: validatedData.deviceBrand,
      deviceModel: validatedData.deviceModel,
    });

    // Create repair request with AI diagnosis
    const repairRequest = await prisma.repairRequest.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        urgency: validatedData.urgency,
        deviceType: validatedData.deviceType,
        deviceBrand: validatedData.deviceBrand,
        deviceModel: validatedData.deviceModel,
        images: validatedData.images || [],
        customerId: session.user.id,
        status: 'AI_DIAGNOSED',
        aiDiagnosis: JSON.stringify(aiDiagnosis),
        aiConfidence: aiDiagnosis.confidence,
        estimatedCost: (aiDiagnosis.estimatedCostRange.min + aiDiagnosis.estimatedCostRange.max) / 2,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      repairRequest,
      diagnosis: aiDiagnosis,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating repair request:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
