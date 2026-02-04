import { Router } from 'express';
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  adjustInventorySchema,
  inventoryFilterSchema,
} from '@fixly/core';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/api-error';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';

export const inventoryRouter = Router();

inventoryRouter.use(authenticate);

// Get all inventory items
inventoryRouter.get('/', validateQuery(inventoryFilterSchema), async (req, res, next) => {
  try {
    const { page, pageSize, category, brand, lowStock, search, sortBy, sortOrder } = req.query as any;

    const where: any = {
      organizationId: req.user!.organizationId,
    };

    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (lowStock === 'true' || lowStock === true) {
      where.quantity = { lte: prisma.inventoryItem.fields.reorderLevel };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    res.json({
      data: items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    next(error);
  }
});

// Get low stock items
inventoryRouter.get('/low-stock', async (req, res, next) => {
  try {
    const items = await prisma.$queryRaw`
      SELECT * FROM "InventoryItem"
      WHERE "organizationId" = ${req.user!.organizationId}
      AND "quantity" <= "reorderLevel"
      AND "isActive" = true
      ORDER BY "quantity" ASC
    `;

    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Get inventory categories
inventoryRouter.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.inventoryItem.groupBy({
      by: ['category'],
      where: {
        organizationId: req.user!.organizationId,
        category: { not: null },
      },
      _count: true,
    });

    res.json(categories.map((c) => ({ category: c.category, count: c._count })));
  } catch (error) {
    next(error);
  }
});

// Get inventory item by ID
inventoryRouter.get('/:id', async (req, res, next) => {
  try {
    const item = await prisma.inventoryItem.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        movements: {
          include: {
            performedBy: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

// Create inventory item
inventoryRouter.post('/', requireManagerOrAdmin, validateBody(createInventoryItemSchema), async (req, res, next) => {
  try {
    const item = await prisma.inventoryItem.create({
      data: {
        organizationId: req.user!.organizationId,
        ...req.body,
      },
    });

    // If initial quantity > 0, create movement record
    if (req.body.quantity > 0) {
      await prisma.inventoryMovement.create({
        data: {
          inventoryItemId: item.id,
          type: 'PURCHASE',
          quantity: req.body.quantity,
          previousQuantity: 0,
          newQuantity: req.body.quantity,
          cost: req.body.cost,
          performedById: req.user!.userId,
          notes: 'Initial stock',
        },
      });
    }

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

// Update inventory item
inventoryRouter.patch('/:id', requireManagerOrAdmin, validateBody(updateInventoryItemSchema), async (req, res, next) => {
  try {
    const item = await prisma.inventoryItem.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
});

// Adjust inventory quantity
inventoryRouter.post('/:id/adjust', validateBody(adjustInventorySchema), async (req, res, next) => {
  try {
    const { quantity, type, cost, notes } = req.body;

    const item = await prisma.inventoryItem.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }

    let newQuantity: number;
    const adjustmentType = type.toUpperCase();

    switch (adjustmentType) {
      case 'PURCHASE':
      case 'RETURN':
        newQuantity = item.quantity + Math.abs(quantity);
        break;
      case 'SALE':
        newQuantity = item.quantity - Math.abs(quantity);
        break;
      case 'ADJUSTMENT':
        newQuantity = item.quantity + quantity; // Can be positive or negative
        break;
      default:
        throw ApiError.badRequest('Invalid movement type');
    }

    if (newQuantity < 0) {
      throw ApiError.badRequest('Insufficient stock');
    }

    const [updatedItem, movement] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id: req.params.id },
        data: { quantity: newQuantity },
      }),
      prisma.inventoryMovement.create({
        data: {
          inventoryItemId: req.params.id,
          type: adjustmentType,
          quantity: adjustmentType === 'ADJUSTMENT' ? quantity : Math.abs(quantity),
          previousQuantity: item.quantity,
          newQuantity,
          cost,
          performedById: req.user!.userId,
          notes,
        },
      }),
    ]);

    // Check low stock and create notification
    if (newQuantity <= item.reorderLevel) {
      const admins = await prisma.user.findMany({
        where: {
          organizationId: req.user!.organizationId,
          role: { in: ['ADMIN', 'MANAGER'] },
        },
        select: { id: true },
      });

      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          organizationId: req.user!.organizationId,
          userId: admin.id,
          type: 'LOW_STOCK' as const,
          title: 'Low stock alert',
          body: `${item.name} is running low (${newQuantity} remaining)`,
          link: `/inventory/${item.id}`,
        })),
      });
    }

    res.json({ item: updatedItem, movement });
  } catch (error) {
    next(error);
  }
});

// Delete inventory item
inventoryRouter.delete('/:id', requireManagerOrAdmin, async (req, res, next) => {
  try {
    const item = await prisma.inventoryItem.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }

    // Soft delete by setting isActive to false
    await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
