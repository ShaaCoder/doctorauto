import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Invoice from '@/models/Invoice';
import '@/models/Patient';
import  connectDB  from '@/lib/mongodb';
import { invoiceSchema, invoiceUpdateSchema, paymentSchema  } from '@/lib/validations/invoice';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const query: any = { userId };
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const invoices = await Invoice.find(query)
      .populate('patientId', 'name phone email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Invoice.countDocuments(query);

    const formattedInvoices = invoices.map((invoice) => ({
      _id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      patientName: invoice.patientName,
      patientId: invoice.patientId.toString(),
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      total: invoice.total,
      amountPaid: invoice.amountPaid,
      balance: invoice.balance,
      status: invoice.status,
      items: invoice.items,
      taxRate: invoice.taxRate,
      discount: invoice.discount,
      discountType: invoice.discountType,
      notes: invoice.notes,
      terms: invoice.terms,
      patientPhone: invoice.patientPhone,
      patientEmail: invoice.patientEmail,
      patientAddress: invoice.patientAddress,
      appointmentId: invoice.appointmentId?.toString(),
      subtotal: invoice.subtotal,
    }));

    return NextResponse.json({
      success: true,
      data: {
        invoices: formattedInvoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await req.json();

    // Validate request body
    const parsed = invoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const discountAmount =
      data.discountType === 'percentage' ? (subtotal * data.discount) / 100 : data.discount;
    const taxableAmount = subtotal - discountAmount;
    const tax = (taxableAmount * data.taxRate) / 100;
    const total = subtotal - discountAmount + tax;
    const balance = total - (data.amountPaid || 0);

    // Prepare invoice data, exclude invoiceNumber to let middleware generate it
    const invoiceData = {
      patientId: new mongoose.Types.ObjectId(data.patientId),
      appointmentId: data.appointmentId ? new mongoose.Types.ObjectId(data.appointmentId) : undefined,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail,
      patientAddress: data.patientAddress,
      date: new Date(data.date),
      dueDate: new Date(data.dueDate),
      items: data.items,
      subtotal,
      tax,
      taxRate: data.taxRate,
      discount: data.discount,
      discountType: data.discountType,
      total,
      amountPaid: data.amountPaid || 0,
      balance,
      status: data.amountPaid && data.amountPaid >= total ? 'paid' : 'draft',
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      terms: data.terms,
      userId,
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    return NextResponse.json(
      { success: true, data: invoice },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/invoices error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = invoiceUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Calculate totals
    const subtotal = data.items?.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 0;
    const discountAmount =
      data.discountType === 'percentage' ? (subtotal * (data.discount || 0)) / 100 : (data.discount || 0);
    const taxableAmount = subtotal - discountAmount;
    const tax = (taxableAmount * (data.taxRate || 0)) / 100;
    const total = subtotal - discountAmount + tax;
    const balance = total - (data.amountPaid || 0);

    // Validate patientId and appointmentId
    if (data.patientId && !mongoose.Types.ObjectId.isValid(data.patientId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patientId' },
        { status: 400 }
      );
    }

    if (data.appointmentId && !mongoose.Types.ObjectId.isValid(data.appointmentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid appointmentId' },
        { status: 400 }
      );
    }

    // Prepare invoice data
    const invoiceData = {
      patientId: data.patientId ? new mongoose.Types.ObjectId(data.patientId) : undefined,
      appointmentId: data.appointmentId ? new mongoose.Types.ObjectId(data.appointmentId) : undefined,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail,
      patientAddress: data.patientAddress,
      date: data.date ? new Date(data.date) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      items: data.items,
      subtotal,
      tax,
      taxRate: data.taxRate,
      discount: data.discount,
      discountType: data.discountType,
      total,
      amountPaid: data.amountPaid || 0,
      balance,
      status: data.amountPaid && data.amountPaid >= total ? 'paid' : undefined,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      terms: data.terms,
    };

    // Remove undefined fields to avoid overwriting with undefined
    (Object.keys(invoiceData) as (keyof typeof invoiceData)[]).forEach((key) => {
      if (invoiceData[key] === undefined) {
        delete invoiceData[key];
      }
    });

    const invoice = await Invoice.findByIdAndUpdate(id, invoiceData, {
      new: true,
      runValidators: true,
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findByIdAndDelete(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}

export async function POST_PAYMENT(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { amount, paymentMethod, paymentDate, notes } = parsed.data;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    invoice.amountPaid += amount;
    invoice.balance = invoice.total - invoice.amountPaid;
    invoice.paymentMethod = paymentMethod;
    invoice.paymentDate = new Date(paymentDate);
    if (notes) invoice.notes = notes;

    if (invoice.balance <= 0) {
      invoice.status = 'paid';
    } else {
      invoice.status = 'partially-paid';
    }

    await invoice.save();

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}