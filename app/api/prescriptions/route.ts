import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import Patient from '@/models/Patient';
import { prescriptionSchema } from '@/lib/validations/prescription';
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
    const search = searchParams.get('search') || '';
    const patientId = searchParams.get('patientId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const skip = (page - 1) * limit;
    
    // Build search query
    const searchQuery: any = {};
    
    if (search) {
      searchQuery.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { prescriptionNumber: { $regex: search, $options: 'i' } },
        { diagnosis: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (patientId) {
      searchQuery.patientId = patientId;
    }
    
    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const query: any = { userId };
    const [prescriptions, total] = await Promise.all([
      Prescription.find(query)
        .populate('patientId', 'name phone email age gender')
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Prescription.countDocuments(searchQuery),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('GET /api/prescriptions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prescriptions' },
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
    const validatedData = prescriptionSchema.parse(body);
    
    // Check if patient exists
    const patient = await Patient.findById(validatedData.patientId);
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Create prescription
    const prescriptionData = {
      ...validatedData,
      date: new Date(validatedData.date),
      followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : undefined,
      userId,
    };
    
    const prescription = new Prescription(prescriptionData);
    await prescription.save();
    
    // Populate patient data for response
    await prescription.populate('patientId', 'name phone email age gender');
    
    return NextResponse.json({
      success: true,
      data: prescription,
      message: 'Prescription created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/prescriptions error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}