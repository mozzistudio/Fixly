import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateChatResponse } from '@/lib/ai/diagnosis';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const repairRequest = await prisma.repairRequest.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20, // Limit conversation history
        },
      },
    });

    if (!repairRequest) {
      return NextResponse.json({ error: 'Repair request not found' }, { status: 404 });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        content: message,
        isAI: false,
        repairRequestId: params.id,
      },
    });

    // Build context and conversation history
    const repairContext = `
Title: ${repairRequest.title}
Category: ${repairRequest.category}
Description: ${repairRequest.description}
Status: ${repairRequest.status}
${repairRequest.aiDiagnosis ? `AI Diagnosis: ${repairRequest.aiDiagnosis}` : ''}
${repairRequest.deviceType ? `Device: ${repairRequest.deviceType}` : ''}
${repairRequest.deviceBrand ? `Brand: ${repairRequest.deviceBrand}` : ''}
${repairRequest.deviceModel ? `Model: ${repairRequest.deviceModel}` : ''}
    `.trim();

    const conversationHistory = repairRequest.messages.map((msg) => ({
      role: msg.isAI ? 'assistant' as const : 'user' as const,
      content: msg.content,
    }));

    // Generate AI response
    const aiResponseText = await generateChatResponse(
      repairContext,
      conversationHistory,
      message
    );

    // Save AI response
    const aiMessage = await prisma.message.create({
      data: {
        content: aiResponseText,
        isAI: true,
        repairRequestId: params.id,
      },
    });

    return NextResponse.json({
      userMessage,
      aiMessage,
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: { repairRequestId: params.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
