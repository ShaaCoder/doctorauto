import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  beforeAfterFood: 'before' | 'after' | 'with' | 'anytime';
}

export interface IPrescription extends Document {
  _id: string;
  patientId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  date: Date;
  symptoms: string;
  diagnosis: string;
  medicines: IMedicine[];
  tests?: string[];
  advice?: string;
  followUpDate?: Date;
  icdCode?: string;
  prescriptionNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: mongoose.Types.ObjectId;
}

const MedicineSchema: Schema<IMedicine> = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
  },
  frequency: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: String,
    required: true,
    trim: true,
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  beforeAfterFood: {
    type: String,
    enum: ['before', 'after', 'with', 'anytime'],
    default: 'after',
  },
});

const PrescriptionSchema: Schema<IPrescription> = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  patientName: {
    type: String,
    required: true,
    trim: true,
  },
  patientAge: {
    type: Number,
    required: true,
    min: 0,
    max: 150,
  },
  patientPhone: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  symptoms: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  medicines: [MedicineSchema],
  tests: [{
    type: String,
    trim: true,
  }],
  advice: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  followUpDate: Date,
  icdCode: {
    type: String,
    trim: true,
  },
  prescriptionNumber: {
    type: String,
    required: false,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
PrescriptionSchema.index({ patientId: 1 });
PrescriptionSchema.index({ date: -1 });
PrescriptionSchema.index({ createdAt: -1 });

// Pre-save middleware to generate prescription number
PrescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionNumber) {
    const count = await mongoose.model('Prescription').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.prescriptionNumber = `RX${year}${month}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

const Prescription: Model<IPrescription> = mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);

export default Prescription;