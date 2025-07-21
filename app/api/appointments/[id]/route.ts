import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { appointmentUpdateSchema } from '@/lib/validations/appointment';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid appointment ID' },
        { status: 400 }
      );
    }
    
    const appointment = await Appointment.findById(params.id)
      .populate('patientId', 'name phone email age gender address');
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('GET /api/appointments/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointment' },
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
        { success: false, error: 'Invalid appointment ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = appointmentUpdateSchema.parse(body);
    
    // Check for conflicting appointments if date/time is being updated
    if (validatedData.date || validatedData.time) {
      const currentAppointment = await Appointment.findById(params.id);
      if (!currentAppointment) {
        return NextResponse.json(
          { success: false, error: 'Appointment not found' },
          { status: 404 }
        );
      }
      
      const checkDate = validatedData.date ? new Date(validatedData.date) : currentAppointment.date;
      const checkTime = validatedData.time || currentAppointment.time;
      
      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: params.id },
        date: checkDate,
        time: checkTime,
        status: { $nin: ['cancelled', 'no-show'] },
      });
      
      if (conflictingAppointment) {
        return NextResponse.json(
          { success: false, error: 'Time slot already booked' },
          { status: 400 }
        );
      }
    }
    
    // Prepare update data
    const updateData: any = { ...validatedData };
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }
    if (validatedData.followUpDate) {
      updateData.followUpDate = new Date(validatedData.followUpDate);
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'name phone email age gender');
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: appointment,
      message: 'Appointment updated successfully',
    });
  } catch (error) {
    console.error('PUT /api/appointments/[id] error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
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
        { success: false, error: 'Invalid appointment ID' },
        { status: 400 }
      );
    }
    
    const appointment = await Appointment.findByIdAndDelete(params.id);
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/appointments/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}