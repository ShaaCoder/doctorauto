import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Invoice from '@/models/Invoice';
import connectDB from '@/lib/mongodb';
import { paymentSchema } from '@/lib/validations/invoice';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const id = req.nextUrl.pathname.split('/')[3]; // Get invoice ID from URL
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