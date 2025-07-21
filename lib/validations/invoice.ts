import { z } from 'zod';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  rate: z.number().min(0, 'Rate must be positive'),
  amount: z.number().min(0, 'Amount must be positive'),
});

export const invoiceSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  appointmentId: z.string().optional(),
  patientName: z.string().min(2, 'Patient name is required'),
  patientPhone: z.string().min(10, 'Valid phone number is required'),
  patientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  patientAddress: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  discount: z.number().min(0, 'Discount must be positive').default(0),
  discountType: z.enum(['percentage', 'fixed']).default('fixed'),
  taxRate: z.number().min(0, 'Tax rate must be positive').max(100, 'Tax rate cannot exceed 100%').default(0),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank-transfer', 'online']).optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
  terms: z.string().max(1000, 'Terms too long').optional(),
  invoiceNumber: z.string().optional(),
  subtotal: z.number().min(0, 'Subtotal must be positive').optional(),
  total: z.number().min(0, 'Total must be positive').optional(),
  balance: z.number().min(0, 'Balance must be positive').optional(),
  amountPaid: z.number().min(0, 'Amount paid must be positive').default(0).optional(), // Add amountPaid
});

export const invoiceUpdateSchema = invoiceSchema.partial();

export const paymentSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'bank-transfer', 'online']),
  paymentDate: z.string().min(1, 'Payment date is required'),
  notes: z.string().max(200, 'Notes too long').optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type InvoiceUpdateData = z.infer<typeof invoiceUpdateSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;