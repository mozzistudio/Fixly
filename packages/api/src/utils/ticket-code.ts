import { prisma } from './prisma';

/**
 * Generates a human-readable ticket code like FX-2025-00142
 */
export async function generateTicketCode(organizationId: string, prefix = 'FX'): Promise<string> {
  const year = new Date().getFullYear();

  // Get the latest ticket number for this organization and year
  const latestTicket = await prisma.ticket.findFirst({
    where: {
      organizationId,
      code: {
        startsWith: `${prefix}-${year}-`,
      },
    },
    orderBy: {
      code: 'desc',
    },
    select: {
      code: true,
    },
  });

  let nextNumber = 1;

  if (latestTicket) {
    // Extract the number from the code (e.g., "FX-2025-00142" -> 142)
    const parts = latestTicket.code.split('-');
    const lastNumber = parseInt(parts[2], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Format: PREFIX-YEAR-NUMBER (5 digits, zero-padded)
  return `${prefix}-${year}-${String(nextNumber).padStart(5, '0')}`;
}

/**
 * Generates an invoice number like INV-2025-00001
 */
export async function generateInvoiceNumber(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'INV';

  const latestInvoice = await prisma.invoice.findFirst({
    where: {
      organizationId,
      invoiceNumber: {
        startsWith: `${prefix}-${year}-`,
      },
    },
    orderBy: {
      invoiceNumber: 'desc',
    },
    select: {
      invoiceNumber: true,
    },
  });

  let nextNumber = 1;

  if (latestInvoice) {
    const parts = latestInvoice.invoiceNumber.split('-');
    const lastNumber = parseInt(parts[2], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}-${year}-${String(nextNumber).padStart(5, '0')}`;
}
