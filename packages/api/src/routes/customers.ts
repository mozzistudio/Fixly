import { Router } from 'express';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createDeviceSchema,
  customerFilterSchema,
} from '@fixly/core';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/api-error';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';

export const customersRouter = Router();

customersRouter.use(authenticate);

// Get all customers
customersRouter.get('/', validateQuery(customerFilterSchema), async (req, res, next) => {
  try {
    const { page, pageSize, search, sortBy, sortOrder } = req.query as any;

    const where: any = {
      organizationId: req.user!.organizationId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { tickets: true, devices: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      data: customers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    next(error);
  }
});

// Get customer by ID
customersRouter.get('/:id', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        devices: true,
        tickets: {
          include: {
            device: {
              select: { type: true, brand: true, model: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    // Calculate lifetime value
    const invoices = await prisma.invoice.aggregate({
      where: {
        customerId: req.params.id,
        paymentStatus: 'PAID',
      },
      _sum: { total: true },
    });

    res.json({
      ...customer,
      lifetimeValue: invoices._sum.total || 0,
    });
  } catch (error) {
    next(error);
  }
});

// Create customer
customersRouter.post('/', validateBody(createCustomerSchema), async (req, res, next) => {
  try {
    const customer = await prisma.customer.create({
      data: {
        organizationId: req.user!.organizationId,
        ...req.body,
        whatsappPhone: req.body.whatsappPhone || req.body.phone,
      },
    });

    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// Update customer
customersRouter.patch('/:id', validateBody(updateCustomerSchema), async (req, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updatedCustomer);
  } catch (error) {
    next(error);
  }
});

// Delete customer
customersRouter.delete('/:id', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        _count: { select: { tickets: true } },
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    if (customer._count.tickets > 0) {
      throw ApiError.badRequest('Cannot delete customer with existing tickets');
    }

    await prisma.customer.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Add device to customer
customersRouter.post('/:id/devices', validateBody(createDeviceSchema.omit({ customerId: true })), async (req, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const device = await prisma.device.create({
      data: {
        organizationId: req.user!.organizationId,
        customerId: req.params.id,
        type: req.body.type.toUpperCase(),
        brand: req.body.brand,
        model: req.body.model,
        color: req.body.color,
        serialNumber: req.body.serialNumber,
        imei: req.body.imei,
        conditionNotes: req.body.conditionNotes,
        purchaseDate: req.body.purchaseDate,
      },
    });

    res.status(201).json(device);
  } catch (error) {
    next(error);
  }
});

// Get customer devices
customersRouter.get('/:id/devices', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const devices = await prisma.device.findMany({
      where: { customerId: req.params.id },
      include: {
        _count: { select: { tickets: true } },
      },
    });

    res.json(devices);
  } catch (error) {
    next(error);
  }
});

// Get customer tickets
customersRouter.get('/:id/tickets', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const tickets = await prisma.ticket.findMany({
      where: { customerId: req.params.id },
      include: {
        device: {
          select: { type: true, brand: true, model: true },
        },
        assignedTo: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tickets);
  } catch (error) {
    next(error);
  }
});
