import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { paymentSchema } from '@/lib/validations/invoice';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid invoice ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = paymentSchema.parse(body);
    
    const invoice = await Invoice.findById(params.id);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Update payment information
    const newAmountPaid = invoice.amountPaid + validatedData.amount;
    
    if (newAmountPaid > invoice.total) {
      return NextResponse.json(
        { success: false, error: 'Payment amount exceeds invoice total' },
        { status: 400 }
      );
    }
    
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      params.id,
      {
        amountPaid: newAmountPaid,
        paymentMethod: validatedData.paymentMethod,
        paymentDate: new Date(validatedData.paymentDate),
        // The pre-save middleware will automatically update balance and status
      },
      { new: true, runValidators: true }
    ).populate('patientId', 'name phone email');
    
    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: 'Payment recorded successfully',
    });
  } catch (error) {
    console.error('POST /api/invoices/[id]/payment error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}