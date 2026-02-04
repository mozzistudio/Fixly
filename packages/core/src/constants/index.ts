// Ticket Statuses
export const TICKET_STATUSES = {
  NEW: 'new',
  CHECKED_IN: 'checked_in',
  DIAGNOSING: 'diagnosing',
  WAITING_APPROVAL: 'waiting_approval',
  WAITING_PARTS: 'waiting_parts',
  IN_REPAIR: 'in_repair',
  QUALITY_CHECK: 'quality_check',
  REPAIRED: 'repaired',
  READY_PICKUP: 'ready_pickup',
  PICKED_UP: 'picked_up',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  new: 'New',
  checked_in: 'Checked In',
  diagnosing: 'Diagnosing',
  waiting_approval: 'Waiting Approval',
  waiting_parts: 'Waiting for Parts',
  in_repair: 'In Repair',
  quality_check: 'Quality Check',
  repaired: 'Repaired',
  ready_pickup: 'Ready for Pickup',
  picked_up: 'Picked Up',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  new: '#6C3BF5',
  checked_in: '#8B66F7',
  diagnosing: '#FF6B35',
  waiting_approval: '#F59E0B',
  waiting_parts: '#EF4444',
  in_repair: '#3B82F6',
  quality_check: '#8B5CF6',
  repaired: '#10B981',
  ready_pickup: '#00D4AA',
  picked_up: '#059669',
  closed: '#6B7280',
  cancelled: '#9CA3AF',
};

export type TicketStatus = (typeof TICKET_STATUSES)[keyof typeof TICKET_STATUSES];

// Ticket Priorities
export const TICKET_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const TICKET_PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: '#6B7280',
  medium: '#3B82F6',
  high: '#F59E0B',
  urgent: '#EF4444',
};

export type TicketPriority = (typeof TICKET_PRIORITIES)[keyof typeof TICKET_PRIORITIES];

// Ticket Channels
export const TICKET_CHANNELS = {
  WALK_IN: 'walk_in',
  WHATSAPP: 'whatsapp',
  PHONE: 'phone',
  EMAIL: 'email',
  WEBSITE: 'website',
} as const;

export const TICKET_CHANNEL_LABELS: Record<TicketChannel, string> = {
  walk_in: 'Walk-in',
  whatsapp: 'WhatsApp',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
};

export type TicketChannel = (typeof TICKET_CHANNELS)[keyof typeof TICKET_CHANNELS];

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TECHNICIAN: 'technician',
  RECEPTIONIST: 'receptionist',
} as const;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  technician: 'Technician',
  receptionist: 'Receptionist',
};

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Device Types
export const DEVICE_TYPES = {
  SMARTPHONE: 'smartphone',
  TABLET: 'tablet',
  LAPTOP: 'laptop',
  DESKTOP: 'desktop',
  GAME_CONSOLE: 'game_console',
  SMARTWATCH: 'smartwatch',
  OTHER: 'other',
} as const;

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  smartphone: 'Smartphone',
  tablet: 'Tablet',
  laptop: 'Laptop',
  desktop: 'Desktop',
  game_console: 'Game Console',
  smartwatch: 'Smartwatch',
  other: 'Other',
};

export type DeviceType = (typeof DEVICE_TYPES)[keyof typeof DEVICE_TYPES];

// Payment Statuses
export const PAYMENT_STATUSES = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  partial: 'Partial',
  paid: 'Paid',
  refunded: 'Refunded',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  unpaid: '#EF4444',
  partial: '#F59E0B',
  paid: '#10B981',
  refunded: '#6B7280',
};

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  OTHER: 'other',
} as const;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  transfer: 'Bank Transfer',
  other: 'Other',
};

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

// Invoice Line Item Types
export const LINE_ITEM_TYPES = {
  LABOR: 'labor',
  PART: 'part',
  CUSTOM: 'custom',
} as const;

export type LineItemType = (typeof LINE_ITEM_TYPES)[keyof typeof LINE_ITEM_TYPES];

// Inventory Movement Types
export const INVENTORY_MOVEMENT_TYPES = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  ADJUSTMENT: 'adjustment',
  RETURN: 'return',
} as const;

export type InventoryMovementType =
  (typeof INVENTORY_MOVEMENT_TYPES)[keyof typeof INVENTORY_MOVEMENT_TYPES];

// Message Directions
export const MESSAGE_DIRECTIONS = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
} as const;

export type MessageDirection = (typeof MESSAGE_DIRECTIONS)[keyof typeof MESSAGE_DIRECTIONS];

// Message Statuses
export const MESSAGE_STATUSES = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

export type MessageStatus = (typeof MESSAGE_STATUSES)[keyof typeof MESSAGE_STATUSES];

// Notification Types
export const NOTIFICATION_TYPES = {
  TICKET_CREATED: 'ticket_created',
  TICKET_ASSIGNED: 'ticket_assigned',
  TICKET_STATUS_CHANGED: 'ticket_status_changed',
  TICKET_NOTE_ADDED: 'ticket_note_added',
  NEW_MESSAGE: 'new_message',
  PAYMENT_RECEIVED: 'payment_received',
  LOW_STOCK: 'low_stock',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// Common Issue Categories
export const ISSUE_CATEGORIES = [
  'screen_damage',
  'battery_issue',
  'charging_port',
  'water_damage',
  'software_issue',
  'camera_issue',
  'speaker_microphone',
  'button_issue',
  'network_connectivity',
  'storage_issue',
  'overheating',
  'other',
] as const;

export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];

// Common Device Brands
export const DEVICE_BRANDS = [
  'Apple',
  'Samsung',
  'Google',
  'OnePlus',
  'Xiaomi',
  'Huawei',
  'LG',
  'Sony',
  'Motorola',
  'Nokia',
  'ASUS',
  'Dell',
  'HP',
  'Lenovo',
  'Microsoft',
  'Nintendo',
  'PlayStation',
  'Xbox',
  'Other',
] as const;

export type DeviceBrand = (typeof DEVICE_BRANDS)[number];
