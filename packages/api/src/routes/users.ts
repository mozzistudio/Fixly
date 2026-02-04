import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { createUserSchema, updateUserSchema } from '@fixly/core';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/api-error';
import { authenticate, requireAdmin, requireManagerOrAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

export const usersRouter = Router();

usersRouter.use(authenticate);

// Get all users in organization
usersRouter.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { organizationId: req.user!.organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            assignedTickets: {
              where: {
                status: { notIn: ['CLOSED', 'CANCELLED', 'PICKED_UP'] },
              },
            },
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get user by ID
usersRouter.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Create user (invite)
usersRouter.post('/', requireAdmin, validateBody(createUserSchema), async (req, res, next) => {
  try {
    const { email, firstName, lastName, role, phone } = req.body;

    // Check if email already exists in organization
    const existing = await prisma.user.findFirst({
      where: {
        organizationId: req.user!.organizationId,
        email,
      },
    });

    if (existing) {
      throw ApiError.conflict('A user with this email already exists');
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        organizationId: req.user!.organizationId,
        email,
        passwordHash,
        firstName,
        lastName,
        role: role.toUpperCase(),
        phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    // In production, you would send an email with the temp password
    // For now, we return it in the response (not recommended for production)
    res.status(201).json({
      user,
      tempPassword, // Remove this in production!
    });
  } catch (error) {
    next(error);
  }
});

// Update user
usersRouter.patch('/:id', requireManagerOrAdmin, validateBody(updateUserSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Non-admins cannot modify admin users
    if (user.role === 'ADMIN' && req.user!.role !== 'ADMIN') {
      throw ApiError.forbidden('Cannot modify admin users');
    }

    // Non-admins cannot promote to admin
    if (req.body.role === 'ADMIN' && req.user!.role !== 'ADMIN') {
      throw ApiError.forbidden('Cannot assign admin role');
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        role: req.body.role?.toUpperCase(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        phone: true,
        isActive: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Deactivate user
usersRouter.post('/:id/deactivate', requireAdmin, async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.id === req.user!.userId) {
      throw ApiError.badRequest('Cannot deactivate your own account');
    }

    // Check if this is the last admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: {
          organizationId: req.user!.organizationId,
          role: 'ADMIN',
          isActive: true,
        },
      });

      if (adminCount <= 1) {
        throw ApiError.badRequest('Cannot deactivate the last admin');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Reactivate user
usersRouter.post('/:id/activate', requireAdmin, async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Reset user password
usersRouter.post('/:id/reset-password', requireAdmin, async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Generate new temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash },
    });

    // In production, send email with temp password
    res.json({
      message: 'Password reset successfully',
      tempPassword, // Remove in production!
    });
  } catch (error) {
    next(error);
  }
});

// Get user notifications
usersRouter.get('/:id/notifications', async (req, res, next) => {
  try {
    if (req.params.id !== req.user!.userId) {
      throw ApiError.forbidden();
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
usersRouter.post('/:id/notifications/:notificationId/read', async (req, res, next) => {
  try {
    if (req.params.id !== req.user!.userId) {
      throw ApiError.forbidden();
    }

    const notification = await prisma.notification.update({
      where: { id: req.params.notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json(notification);
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
usersRouter.post('/:id/notifications/read-all', async (req, res, next) => {
  try {
    if (req.params.id !== req.user!.userId) {
      throw ApiError.forbidden();
    }

    await prisma.notification.updateMany({
      where: {
        userId: req.params.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});
