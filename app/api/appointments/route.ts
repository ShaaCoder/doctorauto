import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Patient from '@/models/Patient';
import { appointmentSchema } from '@/lib/validations/appointment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const patientId = searchParams.get('patientId');
    const view = searchParams.get('view') || 'list'; // list, calendar, today
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = { userId };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    if (status) {
      query.status = status;
    }
    
    if (patientId) {
      query.patientId = patientId;
    }
    
    // For today view
    if (view === 'today') {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    
    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('patientId', 'name phone email age gender')
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(query),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('GET /api/appointments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = appointmentSchema.parse(body);
    
    // Check if patient exists
    const patient = await Patient.findById(validatedData.patientId);
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Check for conflicting appointments
    const appointmentDate = new Date(validatedData.date);
    const conflictingAppointment = await Appointment.findOne({
      date: appointmentDate,
      time: validatedData.time,
      status: { $nin: ['cancelled', 'no-show'] },
    });
    
    if (conflictingAppointment) {
      return NextResponse.json(
        { success: false, error: 'Time slot already booked' },
        { status: 400 }
      );
    }
    
    // Create appointment
    const appointmentData = {
      ...validatedData,
      date: appointmentDate,
      followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : undefined,
      userId,
    };
    
    const appointment = new Appointment(appointmentData);
    await appointment.save();
    
    // Populate patient data for response
    await appointment.populate('patientId', 'name phone email age gender');
    
    return NextResponse.json({
      success: true,
      data: appointment,
      message: 'Appointment created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/appointments error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}