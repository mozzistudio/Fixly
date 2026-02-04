import { Router } from 'express';
import { updateDeviceSchema } from '@fixly/core';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/api-error';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

export const devicesRouter = Router();

devicesRouter.use(authenticate);

// Get device by ID
devicesRouter.get('/:id', async (req, res, next) => {
  try {
    const device = await prisma.device.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        tickets: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!device) {
      throw ApiError.notFound('Device not found');
    }

    res.json(device);
  } catch (error) {
    next(error);
  }
});

// Update device
devicesRouter.patch('/:id', validateBody(updateDeviceSchema), async (req, res, next) => {
  try {
    const device = await prisma.device.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!device) {
      throw ApiError.notFound('Device not found');
    }

    const updatedDevice = await prisma.device.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        type: req.body.type?.toUpperCase(),
      },
    });

    res.json(updatedDevice);
  } catch (error) {
    next(error);
  }
});

// Delete device
devicesRouter.delete('/:id', async (req, res, next) => {
  try {
    const device = await prisma.device.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      include: {
        _count: { select: { tickets: true } },
      },
    });

    if (!device) {
      throw ApiError.notFound('Device not found');
    }

    if (device._count.tickets > 0) {
      throw ApiError.badRequest('Cannot delete device with existing tickets');
    }

    await prisma.device.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
