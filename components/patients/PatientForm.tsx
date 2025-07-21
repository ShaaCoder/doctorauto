'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, PatientFormData } from '@/lib/validations/patient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface PatientFormProps {
  initialData?: (Partial<PatientFormData> & { _id?: string });
  onSuccess?: (patient: any) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function PatientForm({ 
  initialData, 
  onSuccess, 
  onCancel, 
  isEditing = false 
}: PatientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      age: 0,
      gender: 'male',
      address: '',
      emergencyContact: '',
      medicalHistory: '',
      allergies: '',
      currentMedications: '',
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    
    try {
      const url = isEditing ? `/api/patients/${initialData?._id}` : '/api/patients';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save patient');
      }

      toast.success(isEditing ? 'Patient updated successfully' : 'Patient created successfully');
      onSuccess?.(result.data);
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save patient');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Patient' : 'Add New Patient'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update patient information' : 'Enter patient details to create a new record'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter patient's full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter phone number"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                placeholder="Enter age"
                className={errors.age ? 'border-red-500' : ''}
              />
              {errors.age && (
                <p className="text-sm text-red-600">{errors.age.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select onValueChange={(value) => setValue('gender', value as 'male' | 'female' | 'other')}>
                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select onValueChange={(value) => setValue('bloodGroup', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                {...register('height', { valueAsNumber: true })}
                placeholder="Enter height in cm"
                className={errors.height ? 'border-red-500' : ''}
              />
              {errors.height && (
                <p className="text-sm text-red-600">{errors.height.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                {...register('weight', { valueAsNumber: true })}
                placeholder="Enter weight in kg"
                className={errors.weight ? 'border-red-500' : ''}
              />
              {errors.weight && (
                <p className="text-sm text-red-600">{errors.weight.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Enter complete address"
                className={errors.address ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact *</Label>
              <Input
                id="emergencyContact"
                {...register('emergencyContact')}
                placeholder="Enter emergency contact number"
                className={errors.emergencyContact ? 'border-red-500' : ''}
              />
              {errors.emergencyContact && (
                <p className="text-sm text-red-600">{errors.emergencyContact.message}</p>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                {...register('medicalHistory')}
                placeholder="Enter patient's medical history"
                className={errors.medicalHistory ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.medicalHistory && (
                <p className="text-sm text-red-600">{errors.medicalHistory.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                {...register('allergies')}
                placeholder="Enter known allergies"
                className={errors.allergies ? 'border-red-500' : ''}
                rows={2}
              />
              {errors.allergies && (
                <p className="text-sm text-red-600">{errors.allergies.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentMedications">Current Medications</Label>
              <Textarea
                id="currentMedications"
                {...register('currentMedications')}
                placeholder="Enter current medications"
                className={errors.currentMedications ? 'border-red-500' : ''}
                rows={2}
              />
              {errors.currentMedications && (
                <p className="text-sm text-red-600">{errors.currentMedications.message}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Patient' : 'Create Patient'}
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}