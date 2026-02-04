import { PrismaClient, UserRole, DeviceType, TicketStatus, TicketPriority, TicketChannel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.aIInteraction.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.ticketNote.deleteMany();
  await prisma.ticketStatusLog.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.device.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.whatsAppConfig.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log('📝 Creating organization...');

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: 'TechFix Pro',
      slug: 'techfix-pro',
      address: '123 Repair Street, Tech City, TC 12345',
      phone: '+1 (555) 123-4567',
      email: 'hello@techfixpro.com',
      website: 'https://techfixpro.com',
      timezone: 'America/New_York',
      currency: 'USD',
      language: 'en',
      businessHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '15:00' },
        sunday: { closed: true },
      },
      settings: {
        ticketPrefix: 'FX',
        defaultPriority: 'medium',
        autoAssign: false,
        requireApprovalForRepairs: true,
        sendStatusNotifications: true,
        taxRate: 8.5,
        aiEnabled: true,
        aiSpendingLimit: 100,
      },
      subscriptionPlan: 'professional',
      subscriptionStatus: 'active',
    },
  });

  console.log('👥 Creating users...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create users
  const admin = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: 'admin@techfixpro.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Smith',
      role: UserRole.ADMIN,
      phone: '+1 (555) 111-1111',
      isActive: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: 'manager@techfixpro.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.MANAGER,
      phone: '+1 (555) 222-2222',
      isActive: true,
    },
  });

  const technician = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: 'tech@techfixpro.com',
      passwordHash,
      firstName: 'Mike',
      lastName: 'Davis',
      role: UserRole.TECHNICIAN,
      phone: '+1 (555) 333-3333',
      isActive: true,
    },
  });

  console.log('👤 Creating customers...');

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        firstName: 'Alice',
        lastName: 'Williams',
        email: 'alice.williams@email.com',
        phone: '+1 (555) 100-0001',
        whatsappPhone: '+1 (555) 100-0001',
        address: '456 Oak Street',
        city: 'Tech City',
        state: 'TC',
        postalCode: '12345',
        country: 'USA',
        tags: ['vip', 'frequent'],
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        firstName: 'Bob',
        lastName: 'Brown',
        email: 'bob.brown@email.com',
        phone: '+1 (555) 100-0002',
        whatsappPhone: '+1 (555) 100-0002',
        address: '789 Pine Avenue',
        city: 'Tech City',
        state: 'TC',
        postalCode: '12346',
        country: 'USA',
        tags: ['business'],
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        firstName: 'Carol',
        lastName: 'Davis',
        email: 'carol.davis@email.com',
        phone: '+1 (555) 100-0003',
        address: '321 Maple Lane',
        city: 'Tech City',
        state: 'TC',
        postalCode: '12347',
        country: 'USA',
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        firstName: 'David',
        lastName: 'Miller',
        email: 'david.miller@email.com',
        phone: '+1 (555) 100-0004',
        whatsappPhone: '+1 (555) 100-0004',
        city: 'Tech City',
        state: 'TC',
        tags: ['student'],
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        firstName: 'Emma',
        lastName: 'Wilson',
        phone: '+1 (555) 100-0005',
        city: 'Tech City',
        state: 'TC',
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        firstName: 'Frank',
        lastName: 'Taylor',
        email: 'frank.t@email.com',
        phone: '+1 (555) 100-0006',
        tags: ['vip'],
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        firstName: 'Grace',
        lastName: 'Anderson',
        phone: '+1 (555) 100-0007',
        whatsappPhone: '+1 (555) 100-0007',
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        firstName: 'Henry',
        lastName: 'Thomas',
        email: 'henry.thomas@email.com',
        phone: '+1 (555) 100-0008',
        tags: ['business'],
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        firstName: 'Ivy',
        lastName: 'Jackson',
        phone: '+1 (555) 100-0009',
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: organization.id,
        firstName: 'Jack',
        lastName: 'White',
        email: 'jack.w@email.com',
        phone: '+1 (555) 100-0010',
        whatsappPhone: '+1 (555) 100-0010',
        tags: ['frequent'],
      },
    }),
  ]);

  console.log('📱 Creating devices...');

  // Create devices
  const devices = await Promise.all([
    prisma.device.create({
      data: {
        organizationId: organization.id,
        customerId: customers[0].id,
        type: DeviceType.SMARTPHONE,
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        color: 'Space Black',
        serialNumber: 'FVFWQ123456',
        imei: '353456789012345',
        conditionNotes: 'Small scratch on back glass',
      },
    }),
    prisma.device.create({
      data: {
        organizationId: organization.id,
        customerId: customers[0].id,
        type: DeviceType.LAPTOP,
        brand: 'Apple',
        model: 'MacBook Pro 14"',
        color: 'Silver',
        serialNumber: 'C02Y123456',
        conditionNotes: 'Minor wear on keyboard',
      },
    }),
    prisma.device.create({
      data: {
        organizationId: organization.id,
        customerId: customers[1].id,
        type: DeviceType.SMARTPHONE,
        brand: 'Samsung',
        model: 'Galaxy S24 Ultra',
        color: 'Titanium Gray',
        imei: '359876543210987',
      },
    }),
    prisma.device.create({
      data: {
        organizationId: organization.id,
        customerId: customers[2].id,
        type: DeviceType.TABLET,
        brand: 'Apple',
        model: 'iPad Pro 12.9"',
        serialNumber: 'DLXK987654',
      },
    }),
    prisma.device.create({
      data: {
        organizationId: organization.id,
        customerId: customers[3].id,
        type: DeviceType.SMARTPHONE,
        brand: 'Google',
        model: 'Pixel 8 Pro',
        color: 'Bay',
        imei: '358765432109876',
      },
    }),
  ]);

  console.log('🎫 Creating tickets...');

  // Helper to generate ticket code
  const generateTicketCode = (index: number): string => {
    const year = new Date().getFullYear();
    return `FX-${year}-${String(index).padStart(5, '0')}`;
  };

  // Create tickets with various statuses
  const ticketData = [
    {
      status: TicketStatus.NEW,
      priority: TicketPriority.HIGH,
      issue: 'Screen cracked after dropping the phone. Touch not working in some areas.',
      customer: 0,
      device: 0,
      channel: TicketChannel.WALK_IN,
    },
    {
      status: TicketStatus.CHECKED_IN,
      priority: TicketPriority.MEDIUM,
      issue: 'Battery draining very quickly, only lasts 2-3 hours.',
      customer: 0,
      device: 1,
      channel: TicketChannel.WHATSAPP,
    },
    {
      status: TicketStatus.DIAGNOSING,
      priority: TicketPriority.MEDIUM,
      issue: 'Phone not charging, tried multiple cables.',
      customer: 1,
      device: 2,
      channel: TicketChannel.PHONE,
    },
    {
      status: TicketStatus.WAITING_APPROVAL,
      priority: TicketPriority.LOW,
      issue: 'Want to replace the battery, device is 2 years old.',
      customer: 2,
      device: 3,
      channel: TicketChannel.WEBSITE,
      estimatedCost: 89.99,
    },
    {
      status: TicketStatus.WAITING_PARTS,
      priority: TicketPriority.HIGH,
      issue: 'Back glass cracked, camera lens also damaged.',
      customer: 3,
      device: 4,
      channel: TicketChannel.WALK_IN,
      estimatedCost: 249.99,
      approvedCost: 249.99,
    },
    {
      status: TicketStatus.IN_REPAIR,
      priority: TicketPriority.URGENT,
      issue: 'Phone fell in water, not turning on.',
      customer: 0,
      device: 0,
      channel: TicketChannel.WALK_IN,
      assignedTo: technician.id,
      estimatedCost: 199.99,
      approvedCost: 199.99,
      tags: ['water-damage', 'urgent'],
    },
    {
      status: TicketStatus.QUALITY_CHECK,
      priority: TicketPriority.MEDIUM,
      issue: 'Speaker and microphone not working during calls.',
      customer: 1,
      device: 2,
      channel: TicketChannel.WHATSAPP,
      assignedTo: technician.id,
      estimatedCost: 75.00,
      approvedCost: 75.00,
    },
    {
      status: TicketStatus.REPAIRED,
      priority: TicketPriority.LOW,
      issue: 'Software issues, phone running slow.',
      customer: 2,
      device: 3,
      channel: TicketChannel.WALK_IN,
      assignedTo: technician.id,
      estimatedCost: 49.99,
      approvedCost: 49.99,
      actualCost: 49.99,
    },
    {
      status: TicketStatus.READY_PICKUP,
      priority: TicketPriority.MEDIUM,
      issue: 'Home button not responding.',
      customer: 3,
      device: 4,
      channel: TicketChannel.PHONE,
      assignedTo: technician.id,
      estimatedCost: 65.00,
      approvedCost: 65.00,
      actualCost: 65.00,
    },
    {
      status: TicketStatus.PICKED_UP,
      priority: TicketPriority.HIGH,
      issue: 'Screen replacement requested after crack.',
      customer: 0,
      device: 0,
      channel: TicketChannel.WALK_IN,
      assignedTo: technician.id,
      estimatedCost: 299.99,
      approvedCost: 299.99,
      actualCost: 299.99,
    },
    {
      status: TicketStatus.CLOSED,
      priority: TicketPriority.LOW,
      issue: 'Data transfer to new device.',
      customer: 1,
      device: 2,
      channel: TicketChannel.WALK_IN,
      assignedTo: manager.id,
      estimatedCost: 39.99,
      approvedCost: 39.99,
      actualCost: 39.99,
    },
    {
      status: TicketStatus.CANCELLED,
      priority: TicketPriority.LOW,
      issue: 'Customer decided to buy new phone instead.',
      customer: 2,
      device: 3,
      channel: TicketChannel.WEBSITE,
    },
    {
      status: TicketStatus.NEW,
      priority: TicketPriority.URGENT,
      issue: 'Phone completely dead, critical business data inside.',
      customer: 1,
      device: 2,
      channel: TicketChannel.WALK_IN,
      tags: ['urgent', 'data-recovery'],
    },
    {
      status: TicketStatus.DIAGNOSING,
      priority: TicketPriority.MEDIUM,
      issue: 'Touch screen ghost touching issue.',
      customer: 0,
      device: 0,
      channel: TicketChannel.WHATSAPP,
      assignedTo: technician.id,
    },
    {
      status: TicketStatus.IN_REPAIR,
      priority: TicketPriority.HIGH,
      issue: 'Laptop keyboard not working, spilled coffee.',
      customer: 0,
      device: 1,
      channel: TicketChannel.WALK_IN,
      assignedTo: technician.id,
      estimatedCost: 189.99,
      approvedCost: 189.99,
      tags: ['liquid-damage'],
    },
  ];

  const tickets = await Promise.all(
    ticketData.map((data, index) =>
      prisma.ticket.create({
        data: {
          organizationId: organization.id,
          code: generateTicketCode(index + 1),
          customerId: customers[data.customer].id,
          deviceId: devices[data.device].id,
          assignedToId: data.assignedTo,
          priority: data.priority,
          status: data.status,
          channel: data.channel,
          issueDescription: data.issue,
          estimatedCost: data.estimatedCost,
          approvedCost: data.approvedCost,
          actualCost: data.actualCost,
          tags: data.tags || [],
          attachments: [],
          completedAt: data.status === TicketStatus.CLOSED || data.status === TicketStatus.PICKED_UP
            ? new Date()
            : undefined,
        },
      })
    )
  );

  console.log('📝 Creating ticket notes...');

  // Add notes to some tickets
  await Promise.all([
    prisma.ticketNote.create({
      data: {
        ticketId: tickets[5].id,
        userId: technician.id,
        content: 'Opened device, significant water damage on logic board. Placed in rice chamber for 24 hours.',
        isAiGenerated: false,
      },
    }),
    prisma.ticketNote.create({
      data: {
        ticketId: tickets[5].id,
        userId: technician.id,
        content: 'AI Diagnosis: Likely corrosion on charging IC and audio IC. Recommend ultrasonic cleaning and component replacement.',
        isAiGenerated: true,
      },
    }),
    prisma.ticketNote.create({
      data: {
        ticketId: tickets[6].id,
        userId: technician.id,
        content: 'Replaced speaker module. Testing microphone - working properly now.',
        isAiGenerated: false,
      },
    }),
    prisma.ticketNote.create({
      data: {
        ticketId: tickets[14].id,
        userId: technician.id,
        content: 'Removed keyboard, cleaning in progress. Will need new keyboard membrane.',
        isAiGenerated: false,
      },
    }),
  ]);

  console.log('📦 Creating inventory items...');

  // Create inventory items
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        organizationId: organization.id,
        sku: 'SCR-IPH15P-BLK',
        name: 'iPhone 15 Pro Screen Assembly',
        description: 'OEM quality OLED screen assembly for iPhone 15 Pro',
        category: 'Screens',
        brand: 'Apple',
        cost: 89.99,
        price: 199.99,
        quantity: 5,
        reorderLevel: 3,
        location: 'Shelf A1',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        organizationId: organization.id,
        sku: 'BAT-IPH15P',
        name: 'iPhone 15 Pro Battery',
        description: 'High capacity replacement battery',
        category: 'Batteries',
        brand: 'Apple',
        cost: 29.99,
        price: 69.99,
        quantity: 12,
        reorderLevel: 5,
        location: 'Shelf B2',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        organizationId: organization.id,
        sku: 'SCR-S24U',
        name: 'Samsung S24 Ultra Screen',
        description: 'AMOLED display assembly for Galaxy S24 Ultra',
        category: 'Screens',
        brand: 'Samsung',
        cost: 119.99,
        price: 279.99,
        quantity: 3,
        reorderLevel: 2,
        location: 'Shelf A2',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        organizationId: organization.id,
        sku: 'CHG-USB-C',
        name: 'USB-C Charging Port',
        description: 'Universal USB-C charging port replacement',
        category: 'Ports',
        brand: 'Generic',
        cost: 4.99,
        price: 24.99,
        quantity: 25,
        reorderLevel: 10,
        location: 'Drawer C1',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        organizationId: organization.id,
        sku: 'TOOL-KIT-PRO',
        name: 'Professional Repair Tool Kit',
        description: '45-piece precision tool kit for mobile repairs',
        category: 'Tools',
        brand: 'iFixit',
        cost: 39.99,
        price: 79.99,
        quantity: 8,
        reorderLevel: 2,
        location: 'Cabinet D1',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        organizationId: organization.id,
        sku: 'ADH-TAPE-3M',
        name: 'Screen Adhesive Strips',
        description: '3M adhesive strips for screen reattachment - pack of 10',
        category: 'Consumables',
        brand: '3M',
        cost: 2.99,
        price: 9.99,
        quantity: 50,
        reorderLevel: 20,
        location: 'Drawer C2',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        organizationId: organization.id,
        sku: 'BAT-MBP14',
        name: 'MacBook Pro 14" Battery',
        description: 'Replacement battery for MacBook Pro 14-inch (2021-2023)',
        category: 'Batteries',
        brand: 'Apple',
        cost: 89.99,
        price: 179.99,
        quantity: 2,
        reorderLevel: 2,
        location: 'Shelf B1',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        organizationId: organization.id,
        sku: 'KEY-MBP14',
        name: 'MacBook Pro 14" Keyboard',
        description: 'Full keyboard assembly with backlight',
        category: 'Keyboards',
        brand: 'Apple',
        cost: 129.99,
        price: 249.99,
        quantity: 1,
        reorderLevel: 1,
        location: 'Shelf A3',
      },
    }),
  ]);

  console.log('🧾 Creating invoices...');

  // Create invoices for completed tickets
  const invoice1 = await prisma.invoice.create({
    data: {
      organizationId: organization.id,
      ticketId: tickets[9].id, // PICKED_UP ticket
      customerId: customers[0].id,
      invoiceNumber: 'INV-2025-00001',
      subtotal: 299.99,
      taxRate: 8.5,
      taxAmount: 25.50,
      discount: 0,
      discountType: 'FIXED',
      total: 325.49,
      paidAmount: 325.49,
      paymentStatus: 'PAID',
      issuedAt: new Date(),
    },
  });

  await prisma.invoiceLineItem.create({
    data: {
      invoiceId: invoice1.id,
      type: 'PART',
      description: 'iPhone 15 Pro Screen Assembly',
      quantity: 1,
      unitPrice: 199.99,
      total: 199.99,
      inventoryItemId: inventoryItems[0].id,
    },
  });

  await prisma.invoiceLineItem.create({
    data: {
      invoiceId: invoice1.id,
      type: 'LABOR',
      description: 'Screen replacement labor',
      quantity: 1,
      unitPrice: 100.00,
      total: 100.00,
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      amount: 325.49,
      method: 'CARD',
      reference: 'TXN-12345',
      receivedById: admin.id,
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      organizationId: organization.id,
      ticketId: tickets[10].id, // CLOSED ticket
      customerId: customers[1].id,
      invoiceNumber: 'INV-2025-00002',
      subtotal: 39.99,
      taxRate: 8.5,
      taxAmount: 3.40,
      discount: 0,
      discountType: 'FIXED',
      total: 43.39,
      paidAmount: 43.39,
      paymentStatus: 'PAID',
      issuedAt: new Date(),
    },
  });

  await prisma.invoiceLineItem.create({
    data: {
      invoiceId: invoice2.id,
      type: 'LABOR',
      description: 'Data transfer service',
      quantity: 1,
      unitPrice: 39.99,
      total: 39.99,
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice2.id,
      amount: 43.39,
      method: 'CASH',
      receivedById: manager.id,
    },
  });

  console.log('🔔 Creating notifications...');

  await Promise.all([
    prisma.notification.create({
      data: {
        organizationId: organization.id,
        userId: admin.id,
        type: 'TICKET_CREATED',
        title: 'New ticket created',
        body: `Ticket ${tickets[0].code} has been created for Alice Williams`,
        link: `/tickets/${tickets[0].id}`,
      },
    }),
    prisma.notification.create({
      data: {
        organizationId: organization.id,
        userId: technician.id,
        type: 'TICKET_ASSIGNED',
        title: 'Ticket assigned to you',
        body: `Ticket ${tickets[5].code} has been assigned to you`,
        link: `/tickets/${tickets[5].id}`,
      },
    }),
    prisma.notification.create({
      data: {
        organizationId: organization.id,
        userId: admin.id,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment received',
        body: `Payment of $325.49 received for invoice INV-2025-00001`,
        link: `/invoices/${invoice1.id}`,
        isRead: true,
        readAt: new Date(),
      },
    }),
    prisma.notification.create({
      data: {
        organizationId: organization.id,
        userId: manager.id,
        type: 'LOW_STOCK',
        title: 'Low stock alert',
        body: 'MacBook Pro 14" Keyboard is running low (1 remaining)',
        link: `/inventory/${inventoryItems[7].id}`,
      },
    }),
  ]);

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📧 Test accounts:');
  console.log('   Admin:      admin@techfixpro.com / password123');
  console.log('   Manager:    manager@techfixpro.com / password123');
  console.log('   Technician: tech@techfixpro.com / password123');
  console.log('');
  console.log(`📊 Created:`);
  console.log(`   - 1 organization`);
  console.log(`   - 3 users`);
  console.log(`   - ${customers.length} customers`);
  console.log(`   - ${devices.length} devices`);
  console.log(`   - ${tickets.length} tickets`);
  console.log(`   - ${inventoryItems.length} inventory items`);
  console.log(`   - 2 invoices with payments`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
