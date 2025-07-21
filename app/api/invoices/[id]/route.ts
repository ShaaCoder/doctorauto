import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { invoiceUpdateSchema } from '@/lib/validations/invoice';
import mongoose from 'mongoose';

export async function GET(
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
    
    const invoice = await Invoice.findById(params.id)
      .populate('patientId', 'name phone email address')
      .populate('appointmentId');
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('GET /api/invoices/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const validatedData = invoiceUpdateSchema.parse(body);
    
    // Prepare update data
    const updateData: any = { ...validatedData };
    
    if (validatedData.items) {
      updateData.items = validatedData.items.map(item => ({
        ...item,
        amount: item.quantity * item.rate,
      }));
    }
    
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }
    
    if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate);
    }
    
    const invoice = await Invoice.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'name phone email');
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice updated successfully',
    });
  } catch (error) {
    console.error('PUT /api/invoices/[id] error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    const invoice = await Invoice.findByIdAndUpdate(
      params.id,
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Invoice cancelled successfully',
    });
  } catch (error) {
    console.error('DELETE /api/invoices/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel invoice' },
      { status: 500 }
    );
  }
}