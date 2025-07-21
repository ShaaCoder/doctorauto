import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Patient from '@/models/Patient';
import { patientSchema } from '@/lib/validations/patient';
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
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const skip = (page - 1) * limit;
    
    // Build search query
    const searchQuery = search
      ? {
          $and: [
            { userId },
            {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
              ],
            },
          ],
        }
      : { userId };
    
    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const [patients, total] = await Promise.all([
      Patient.find(searchQuery)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('-visits -reports'), // Exclude large arrays for list view
      Patient.countDocuments(searchQuery),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        patients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('GET /api/patients error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients' },
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
    const validatedData = patientSchema.parse(body);
    
    // Check if patient with same phone already exists
    const existingPatient = await Patient.findOne({ phone: validatedData.phone });
    if (existingPatient) {
      return NextResponse.json(
        { success: false, error: 'Patient with this phone number already exists' },
        { status: 400 }
      );
    }
    
    // Create new patient
    const patient = new Patient({ ...validatedData, userId });
    await patient.save();
    
    return NextResponse.json({
      success: true,
      data: patient,
      message: 'Patient created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/patients error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}