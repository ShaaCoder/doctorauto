import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppointment extends Document {
  _id: string;
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  patientPhone: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  type: 'consultation' | 'follow-up' | 'emergency' | 'checkup' | 'procedure';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  symptoms?: string;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
  followUpDate?: Date;
  reminderSent: boolean;
  consultationFee: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema<IAppointment> = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
    trim: true,
  },
  patientPhone: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 30,
    min: 15,
    max: 180,
  },
  type: {
    type: String,
    required: true,
    enum: ['consultation', 'follow-up', 'emergency', 'checkup', 'procedure'],
    default: 'consultation',
  },
  status: {
    type: String,
    required: true,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  symptoms: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  diagnosis: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  treatment: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  followUpDate: Date,
  reminderSent: {
    type: Boolean,
    default: false,
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0,
    default: 500,
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
AppointmentSchema.index({ patientId: 1 });
AppointmentSchema.index({ date: 1, time: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ createdAt: -1 });

// Compound index for date range queries
AppointmentSchema.index({ date: 1, status: 1 });

const Appointment: Model<IAppointment> = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;