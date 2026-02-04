import { Router } from 'express';
import { createInvoiceSchema, updateInvoiceSchema, createPaymentSchema } from '@fixly/core';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/api-error';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { generateInvoiceNumber } from '../utils/ticket-code';
import { Decimal } from '@prisma/client/runtime/library';

export const invoicesRouter = Router();

invoicesRouter.use(authenticate);

// Get all invoices
invoicesRouter.get('/', async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, status, search } = req.query as any;

    const where: any = {
      organizationId: req.user!.organizationId,
    };

    if (status) {
      where.paymentStatus = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { ticket: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: {
            select: { firstName: true, lastName: true, phone: true },
          },
          ticket: {
            select: { code: true },
          },
          _count: { select: { payments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      data: invoices,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / Number(pageSize)),
    });
  } catch (error) {
    next(error);
  }
});

// Get invoice by ID
invoicesRouter.get('/:id', async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        customer: true,
        ticket: {
          include: {
            device: true,
          },
        },
        lineItems: {
          include: {
            inventoryItem: {
              select: { name: true, sku: true },
            },
          },
        },
        payments: {
          include: {
            receivedBy: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

// Create invoice from ticket
invoicesRouter.post('/', validateBody(createInvoiceSchema), async (req, res, next) => {
  try {
    const { ticketId, taxRate, discount, discountType, dueDate, notes, lineItems } = req.body;

    // Verify ticket exists and doesn't already have an invoice
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        organizationId: req.user!.organizationId,
      },
      include: {
        invoice: true,
        customer: true,
      },
    });

    if (!ticket) {
      throw ApiError.notFound('Ticket not found');
    }

    if (ticket.invoice) {
      throw ApiError.conflict('Ticket already has an invoice');
    }

    // Calculate totals
    let subtotal = 0;
    const processedLineItems = lineItems.map((item: any) => {
      const total = item.quantity * item.unitPrice;
      subtotal += total;
      return {
        ...item,
        type: item.type.toUpperCase(),
        total,
      };
    });

    // Apply discount
    let discountAmount = 0;
    if (discount > 0) {
      if (discountType === 'percentage') {
        discountAmount = (subtotal * discount) / 100;
      } else {
        discountAmount = discount;
      }
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const total = taxableAmount + taxAmount;

    const invoiceNumber = await generateInvoiceNumber(req.user!.organizationId);

    const invoice = await prisma.invoice.create({
      data: {
        organizationId: req.user!.organizationId,
        ticketId,
        customerId: ticket.customerId,
        invoiceNumber,
        subtotal,
        taxRate,
        taxAmount,
        discount: discountAmount,
        discountType: discountType?.toUpperCase() || 'FIXED',
        total,
        dueDate,
        notes,
        lineItems: {
          create: processedLineItems.map((item: any) => ({
            type: item.type,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            inventoryItemId: item.inventoryItemId,
          })),
        },
      },
      include: {
        customer: true,
        ticket: { select: { code: true } },
        lineItems: true,
      },
    });

    // Deduct inventory for parts
    const partLineItems = lineItems.filter((item: any) => item.inventoryItemId);
    for (const item of partLineItems) {
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: item.inventoryItemId },
      });

      if (inventoryItem) {
        await prisma.$transaction([
          prisma.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: { quantity: { decrement: item.quantity } },
          }),
          prisma.inventoryMovement.create({
            data: {
              inventoryItemId: item.inventoryItemId,
              type: 'SALE',
              quantity: item.quantity,
              previousQuantity: inventoryItem.quantity,
              newQuantity: inventoryItem.quantity - item.quantity,
              ticketId,
              performedById: req.user!.userId,
              notes: `Invoice ${invoiceNumber}`,
            },
          }),
        ]);
      }
    }

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
});

// Update invoice
invoicesRouter.patch('/:id', validateBody(updateInvoiceSchema), async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }

    if (invoice.paymentStatus === 'PAID') {
      throw ApiError.badRequest('Cannot modify a paid invoice');
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updatedInvoice);
  } catch (error) {
    next(error);
  }
});

// Record payment
invoicesRouter.post('/:id/payment', validateBody(createPaymentSchema.omit({ invoiceId: true })), async (req, res, next) => {
  try {
    const { amount, method, reference, notes } = req.body;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }

    const totalDecimal = invoice.total as Decimal;
    const paidAmountDecimal = invoice.paidAmount as Decimal;
    const remaining = totalDecimal.toNumber() - paidAmountDecimal.toNumber();

    if (amount > remaining) {
      throw ApiError.badRequest(`Payment amount exceeds remaining balance of ${remaining.toFixed(2)}`);
    }

    const newPaidAmount = paidAmountDecimal.toNumber() + amount;
    const newStatus = newPaidAmount >= totalDecimal.toNumber() ? 'PAID' : 'PARTIAL';

    const [payment, updatedInvoice] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          invoiceId: req.params.id,
          amount,
          method: method.toUpperCase(),
          reference,
          notes,
          receivedById: req.user!.userId,
        },
      }),
      prisma.invoice.update({
        where: { id: req.params.id },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: newStatus,
        },
      }),
    ]);

    // Create notification
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
        type: 'PAYMENT_RECEIVED' as const,
        title: 'Payment received',
        body: `Payment of $${amount.toFixed(2)} received for ${invoice.invoiceNumber}`,
        link: `/invoices/${invoice.id}`,
      })),
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`org:${req.user!.organizationId}`).emit('payment:received', {
        payment,
        invoice: updatedInvoice,
      });
    }

    res.status(201).json({ payment, invoice: updatedInvoice });
  } catch (error) {
    next(error);
  }
});

// Get invoice PDF (placeholder - would need PDF generation library)
invoicesRouter.get('/:id/pdf', async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        customer: true,
        ticket: { include: { device: true } },
        lineItems: true,
        organization: true,
      },
    });

    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }

    // In a real implementation, you would generate a PDF here
    // using a library like puppeteer, pdfkit, or jsPDF
    res.json({
      message: 'PDF generation would happen here',
      invoice,
    });
  } catch (error) {
    next(error);
  }
});
