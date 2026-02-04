import { Router } from 'express';
import { sendWhatsAppMessageSchema } from '@fixly/core';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/api-error';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { whatsappService } from '../services/whatsapp.service';
import { aiService } from '../services/ai.service';
import crypto from 'crypto';

export const whatsappRouter = Router();

// Webhook verification (public - no auth)
whatsappRouter.get('/webhook', async (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Get verify token from environment
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook receiver (public - no auth, but verified by signature)
whatsappRouter.post('/webhook', async (req, res, next) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-hub-signature-256'] as string;
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    if (appSecret && signature) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', appSecret)
        .update(JSON.stringify(req.body))
        .digest('hex')}`;

      if (signature !== expectedSignature) {
        return res.sendStatus(403);
      }
    }

    const body = req.body;

    // Handle incoming messages
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const value = change.value;

            // Handle incoming messages
            if (value.messages) {
              for (const message of value.messages) {
                await handleIncomingMessage(value.metadata.phone_number_id, message, value.contacts?.[0]);
              }
            }

            // Handle status updates
            if (value.statuses) {
              for (const status of value.statuses) {
                await handleStatusUpdate(status);
              }
            }
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.sendStatus(500);
  }
});

async function handleIncomingMessage(phoneNumberId: string, message: any, contact: any) {
  // Find organization by phone number ID
  const config = await prisma.whatsAppConfig.findFirst({
    where: { phoneNumberId, isActive: true },
    include: { organization: true },
  });

  if (!config) {
    console.log('No WhatsApp config found for phone number ID:', phoneNumberId);
    return;
  }

  const fromPhone = message.from;
  const messageBody = message.text?.body || '';
  const messageType = message.type;

  // Find or create customer
  let customer = await prisma.customer.findFirst({
    where: {
      organizationId: config.organizationId,
      OR: [
        { phone: fromPhone },
        { whatsappPhone: fromPhone },
      ],
    },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        organizationId: config.organizationId,
        firstName: contact?.profile?.name?.split(' ')[0] || 'Unknown',
        lastName: contact?.profile?.name?.split(' ').slice(1).join(' ') || '',
        phone: fromPhone,
        whatsappPhone: fromPhone,
      },
    });
  }

  // Find active ticket for this customer
  let ticket = await prisma.ticket.findFirst({
    where: {
      customerId: customer.id,
      status: {
        notIn: ['CLOSED', 'CANCELLED', 'PICKED_UP'],
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // If no active ticket, create one
  if (!ticket) {
    // We need a device - check if customer has any
    let device = await prisma.device.findFirst({
      where: { customerId: customer.id },
    });

    if (!device) {
      device = await prisma.device.create({
        data: {
          organizationId: config.organizationId,
          customerId: customer.id,
          type: 'OTHER',
          brand: 'Unknown',
          model: 'Unknown',
        },
      });
    }

    // Generate ticket code
    const org = await prisma.organization.findUnique({
      where: { id: config.organizationId },
      select: { settings: true },
    });
    const settings = org?.settings as any;
    const year = new Date().getFullYear();
    const latestTicket = await prisma.ticket.findFirst({
      where: { organizationId: config.organizationId },
      orderBy: { code: 'desc' },
    });
    let nextNum = 1;
    if (latestTicket) {
      const parts = latestTicket.code.split('-');
      nextNum = parseInt(parts[2], 10) + 1;
    }
    const code = `${settings?.ticketPrefix || 'FX'}-${year}-${String(nextNum).padStart(5, '0')}`;

    ticket = await prisma.ticket.create({
      data: {
        organizationId: config.organizationId,
        code,
        customerId: customer.id,
        deviceId: device.id,
        channel: 'WHATSAPP',
        issueDescription: messageBody || 'New inquiry via WhatsApp',
        priority: 'MEDIUM',
        status: 'NEW',
      },
    });
  }

  // Save the message
  const ticketMessage = await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      customerId: customer.id,
      direction: 'INBOUND',
      status: 'DELIVERED',
      body: messageBody,
      mediaUrl: message.image?.link || message.document?.link || message.video?.link,
      mediaType: messageType !== 'text' ? messageType : undefined,
      whatsappMessageId: message.id,
    },
  });

  // Generate AI draft reply
  try {
    const aiDraft = await aiService.generateWhatsAppReply({
      organizationId: config.organizationId,
      ticketId: ticket.id,
      customerName: customer.firstName,
      ticketCode: ticket.code,
      ticketStatus: ticket.status,
      deviceInfo: undefined,
      conversationHistory: [],
      latestMessage: messageBody,
      language: config.organization.language,
    });

    await prisma.ticketMessage.update({
      where: { id: ticketMessage.id },
      data: { aiDraftReply: aiDraft },
    });
  } catch (error) {
    console.error('Failed to generate AI draft:', error);
  }

  // Emit socket event for real-time update
  // Note: We'd need to access the io instance here, possibly through a service
}

async function handleStatusUpdate(status: any) {
  const { id, status: newStatus } = status;

  await prisma.ticketMessage.updateMany({
    where: { whatsappMessageId: id },
    data: {
      status: newStatus.toUpperCase() as any,
    },
  });
}

// Protected routes below
whatsappRouter.use(authenticate);

// Get conversations
whatsappRouter.get('/conversations', async (req, res, next) => {
  try {
    // Get unique customers with messages
    const conversations = await prisma.ticketMessage.groupBy({
      by: ['customerId'],
      where: {
        ticket: {
          organizationId: req.user!.organizationId,
        },
      },
      _max: {
        createdAt: true,
      },
      orderBy: {
        _max: {
          createdAt: 'desc',
        },
      },
    });

    const customerIds = conversations.map((c) => c.customerId);

    const customersWithMessages = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      include: {
        tickets: {
          where: {
            status: { notIn: ['CLOSED', 'CANCELLED'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    res.json(customersWithMessages);
  } catch (error) {
    next(error);
  }
});

// Get conversation by ticket
whatsappRouter.get('/conversations/:ticketId', async (req, res, next) => {
  try {
    const messages = await prisma.ticketMessage.findMany({
      where: {
        ticketId: req.params.ticketId,
        ticket: {
          organizationId: req.user!.organizationId,
        },
      },
      include: {
        sentBy: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Send message
whatsappRouter.post('/send', validateBody(sendWhatsAppMessageSchema), async (req, res, next) => {
  try {
    const { ticketId, body, templateName, templateParams } = req.body;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        organizationId: req.user!.organizationId,
      },
      include: {
        customer: true,
      },
    });

    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }

    // Get WhatsApp config
    const config = await prisma.whatsAppConfig.findFirst({
      where: {
        organizationId: req.user!.organizationId,
        isActive: true,
      },
    });

    if (!config) {
      throw ApiError.badRequest('WhatsApp is not configured');
    }

    const customerPhone = ticket.customer.whatsappPhone || ticket.customer.phone;

    // Send message via WhatsApp API
    const result = await whatsappService.sendMessage({
      phoneNumberId: config.phoneNumberId,
      accessToken: config.accessToken,
      to: customerPhone,
      body,
      templateName,
      templateParams,
    });

    // Save outbound message
    const message = await prisma.ticketMessage.create({
      data: {
        ticketId,
        customerId: ticket.customerId,
        direction: 'OUTBOUND',
        status: 'SENT',
        body,
        whatsappMessageId: result.messageId,
        sentById: req.user!.userId,
      },
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`org:${req.user!.organizationId}`).emit('message:sent', message);
    }

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});
