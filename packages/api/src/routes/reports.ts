import { Router } from 'express';
import { reportDateRangeSchema } from '@fixly/core';
import { prisma } from '../utils/prisma';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';

export const reportsRouter = Router();

reportsRouter.use(authenticate);
reportsRouter.use(requireManagerOrAdmin);

// Revenue report
reportsRouter.get('/revenue', validateQuery(reportDateRangeSchema), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query as any;

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId: req.user!.organizationId,
        issuedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        paymentStatus: 'PAID',
      },
      select: {
        total: true,
        issuedAt: true,
      },
    });

    // Group by day
    const revenueByDay: Record<string, { revenue: number; count: number }> = {};

    invoices.forEach((invoice) => {
      const day = invoice.issuedAt.toISOString().split('T')[0];
      if (!revenueByDay[day]) {
        revenueByDay[day] = { revenue: 0, count: 0 };
      }
      revenueByDay[day].revenue += Number(invoice.total);
      revenueByDay[day].count += 1;
    });

    const data = Object.entries(revenueByDay)
      .map(([date, { revenue, count }]) => ({
        date,
        revenue: Number(revenue.toFixed(2)),
        ticketsCompleted: count,
        avgTicketValue: count > 0 ? Number((revenue / count).toFixed(2)) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totals = data.reduce(
      (acc, day) => ({
        totalRevenue: acc.totalRevenue + day.revenue,
        totalTickets: acc.totalTickets + day.ticketsCompleted,
      }),
      { totalRevenue: 0, totalTickets: 0 }
    );

    res.json({
      data,
      summary: {
        ...totals,
        avgTicketValue:
          totals.totalTickets > 0
            ? Number((totals.totalRevenue / totals.totalTickets).toFixed(2))
            : 0,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Technician performance report
reportsRouter.get('/technicians', validateQuery(reportDateRangeSchema), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query as any;

    const technicians = await prisma.user.findMany({
      where: {
        organizationId: req.user!.organizationId,
        role: { in: ['TECHNICIAN', 'MANAGER', 'ADMIN'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });

    const performance = await Promise.all(
      technicians.map(async (tech) => {
        // Get completed tickets
        const completedTickets = await prisma.ticket.findMany({
          where: {
            assignedToId: tech.id,
            completedAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          include: {
            invoice: {
              where: { paymentStatus: 'PAID' },
              select: { total: true },
            },
          },
        });

        // Calculate avg repair time
        const ticketsWithTime = completedTickets.filter(
          (t) => t.completedAt && t.createdAt
        );
        const avgRepairTimeHours =
          ticketsWithTime.length > 0
            ? ticketsWithTime.reduce((acc, t) => {
                const hours =
                  (t.completedAt!.getTime() - t.createdAt.getTime()) /
                  (1000 * 60 * 60);
                return acc + hours;
              }, 0) / ticketsWithTime.length
            : 0;

        // Calculate revenue
        const revenue = completedTickets.reduce(
          (acc, t) => acc + (t.invoice ? Number(t.invoice.total) : 0),
          0
        );

        return {
          userId: tech.id,
          userName: `${tech.firstName} ${tech.lastName}`,
          avatar: tech.avatar,
          ticketsCompleted: completedTickets.length,
          avgRepairTime: Number(avgRepairTimeHours.toFixed(1)),
          revenue: Number(revenue.toFixed(2)),
        };
      })
    );

    res.json({
      data: performance.sort((a, b) => b.ticketsCompleted - a.ticketsCompleted),
      startDate,
      endDate,
    });
  } catch (error) {
    next(error);
  }
});

// Tickets by category/device
reportsRouter.get('/tickets/breakdown', validateQuery(reportDateRangeSchema), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query as any;

    // By device type
    const byDeviceType = await prisma.ticket.groupBy({
      by: ['deviceId'],
      where: {
        organizationId: req.user!.organizationId,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _count: true,
    });

    // Get device details
    const devices = await prisma.device.findMany({
      where: { id: { in: byDeviceType.map((d) => d.deviceId) } },
      select: { id: true, type: true, brand: true },
    });

    const deviceMap = new Map(devices.map((d) => [d.id, d]));

    // Aggregate by device type
    const deviceTypeBreakdown: Record<string, number> = {};
    byDeviceType.forEach((item) => {
      const device = deviceMap.get(item.deviceId);
      const type = device?.type || 'UNKNOWN';
      deviceTypeBreakdown[type] = (deviceTypeBreakdown[type] || 0) + item._count;
    });

    // By status
    const byStatus = await prisma.ticket.groupBy({
      by: ['status'],
      where: {
        organizationId: req.user!.organizationId,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _count: true,
    });

    // By priority
    const byPriority = await prisma.ticket.groupBy({
      by: ['priority'],
      where: {
        organizationId: req.user!.organizationId,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _count: true,
    });

    // By channel
    const byChannel = await prisma.ticket.groupBy({
      by: ['channel'],
      where: {
        organizationId: req.user!.organizationId,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _count: true,
    });

    res.json({
      byDeviceType: Object.entries(deviceTypeBreakdown).map(([type, count]) => ({
        type,
        count,
      })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byPriority: byPriority.map((p) => ({ priority: p.priority, count: p._count })),
      byChannel: byChannel.map((c) => ({ channel: c.channel, count: c._count })),
      startDate,
      endDate,
    });
  } catch (error) {
    next(error);
  }
});

// Inventory report
reportsRouter.get('/inventory', async (req, res, next) => {
  try {
    // Low stock items
    const lowStockItems = await prisma.$queryRaw`
      SELECT id, name, sku, quantity, "reorderLevel", cost, price
      FROM "InventoryItem"
      WHERE "organizationId" = ${req.user!.organizationId}
      AND "quantity" <= "reorderLevel"
      AND "isActive" = true
    ` as any[];

    // Total inventory value
    const inventoryValue = await prisma.inventoryItem.aggregate({
      where: {
        organizationId: req.user!.organizationId,
        isActive: true,
      },
      _sum: {
        quantity: true,
      },
    });

    // Items with detailed value
    const items = await prisma.inventoryItem.findMany({
      where: {
        organizationId: req.user!.organizationId,
        isActive: true,
      },
      select: {
        quantity: true,
        cost: true,
        price: true,
      },
    });

    const totalCostValue = items.reduce(
      (acc, item) => acc + item.quantity * Number(item.cost),
      0
    );
    const totalRetailValue = items.reduce(
      (acc, item) => acc + item.quantity * Number(item.price),
      0
    );

    // Most used parts (by sales)
    const topParts = await prisma.inventoryMovement.groupBy({
      by: ['inventoryItemId'],
      where: {
        inventoryItem: {
          organizationId: req.user!.organizationId,
        },
        type: 'SALE',
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    const topPartsDetails = await prisma.inventoryItem.findMany({
      where: { id: { in: topParts.map((p) => p.inventoryItemId) } },
      select: { id: true, name: true, sku: true },
    });

    res.json({
      summary: {
        totalItems: items.length,
        totalQuantity: inventoryValue._sum.quantity || 0,
        totalCostValue: Number(totalCostValue.toFixed(2)),
        totalRetailValue: Number(totalRetailValue.toFixed(2)),
        lowStockCount: lowStockItems.length,
      },
      lowStockItems,
      topParts: topParts.map((p) => {
        const details = topPartsDetails.find((d) => d.id === p.inventoryItemId);
        return {
          ...details,
          totalSold: p._sum.quantity || 0,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
});

// AI usage report
reportsRouter.get('/ai-usage', validateQuery(reportDateRangeSchema), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query as any;

    const interactions = await prisma.aIInteraction.findMany({
      where: {
        organizationId: req.user!.organizationId,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        type: true,
        inputTokens: true,
        outputTokens: true,
        cost: true,
        createdAt: true,
      },
    });

    // Group by type
    const byType: Record<
      string,
      { count: number; inputTokens: number; outputTokens: number; cost: number }
    > = {};

    interactions.forEach((i) => {
      if (!byType[i.type]) {
        byType[i.type] = { count: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
      }
      byType[i.type].count += 1;
      byType[i.type].inputTokens += i.inputTokens;
      byType[i.type].outputTokens += i.outputTokens;
      byType[i.type].cost += Number(i.cost);
    });

    // Group by day
    const byDay: Record<string, number> = {};
    interactions.forEach((i) => {
      const day = i.createdAt.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + Number(i.cost);
    });

    const totalCost = interactions.reduce((acc, i) => acc + Number(i.cost), 0);
    const totalTokens = interactions.reduce(
      (acc, i) => acc + i.inputTokens + i.outputTokens,
      0
    );

    res.json({
      summary: {
        totalInteractions: interactions.length,
        totalTokens,
        totalCost: Number(totalCost.toFixed(4)),
        startDate,
        endDate,
      },
      byType: Object.entries(byType).map(([type, data]) => ({
        type,
        ...data,
        cost: Number(data.cost.toFixed(4)),
      })),
      dailyCosts: Object.entries(byDay)
        .map(([date, cost]) => ({
          date,
          cost: Number(cost.toFixed(4)),
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (error) {
    next(error);
  }
});
