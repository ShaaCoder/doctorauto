// appointment.ts
import { z } from 'zod';

export const appointmentSchema = z.object({
  _id: z.string().min(1, 'ID is required').optional(), // Still optional for new appointments
  patientId: z.string().min(1, 'Patient is required'),
  patientName: z.string().min(2, 'Patient name is required'),
  patientPhone: z.string().min(10, 'Valid phone number is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(180, 'Duration cannot exceed 3 hours').default(30),
  type: z.enum(['consultation', 'follow-up', 'emergency', 'checkup', 'procedure']).default('consultation'),
  status: z.enum(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).default('scheduled'),
  symptoms: z.string().max(1000, 'Symptoms too long').optional(),
  notes: z.string().max(2000, 'Notes too long').optional(),
  diagnosis: z.string().max(1000, 'Diagnosis too long').optional(),
  treatment: z.string().max(1000, 'Treatment too long').optional(),
  followUpDate: z.string().optional(),
  consultationFee: z.number().min(0, 'Fee must be positive').default(500),
});

export const appointmentUpdateSchema = appointmentSchema.partial();

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type AppointmentUpdateData = z.infer<typeof appointmentUpdateSchema>;