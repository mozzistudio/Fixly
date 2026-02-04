import { z } from 'zod';
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CHANNELS,
  USER_ROLES,
  DEVICE_TYPES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  LINE_ITEM_TYPES,
  INVENTORY_MOVEMENT_TYPES,
  MESSAGE_DIRECTIONS,
  MESSAGE_STATUSES,
} from '../constants';

// Helper for enum values
const enumValues = <T extends Record<string, string>>(obj: T) =>
  Object.values(obj) as [string, ...string[]];

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// User Schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(enumValues(USER_ROLES)),
  phone: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial();

// Customer Schemas
export const createCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  whatsappPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// Device Schemas
export const createDeviceSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  type: z.enum(enumValues(DEVICE_TYPES)),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  color: z.string().optional(),
  serialNumber: z.string().optional(),
  imei: z.string().optional(),
  conditionNotes: z.string().optional(),
  purchaseDate: z.coerce.date().optional(),
});

export const updateDeviceSchema = createDeviceSchema.partial().omit({ customerId: true });

// Ticket Schemas
export const createTicketSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  deviceId: z.string().uuid('Invalid device ID'),
  assignedToId: z.string().uuid('Invalid user ID').optional(),
  priority: z.enum(enumValues(TICKET_PRIORITIES)).default('medium'),
  channel: z.enum(enumValues(TICKET_CHANNELS)).default('walk_in'),
  issueDescription: z.string().min(10, 'Please describe the issue in more detail'),
  estimatedCompletion: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
});

export const updateTicketSchema = z.object({
  assignedToId: z.string().uuid('Invalid user ID').optional().nullable(),
  priority: z.enum(enumValues(TICKET_PRIORITIES)).optional(),
  issueDescription: z.string().min(10).optional(),
  aiDiagnosis: z.string().optional(),
  estimatedCost: z.number().min(0).optional(),
  approvedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  estimatedCompletion: z.coerce.date().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(enumValues(TICKET_STATUSES)),
  notes: z.string().optional(),
});

export const assignTicketSchema = z.object({
  assignedToId: z.string().uuid('Invalid user ID').nullable(),
});

// Ticket Note Schemas
export const createTicketNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  isAiGenerated: z.boolean().default(false),
});

// Invoice Schemas
export const createInvoiceSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket ID'),
  taxRate: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).default(0),
  discountType: z.enum(['percentage', 'fixed']).default('fixed'),
  dueDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  lineItems: z.array(
    z.object({
      type: z.enum(enumValues(LINE_ITEM_TYPES)),
      description: z.string().min(1, 'Description is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unitPrice: z.number().min(0, 'Unit price must be positive'),
      inventoryItemId: z.string().uuid().optional(),
    })
  ).min(1, 'At least one line item is required'),
});

export const updateInvoiceSchema = z.object({
  taxRate: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional(),
});

// Payment Schemas
export const createPaymentSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(enumValues(PAYMENT_METHODS)),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// Inventory Schemas
export const createInventoryItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  cost: z.number().min(0, 'Cost must be positive'),
  price: z.number().min(0, 'Price must be positive'),
  quantity: z.number().int().min(0, 'Quantity must be positive').default(0),
  reorderLevel: z.number().int().min(0).default(5),
  location: z.string().optional(),
  barcode: z.string().optional(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial().omit({ sku: true });

export const adjustInventorySchema = z.object({
  quantity: z.number().int(),
  type: z.enum(enumValues(INVENTORY_MOVEMENT_TYPES)),
  cost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// WhatsApp Message Schemas
export const sendWhatsAppMessageSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket ID'),
  body: z.string().min(1, 'Message body is required'),
  templateName: z.string().optional(),
  templateParams: z.array(z.string()).optional(),
});

// Organization Settings Schemas
export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().url().optional().nullable(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  timezone: z.string().optional(),
  currency: z.string().length(3).optional(),
  language: z.string().length(2).optional(),
});

export const updateOrganizationSettingsSchema = z.object({
  ticketPrefix: z.string().min(1).max(5).optional(),
  defaultPriority: z.enum(enumValues(TICKET_PRIORITIES)).optional(),
  autoAssign: z.boolean().optional(),
  requireApprovalForRepairs: z.boolean().optional(),
  sendStatusNotifications: z.boolean().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  aiEnabled: z.boolean().optional(),
  aiSpendingLimit: z.number().min(0).optional().nullable(),
});

// WhatsApp Config Schemas
export const updateWhatsAppConfigSchema = z.object({
  phoneNumberId: z.string().min(1, 'Phone number ID is required'),
  accessToken: z.string().min(1, 'Access token is required'),
  webhookVerifyToken: z.string().min(1, 'Webhook verify token is required'),
  businessAccountId: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Appointment Schemas
export const createAppointmentSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  ticketId: z.string().uuid('Invalid ticket ID').optional(),
  type: z.enum(['drop_off', 'pickup', 'consultation']),
  scheduledAt: z.coerce.date(),
  duration: z.number().int().min(15, 'Duration must be at least 15 minutes').default(30),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  scheduledAt: z.coerce.date().optional(),
  duration: z.number().int().min(15).optional(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
});

// Query/Filter Schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const ticketFilterSchema = paginationSchema.extend({
  status: z.enum(enumValues(TICKET_STATUSES)).optional(),
  priority: z.enum(enumValues(TICKET_PRIORITIES)).optional(),
  assignedToId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const customerFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const inventoryFilterSchema = paginationSchema.extend({
  category: z.string().optional(),
  brand: z.string().optional(),
  lowStock: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name', 'quantity', 'price']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const reportDateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

// Type exports for use in other packages
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type CreateTicketNoteInput = z.infer<typeof createTicketNoteSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;
export type SendWhatsAppMessageInput = z.infer<typeof sendWhatsAppMessageSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type UpdateOrganizationSettingsInput = z.infer<typeof updateOrganizationSettingsSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type TicketFilterInput = z.infer<typeof ticketFilterSchema>;
export type CustomerFilterInput = z.infer<typeof customerFilterSchema>;
export type InventoryFilterInput = z.infer<typeof inventoryFilterSchema>;
export type ReportDateRangeInput = z.infer<typeof reportDateRangeSchema>;
