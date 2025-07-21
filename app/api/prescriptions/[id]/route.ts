import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import { prescriptionUpdateSchema } from '@/lib/validations/prescription';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid prescription ID' },
        { status: 400 }
      );
    }
    
    const prescription = await Prescription.findById(params.id)
      .populate('patientId', 'name phone email age gender address')
      .populate('appointmentId');
    
    if (!prescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error('GET /api/prescriptions/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prescription' },
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
        { success: false, error: 'Invalid prescription ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = prescriptionUpdateSchema.parse(body);
    
    // Prepare update data
    const updateData: any = { ...validatedData };
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }
    if (validatedData.followUpDate) {
      updateData.followUpDate = new Date(validatedData.followUpDate);
    }
    
    const prescription = await Prescription.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'name phone email age gender');
    
    if (!prescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: prescription,
      message: 'Prescription updated successfully',
    });
  } catch (error) {
    console.error('PUT /api/prescriptions/[id] error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update prescription' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Define isPermanent outside the try block to ensure it's accessible in the catch block
  const { searchParams } = new URL(request.url);
  const isPermanent = searchParams.get('permanent') === 'true';
  
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid prescription ID' },
        { status: 400 }
      );
    }
    
    if (isPermanent) {
      // Perform permanent deletion
      const prescription = await Prescription.findByIdAndDelete(params.id);
      
      if (!

prescription) {
        return NextResponse.json(
          { success: false, error: 'Prescription not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Prescription permanently deleted successfully',
      });
    } else {
      // Perform soft deletion (update isActive to false)
      const prescription = await Prescription.findByIdAndUpdate(
        params.id,
        { isActive: false },
        { new: true }
      );
      
      if (!prescription) {
        return NextResponse.json(
          { success: false, error: 'Prescription not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Prescription deactivated successfully',
      });
    }
  } catch (error) {
    console.error('DELETE /api/prescriptions/[id] error:', error);
    return NextResponse.json(
      { success: false, error: `Failed to ${isPermanent ? 'delete' : 'deactivate'} prescription` },
      { status: 500 }
    );
  }
}