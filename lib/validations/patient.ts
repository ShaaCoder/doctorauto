import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
  age: z.number().min(0, 'Age must be positive').max(150, 'Invalid age'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select a gender',
  }),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500, 'Address too long'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  emergencyContact: z.string().min(10, 'Emergency contact must be at least 10 digits').max(15, 'Emergency contact too long'),
  medicalHistory: z.string().max(2000, 'Medical history too long').optional(),
  allergies: z.string().max(500, 'Allergies description too long').optional(),
  currentMedications: z.string().max(1000, 'Current medications too long').optional(),
  height: z.number().min(50, 'Height must be at least 50cm').max(300, 'Height too tall').optional(),
  weight: z.number().min(20, 'Weight must be at least 20kg').max(500, 'Weight too heavy').optional(),
});

export const patientUpdateSchema = patientSchema.partial();

export type PatientFormData = z.infer<typeof patientSchema>;
export type PatientUpdateData = z.infer<typeof patientUpdateSchema>;