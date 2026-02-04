import type {
  TicketStatus,
  TicketPriority,
  TicketChannel,
  UserRole,
  DeviceType,
  PaymentStatus,
  PaymentMethod,
  LineItemType,
  InventoryMovementType,
  MessageDirection,
  MessageStatus,
  NotificationType,
} from '../constants';

// Base Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Organization
export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  currency: string;
  language: string;
  businessHours?: BusinessHours;
  settings: OrganizationSettings;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export interface OrganizationSettings {
  ticketPrefix: string;
  defaultPriority: TicketPriority;
  autoAssign: boolean;
  requireApprovalForRepairs: boolean;
  sendStatusNotifications: boolean;
  taxRate: number;
  aiEnabled: boolean;
  aiSpendingLimit?: number;
}

// User
export interface User extends BaseEntity {
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface UserWithOrganization extends User {
  organization: Organization;
}

// Customer
export interface Customer extends BaseEntity {
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  whatsappPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  tags: string[];
}

export interface CustomerWithDevices extends Customer {
  devices: Device[];
}

export interface CustomerWithStats extends Customer {
  ticketCount: number;
  lifetimeValue: number;
  lastVisit?: Date;
}

// Device
export interface Device extends BaseEntity {
  organizationId: string;
  customerId: string;
  type: DeviceType;
  brand: string;
  model: string;
  color?: string;
  serialNumber?: string;
  imei?: string;
  conditionNotes?: string;
  purchaseDate?: Date;
}

export interface DeviceWithCustomer extends Device {
  customer: Customer;
}

// Ticket
export interface Ticket extends BaseEntity {
  organizationId: string;
  code: string;
  customerId: string;
  deviceId: string;
  assignedToId?: string;
  priority: TicketPriority;
  status: TicketStatus;
  channel: TicketChannel;
  issueDescription: string;
  aiDiagnosis?: string;
  estimatedCost?: number;
  approvedCost?: number;
  actualCost?: number;
  estimatedCompletion?: Date;
  completedAt?: Date;
  tags: string[];
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface TicketWithRelations extends Ticket {
  customer: Customer;
  device: Device;
  assignedTo?: User;
  notes: TicketNote[];
  messages: TicketMessage[];
  statusLogs: TicketStatusLog[];
  invoice?: Invoice;
}

export interface TicketListItem extends Ticket {
  customer: Pick<Customer, 'id' | 'firstName' | 'lastName' | 'phone'>;
  device: Pick<Device, 'id' | 'type' | 'brand' | 'model'>;
  assignedTo?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
}

// Ticket Status Log
export interface TicketStatusLog extends BaseEntity {
  ticketId: string;
  fromStatus?: TicketStatus;
  toStatus: TicketStatus;
  changedById: string;
  notes?: string;
}

export interface TicketStatusLogWithUser extends TicketStatusLog {
  changedBy: User;
}

// Ticket Note
export interface TicketNote extends BaseEntity {
  ticketId: string;
  userId: string;
  content: string;
  isAiGenerated: boolean;
  attachments: Attachment[];
}

export interface TicketNoteWithUser extends TicketNote {
  user: User;
}

// Ticket Message (WhatsApp)
export interface TicketMessage extends BaseEntity {
  ticketId: string;
  customerId: string;
  direction: MessageDirection;
  status: MessageStatus;
  body: string;
  mediaUrl?: string;
  mediaType?: string;
  whatsappMessageId?: string;
  aiDraftReply?: string;
  sentById?: string;
}

export interface TicketMessageWithSender extends TicketMessage {
  sentBy?: User;
}

// Invoice
export interface Invoice extends BaseEntity {
  organizationId: string;
  ticketId: string;
  customerId: string;
  invoiceNumber: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  dueDate?: Date;
  notes?: string;
  issuedAt: Date;
}

export interface InvoiceWithRelations extends Invoice {
  customer: Customer;
  ticket: Ticket;
  lineItems: InvoiceLineItem[];
  payments: Payment[];
}

// Invoice Line Item
export interface InvoiceLineItem extends BaseEntity {
  invoiceId: string;
  type: LineItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  inventoryItemId?: string;
}

export interface InvoiceLineItemWithInventory extends InvoiceLineItem {
  inventoryItem?: InventoryItem;
}

// Payment
export interface Payment extends BaseEntity {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  receivedById: string;
}

export interface PaymentWithReceiver extends Payment {
  receivedBy: User;
}

// Inventory Item
export interface InventoryItem extends BaseEntity {
  organizationId: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  cost: number;
  price: number;
  quantity: number;
  reorderLevel: number;
  location?: string;
  barcode?: string;
  isActive: boolean;
}

export interface InventoryItemWithMovements extends InventoryItem {
  movements: InventoryMovement[];
}

// Inventory Movement
export interface InventoryMovement extends BaseEntity {
  inventoryItemId: string;
  type: InventoryMovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  cost?: number;
  ticketId?: string;
  invoiceId?: string;
  notes?: string;
  performedById: string;
}

export interface InventoryMovementWithUser extends InventoryMovement {
  performedBy: User;
}

// AI Interaction
export interface AIInteraction extends BaseEntity {
  organizationId: string;
  ticketId?: string;
  type: 'diagnosis' | 'estimate' | 'reply' | 'summarize' | 'categorize';
  prompt: string;
  response: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  durationMs: number;
}

// WhatsApp Config
export interface WhatsAppConfig extends BaseEntity {
  organizationId: string;
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  businessAccountId?: string;
  displayPhoneNumber?: string;
  isActive: boolean;
}

// Notification
export interface Notification extends BaseEntity {
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  readAt?: Date;
}

// Appointment
export interface Appointment extends BaseEntity {
  organizationId: string;
  customerId: string;
  ticketId?: string;
  type: 'drop_off' | 'pickup' | 'consultation';
  scheduledAt: Date;
  duration: number;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
}

export interface AppointmentWithRelations extends Appointment {
  customer: Customer;
  ticket?: Ticket;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// Dashboard Types
export interface DashboardStats {
  openTickets: number;
  completedToday: number;
  revenueToday: number;
  avgRepairTime: number;
  ticketsByStatus: Record<TicketStatus, number>;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'ticket_created' | 'status_changed' | 'payment_received' | 'message_received';
  title: string;
  description: string;
  timestamp: Date;
  ticketId?: string;
  ticketCode?: string;
  userId?: string;
  userName?: string;
}

// Report Types
export interface RevenueReport {
  period: string;
  revenue: number;
  ticketsCompleted: number;
  avgTicketValue: number;
}

export interface TechnicianPerformance {
  userId: string;
  userName: string;
  ticketsCompleted: number;
  avgRepairTime: number;
  revenue: number;
}

// AI Types
export interface AIDiagnosis {
  diagnosis: string;
  confidence: number;
  possibleCauses: string[];
  recommendedRepairs: RecommendedRepair[];
  requiredParts: RequiredPart[];
  riskFactors: string[];
  estimatedTotalCost: { min: number; max: number };
  estimatedCompletionTime: string;
}

export interface RecommendedRepair {
  repair: string;
  estimatedTime: string;
  priority: 'required' | 'recommended' | 'optional';
}

export interface RequiredPart {
  part: string;
  estimatedCost: number;
}

// Re-export constant types
export type {
  TicketStatus,
  TicketPriority,
  TicketChannel,
  UserRole,
  DeviceType,
  PaymentStatus,
  PaymentMethod,
  LineItemType,
  InventoryMovementType,
  MessageDirection,
  MessageStatus,
  NotificationType,
};
