import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { reviewSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // Get the repair request
    const repairRequest = await prisma.repairRequest.findUnique({
      where: { id: validatedData.repairRequestId },
      include: { review: true },
    });

    if (!repairRequest) {
      return NextResponse.json({ error: 'Repair request not found' }, { status: 404 });
    }

    if (repairRequest.customerId !== session.user.id) {
      return NextResponse.json({ error: 'You can only review your own repairs' }, { status: 403 });
    }

    if (repairRequest.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'You can only review completed repairs' },
        { status: 400 }
      );
    }

    if (repairRequest.review) {
      return NextResponse.json(
        { error: 'You have already reviewed this repair' },
        { status: 400 }
      );
    }

    if (!repairRequest.shopId) {
      return NextResponse.json({ error: 'No shop associated with this repair' }, { status: 400 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        customerId: session.user.id,
        shopId: repairRequest.shopId,
        repairRequestId: validatedData.repairRequestId,
      },
      include: {
        customer: {
          select: { id: true, name: true },
        },
      },
    });

    // Update shop rating
    const shopReviews = await prisma.review.findMany({
      where: { shopId: repairRequest.shopId },
    });

    const averageRating =
      shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length;

    await prisma.shop.update({
      where: { id: repairRequest.shopId },
      data: { rating: averageRating },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
