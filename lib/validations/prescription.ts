import { z } from 'zod';

const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().max(200, 'Instructions too long').optional(),
  beforeAfterFood: z.enum(['before', 'after', 'with', 'anytime']).default('after'),
});

export const prescriptionSchema = z.object({
  _id: z.string().optional(), // Added for editing
  patientId: z.string().min(1, 'Patient is required'),
  appointmentId: z.string().optional(),
  patientName: z.string().min(2, 'Patient name is required'),
  patientAge: z.number().min(0, 'Age must be positive').max(150, 'Invalid age'),
  patientPhone: z.string().min(10, 'Valid phone number is required'),
  date: z.string().min(1, 'Date is required'),
  symptoms: z.string().min(1, 'Symptoms are required').max(1000, 'Symptoms too long'),
  diagnosis: z.string().min(1, 'Diagnosis is required').max(1000, 'Diagnosis too long'),
  medicines: z.array(medicineSchema).min(1, 'At least one medicine is required'),
  tests: z.array(z.string()).optional(),
  advice: z.string().max(1000, 'Advice too long').optional(),
  followUpDate: z.string().optional(),
  icdCode: z.string().optional(),
  prescriptionNumber: z.string().optional(), // Added to match IPrescription
  isActive: z.boolean().optional(), // Added to match IPrescription
});

export const prescriptionUpdateSchema = prescriptionSchema.partial();

export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
export type PrescriptionUpdateData = z.infer<typeof prescriptionUpdateSchema>;
export type MedicineFormData = z.infer<typeof medicineSchema>;