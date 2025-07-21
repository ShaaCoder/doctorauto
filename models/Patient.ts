import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPatient extends Document {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  address: string;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  emergencyContact: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  height?: number;
  weight?: number;
  reports: Array<{
    filename: string;
    url: string;
    uploadedAt: Date;
    type: 'pdf' | 'image' | 'document';
  }>;
  visits: Array<{
    date: Date;
    symptoms: string;
    diagnosis: string;
    treatment: string;
    notes?: string;
    followUpDate?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  lastVisit?: Date;
  userId: mongoose.Types.ObjectId;
}

const PatientSchema: Schema<IPatient> = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 150,
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  emergencyContact: {
    type: String,
    required: true,
    trim: true,
  },
  medicalHistory: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  allergies: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  currentMedications: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  height: {
    type: Number,
    min: 50,
    max: 300,
  },
  weight: {
    type: Number,
    min: 20,
    max: 500,
  },
  reports: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['pdf', 'image', 'document'],
    },
  }],
  visits: [{
    date: {
      type: Date,
      default: Date.now,
    },
    symptoms: String,
    diagnosis: String,
    treatment: String,
    notes: String,
    followUpDate: Date,
  }],
  lastVisit: Date,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance (only for fields not already indexed)
PatientSchema.index({ name: 1 }); // Keep index for name
PatientSchema.index({ createdAt: -1 }); // Keep index for createdAt

// Pre-save middleware to update lastVisit
PatientSchema.pre('save', function(next) {
  if (this.visits && this.visits.length > 0) {
    this.lastVisit = this.visits[this.visits.length - 1].date;
  }
  next();
});

const Patient: Model<IPatient> = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

export default Patient;