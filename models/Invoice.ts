import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  _id: string;
  invoiceNumber: string;
  patientId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAddress?: string;
  date: Date;
  dueDate: Date;
  items: IInvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  amountPaid: number;
  balance: number;
  status: 'draft' | 'sent' | 'paid' | 'partially-paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'upi' | 'bank-transfer' | 'online';
  paymentDate?: Date;
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: mongoose.Types.ObjectId;
}

const InvoiceItemSchema: Schema<IInvoiceItem> = new Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
});

const InvoiceSchema: Schema<IInvoice> = new Schema({
  invoiceNumber: {
    type: String,
    required: false, // Make optional since middleware sets it
    unique: true,
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  patientName: {
    type: String,
    required: true,
    trim: true,
  },
  patientPhone: {
    type: String,
    required: true,
    trim: true,
  },
  patientEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  patientAddress: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  items: [InvoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed',
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0,
  },
  balance: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'sent', 'paid', 'partially-paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank-transfer', 'online'],
  },
  paymentDate: Date,
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  terms: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: 'Payment is due within 30 days of invoice date.',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
InvoiceSchema.index({ patientId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ date: -1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ createdAt: -1 });

// Pre-save middleware to generate invoice number and calculate totals
InvoiceSchema.pre('save', async function(next) {
  try {
    // Generate invoice number if not exists
    if (!this.invoiceNumber) {
      const count = await mongoose.model('Invoice').countDocuments();
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      this.invoiceNumber = `INV${year}${month}${(count + 1).toString().padStart(4, '0')}`;
    }

    // Calculate totals
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate discount
    let discountAmount = 0;
    if (this.discountType === 'percentage') {
      discountAmount = (this.subtotal * this.discount) / 100;
    } else {
      discountAmount = this.discount;
    }

    // Calculate tax
    const taxableAmount = this.subtotal - discountAmount;
    this.tax = (taxableAmount * this.taxRate) / 100;

    // Calculate total
    this.total = this.subtotal - discountAmount + this.tax;
    
    // Calculate balance
    this.balance = this.total - this.amountPaid;

    // Update status based on payment
    if (this.balance <= 0) {
      this.status = 'paid';
    } else if (this.amountPaid > 0) {
      this.status = 'partially-paid';
    } else if (this.dueDate < new Date() && this.status !== 'paid') {
      this.status = 'overdue';
    }

    next();
  } catch (error: any) {
    console.error('Error in pre-save middleware:', error);
    next(error);
  }
});

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;