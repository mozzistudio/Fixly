import { Router } from 'express';
import {
  createTicketSchema,
  updateTicketSchema,
  updateTicketStatusSchema,
  assignTicketSchema,
  createTicketNoteSchema,
  ticketFilterSchema,
} from '@fixly/core';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/api-error';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { generateTicketCode } from '../utils/ticket-code';
import { aiRateLimiter } from '../middleware/rate-limiter';
import { aiService } from '../services/ai.service';

export const ticketsRouter = Router();

// All routes require authentication
ticketsRouter.use(authenticate);

// Get all tickets with filters
ticketsRouter.get('/', validateQuery(ticketFilterSchema), async (req, res, next) => {
  try {
    const { page, pageSize, status, priority, assignedToId, customerId, search, sortBy, sortOrder } = req.query as any;

    const where: any = {
      organizationId: req.user!.organizationId,
    };

    if (status) where.status = status.toUpperCase();
    if (priority) where.priority = priority.toUpperCase();
    if (assignedToId) where.assignedToId = assignedToId;
    if (customerId) where.customerId = customerId;

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { issueDescription: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
        { device: { brand: { contains: search, mode: 'insensitive' } } },
        { device: { model: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
          device: {
            select: { id: true, type: true, brand: true, model: true },
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      data: tickets,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    next(error);
  }
});

// Get ticket by ID
ticketsRouter.get('/:id', async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        customer: true,
        device: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
        },
        notes: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        statusLogs: {
          include: {
            changedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        invoice: {
          include: {
            lineItems: true,
            payments: true,
          },
        },
      },
    });

    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

// Create ticket
ticketsRouter.post('/', validateBody(createTicketSchema), async (req, res, next) => {
  try {
    const data = req.body;

    // Verify customer belongs to organization
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customerId,
        organizationId: req.user!.organizationId,
      },
    });

    if (!customer) {
      throw ApiError.badRequest('Customer not found');
    }

    // Verify device belongs to customer
    const device = await prisma.device.findFirst({
      where: {
        id: data.deviceId,
        customerId: data.customerId,
        organizationId: req.user!.organizationId,
      },
    });

    if (!device) {
      throw ApiError.badRequest('Device not found or does not belong to customer');
    }

    // Get organization settings for ticket prefix
    const org = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId },
      select: { settings: true },
    });

    const settings = org?.settings as any;
    const code = await generateTicketCode(req.user!.organizationId, settings?.ticketPrefix || 'FX');

    const ticket = await prisma.ticket.create({
      data: {
        organizationId: req.user!.organizationId,
        code,
        customerId: data.customerId,
        deviceId: data.deviceId,
        assignedToId: data.assignedToId,
        priority: data.priority?.toUpperCase() || 'MEDIUM',
        channel: data.channel?.toUpperCase() || 'WALK_IN',
        issueDescription: data.issueDescription,
        estimatedCompletion: data.estimatedCompletion,
        tags: data.tags || [],
        attachments: [],
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        device: {
          select: { id: true, type: true, brand: true, model: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    // Create status log
    await prisma.ticketStatusLog.create({
      data: {
        ticketId: ticket.id,
        toStatus: 'NEW',
        changedById: req.user!.userId,
        notes: 'Ticket created',
      },
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`org:${req.user!.organizationId}`).emit('ticket:created', ticket);
    }

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

// Update ticket
ticketsRouter.patch('/:id', validateBody(updateTicketSchema), async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        device: {
          select: { id: true, type: true, brand: true, model: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`org:${req.user!.organizationId}`).emit('ticket:updated', updatedTicket);
    }

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
});

// Update ticket status
ticketsRouter.post('/:id/status', validateBody(updateTicketStatusSchema), async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }

    const previousStatus = ticket.status;
    const newStatus = status.toUpperCase();

    const [updatedTicket] = await prisma.$transaction([
      prisma.ticket.update({
        where: { id: req.params.id },
        data: {
          status: newStatus,
          completedAt: ['CLOSED', 'PICKED_UP'].includes(newStatus) ? new Date() : undefined,
        },
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
          device: {
            select: { id: true, type: true, brand: true, model: true },
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      }),
      prisma.ticketStatusLog.create({
        data: {
          ticketId: req.params.id,
          fromStatus: previousStatus,
          toStatus: newStatus,
          changedById: req.user!.userId,
          notes,
        },
      }),
    ]);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`org:${req.user!.organizationId}`).emit('ticket:status_changed', {
        ticket: updatedTicket,
        fromStatus: previousStatus,
        toStatus: newStatus,
      });
    }

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
});

// Assign ticket
ticketsRouter.post('/:id/assign', validateBody(assignTicketSchema), async (req, res, next) => {
  try {
    const { assignedToId } = req.body;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }

    // Verify assignee belongs to organization
    if (assignedToId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: assignedToId,
          organizationId: req.user!.organizationId,
        },
      });

      if (!assignee) {
        throw ApiError.badRequest('User not found');
      }
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: { assignedToId },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        device: {
          select: { id: true, type: true, brand: true, model: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    // Create notification for assignee
    if (assignedToId) {
      await prisma.notification.create({
        data: {
          organizationId: req.user!.organizationId,
          userId: assignedToId,
          type: 'TICKET_ASSIGNED',
          title: 'Ticket assigned to you',
          body: `Ticket ${ticket.code} has been assigned to you`,
          link: `/tickets/${ticket.id}`,
        },
      });
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`org:${req.user!.organizationId}`).emit('ticket:assigned', updatedTicket);
    }

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
});

