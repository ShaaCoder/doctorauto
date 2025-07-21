import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Patient from '@/models/Patient';
import { patientUpdateSchema } from '@/lib/validations/patient';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid patient ID' },
        { status: 400 }
      );
    }
    
    const patient = await Patient.findById(params.id);
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error('GET /api/patients/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient' },
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
        { success: false, error: 'Invalid patient ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = patientUpdateSchema.parse(body);
    
    // Check if phone number is being updated and if it conflicts with another patient
    if (validatedData.phone) {
      const existingPatient = await Patient.findOne({
        phone: validatedData.phone,
        _id: { $ne: params.id },
      });
      
      if (existingPatient) {
        return NextResponse.json(
          { success: false, error: 'Phone number already exists for another patient' },
          { status: 400 }
        );
      }
    }
    
    const patient = await Patient.findByIdAndUpdate(
      params.id,
      validatedData,
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: patient,
      message: 'Patient updated successfully',
    });
  } catch (error) {
    console.error('PUT /api/patients/[id] error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update patient' },
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
        { success: false, error: 'Invalid patient ID' },
        { status: 400 }
      );
    }
    
    const patient = await Patient.findByIdAndDelete(params.id);
    
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/patients/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}