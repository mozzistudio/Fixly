import { Router } from 'express';
import { updateOrganizationSchema, updateOrganizationSettingsSchema, updateWhatsAppConfigSchema } from '@fixly/core';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/api-error';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

export const organizationsRouter = Router();

organizationsRouter.use(authenticate);

// Get organization details
organizationsRouter.get('/:id', async (req, res, next) => {
  try {
    if (req.params.id !== req.user!.organizationId) {
      throw ApiError.forbidden();
    }

    const organization = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: {
        whatsappConfig: {
          select: {
            id: true,
            phoneNumberId: true,
            displayPhoneNumber: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            users: true,
            customers: true,
            tickets: true,
          },
        },
      },
    });

    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    res.json(organization);
  } catch (error) {
    next(error);
  }
});

// Update organization
organizationsRouter.patch('/:id', requireAdmin, validateBody(updateOrganizationSchema), async (req, res, next) => {
  try {
    if (req.params.id !== req.user!.organizationId) {
      throw ApiError.forbidden();
    }

    const organization = await prisma.organization.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(organization);
  } catch (error) {
    next(error);
  }
});

// Get organization settings
organizationsRouter.get('/:id/settings', async (req, res, next) => {
  try {
    if (req.params.id !== req.user!.organizationId) {
      throw ApiError.forbidden();
    }

    const organization = await prisma.organization.findUnique({
      where: { id: req.params.id },
      select: { settings: true },
    });

    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    res.json(organization.settings);
  } catch (error) {
    next(error);
  }
});

// Update organization settings
organizationsRouter.patch('/:id/settings', requireAdmin, validateBody(updateOrganizationSettingsSchema), async (req, res, next) => {
  try {
    if (req.params.id !== req.user!.organizationId) {
      throw ApiError.forbidden();
    }

    const organization = await prisma.organization.findUnique({
      where: { id: req.params.id },
      select: { settings: true },
    });

    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    const currentSettings = organization.settings as Record<string, any>;
    const updatedSettings = { ...currentSettings, ...req.body };

    const updated = await prisma.organization.update({
      where: { id: req.params.id },
      data: { settings: updatedSettings },
      select: { settings: true },
    });

    res.json(updated.settings);
  } catch (error) {
    next(error);
  }
});

// Get WhatsApp config
organizationsRouter.get('/:id/whatsapp', requireAdmin, async (req, res, next) => {
  try {
    if (req.params.id !== req.user!.organizationId) {
      throw ApiError.forbidden();
    }

    const config = await prisma.whatsAppConfig.findUnique({
      where: { organizationId: req.params.id },
    });

    if (!config) {
      return res.json(null);
    }

    // Mask sensitive data
    res.json({
      ...config,
      accessToken: config.accessToken ? '***' : null,
      webhookVerifyToken: config.webhookVerifyToken ? '***' : null,
    });
  } catch (error) {
    next(error);
  }
});

// Update WhatsApp config
organizationsRouter.put('/:id/whatsapp', requireAdmin, validateBody(updateWhatsAppConfigSchema), async (req, res, next) => {
  try {
    if (req.params.id !== req.user!.organizationId) {
      throw ApiError.forbidden();
    }

    const config = await prisma.whatsAppConfig.upsert({
      where: { organizationId: req.params.id },
      create: {
        organizationId: req.params.id,
        ...req.body,
      },
      update: req.body,
    });

    res.json({
      ...config,
      accessToken: '***',
      webhookVerifyToken: '***',
    });
  } catch (error) {
    next(error);
  }
});

// Dashboard stats
organizationsRouter.get('/:id/dashboard', async (req, res, next) => {
  try {
    if (req.params.id !== req.user!.organizationId) {
      throw ApiError.forbidden();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      openTickets,
      completedToday,
      revenueToday,
      ticketsByStatus,
      recentActivity,
    ] = await Promise.all([
      // Open tickets
      prisma.ticket.count({
        where: {
          organizationId: req.params.id,
          status: {
            notIn: ['CLOSED', 'CANCELLED', 'PICKED_UP'],
          },
        },
      }),

      // Completed today
      prisma.ticket.count({
        where: {
          organizationId: req.params.id,
          completedAt: { gte: today },
        },
      }),

      // Revenue today
      prisma.invoice.aggregate({
        where: {
          organizationId: req.params.id,
          paymentStatus: 'PAID',
          issuedAt: { gte: today },
        },
        _sum: { total: true },
      }),

      // Tickets by status
      prisma.ticket.groupBy({
        by: ['status'],
        where: { organizationId: req.params.id },
        _count: true,
      }),

      // Recent activity
      prisma.ticketStatusLog.findMany({
        where: {
          ticket: { organizationId: req.params.id },
        },
        include: {
          ticket: { select: { code: true } },
          changedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Calculate avg repair time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completedTickets = await prisma.ticket.findMany({
      where: {
        organizationId: req.params.id,
        completedAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, completedAt: true },
    });

    const avgRepairTime =
      completedTickets.length > 0
        ? completedTickets.reduce((acc, t) => {
            const hours =
              (t.completedAt!.getTime() - t.createdAt.getTime()) /
              (1000 * 60 * 60);
            return acc + hours;
          }, 0) / completedTickets.length
        : 0;

    res.json({
      openTickets,
      completedToday,
      revenueToday: Number(revenueToday._sum.total || 0),
      avgRepairTime: Number(avgRepairTime.toFixed(1)),
      ticketsByStatus: ticketsByStatus.reduce(
        (acc, s) => ({ ...acc, [s.status]: s._count }),
        {}
      ),
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        type: 'status_changed',
        title: `Status changed to ${a.toStatus}`,
        description: `Ticket ${a.ticket.code}`,
        timestamp: a.createdAt,
        ticketCode: a.ticket.code,
        userName: `${a.changedBy.firstName} ${a.changedBy.lastName}`,
      })),
    });
  } catch (error) {
    next(error);
  }
});