// Add note to ticket
ticketsRouter.post('/:id/notes', validateBody(createTicketNoteSchema), async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }

    const note = await prisma.ticketNote.create({
      data: {
        ticketId: req.params.id,
        userId: req.user!.userId,
        content: req.body.content,
        isAiGenerated: req.body.isAiGenerated || false,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`org:${req.user!.organizationId}`).emit('ticket:note_added', {
        ticketId: req.params.id,
        note,
      });
    }

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

// AI Diagnose
ticketsRouter.post('/:id/ai/diagnose', aiRateLimiter, async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        device: true,
      },
    });

    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }

    const diagnosis = await aiService.diagnose({
      organizationId: req.user!.organizationId,
      ticketId: ticket.id,
      device: ticket.device,
      issueDescription: ticket.issueDescription,
      attachments: ticket.attachments as any[],
    });

    // Update ticket with AI diagnosis
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { aiDiagnosis: JSON.stringify(diagnosis) },
    });

    res.json(diagnosis);
  } catch (error) {
    next(error);
  }
});

// AI Estimate
ticketsRouter.post('/:id/ai/estimate', aiRateLimiter, async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        device: true,
      },
    });

    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }

    // Get inventory for price matching
    const inventory = await prisma.inventoryItem.findMany({
      where: {
        organizationId: req.user!.organizationId,
        isActive: true,
      },
    });

    const estimate = await aiService.estimate({
      organizationId: req.user!.organizationId,
      ticketId: ticket.id,
      device: ticket.device,
      issueDescription: ticket.issueDescription,
      aiDiagnosis: ticket.aiDiagnosis,
      inventory,
    });

    res.json(estimate);
  } catch (error) {
    next(error);
  }
});

// AI Summarize
ticketsRouter.post('/:id/ai/summarize', aiRateLimiter, async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        device: true,
        customer: true,
        notes: {
          orderBy: { createdAt: 'asc' },
        },
        statusLogs: {
          include: { changedBy: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }

    const summary = await aiService.summarize({
      organizationId: req.user!.organizationId,
      ticketId: ticket.id,
      ticket,
    });

    res.json({ summary });
  } catch (error) {
    next(error);
  }
});
