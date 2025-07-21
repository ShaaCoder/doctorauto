// components/appointments/AppointmentForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, AppointmentFormData } from '@/lib/validations/appointment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, X, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  age: number;
}

interface AppointmentFormProps {
  initialData?: Partial<AppointmentFormData>;
  onSuccess?: (appointment: any) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function AppointmentForm({
  initialData,
  onSuccess,
  onCancel,
  isEditing = false,
}: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: initialData || {
      patientId: '',
      patientName: '',
      patientPhone: '',
      date: '',
      time: '',
      duration: 30,
      type: 'consultation',
      status: 'scheduled',
      consultationFee: 500,
      symptoms: '',
      notes: '',
      diagnosis: '',
      treatment: '',
      followUpDate: '',
    },
  });

  // Set initial patient selection if editing
  useEffect(() => {
    if (initialData?.patientId && initialData.patientName && initialData.patientPhone) {
      setSelectedPatient({
        _id: initialData.patientId, // Ensure patientId is a string
        name: initialData.patientName,
        phone: initialData.patientPhone,
        age:  0,
        email: '',
      });
      // Set form values explicitly
      setValue('patientId', initialData.patientId);
      setValue('patientName', initialData.patientName);
      setValue('patientPhone', initialData.patientPhone);
    }
  }, [initialData, setValue]);

  // Fetch patients for selection
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`/api/patients?limit=50&search=${searchTerm}`);
        const result = await response.json();
        console.log('Patients API response:', result);
        if (result.success) {
          setPatients(result.data.patients);
        } else {
          toast.error('Failed to load patients');
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Error loading patients');
      }
    };

    fetchPatients();
  }, [searchTerm]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setValue('patientId', patient._id);
    setValue('patientName', patient.name);
    setValue('patientPhone', patient.phone);
    setSearchTerm('');
  };

  const onSubmit = async (data: AppointmentFormData) => {
    console.log('onSubmit triggered with data:', data);
    setIsLoading(true);
    try {
      const url = isEditing && data._id ? `/api/appointments/${data._id}` : '/api/appointments';
      const method = isEditing && data._id ? 'PUT' : 'POST';
      // Exclude _id for new appointments
      const payload = isEditing ? data : { ...data, _id: undefined };
      console.log('Sending request to:', url, 'Method:', method, 'Payload:', payload);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (!response.ok) {
        throw new Error(result.error || `Failed to save appointment (Status: ${response.status})`);
      }

      toast.success(isEditing ? 'Appointment updated successfully' : 'Appointment created successfully');
      onSuccess?.(result.data);
    } catch (error) {
      console.error('POST /api/appointments error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save appointment');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('Form errors:', errors);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  ];

  console.log('Rendering AppointmentForm, isEditing:', isEditing, 'initialData:', initialData);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Appointment' : 'Book New Appointment'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update appointment details' : 'Schedule a new patient appointment'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <div className="text-red-600">
              Form validation errors: {JSON.stringify(errors, null, 2)}
            </div>
          )}
          {/* Patient Selection */}
          <div className="space-y-4">
            <Label>Patient *</Label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{selectedPatient.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(null);
                    setValue('patientId', '');
                    setValue('patientName', '');
                    setValue('patientPhone', '');
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {searchTerm && patients.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {patients.map((patient) => (
                      <div
                        key={patient._id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.phone} • {patient.age} years</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {errors.patientId && (
              <p className="text-sm text-red-600">{errors.patientId.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                min={new Date().toISOString().split('T')[0]}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Select onValueChange={(value) => setValue('time', value)}>
                <SelectTrigger className={errors.time ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.time && (
                <p className="text-sm text-red-600">{errors.time.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select onValueChange={(value) => setValue('duration', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="30 minutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type *</Label>
              <Select onValueChange={(value) => setValue('type', value as any)}>
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="checkup">Checkup</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
              <Input
                id="consultationFee"
                type="number"
                {...register('consultationFee', { valueAsNumber: true })}
                placeholder="500"
                className={errors.consultationFee ? 'border-red-500' : ''}
              />
              {errors.consultationFee && (
                <p className="text-sm text-red-600">{errors.consultationFee.message}</p>
              )}
            </div>
          </div>

          {/* Status (for editing) */}
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Symptoms, Notes, Diagnosis, Treatment, Follow-up Date */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea
                id="symptoms"
                {...register('symptoms')}
                placeholder="Enter patient symptoms or reason for visit"
                className={errors.symptoms ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.symptoms && (
                <p className="text-sm text-red-600">{errors.symptoms.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes or instructions"
                className={errors.notes ? 'border-red-500' : ''}
                rows={2}
              />
              {errors.notes && (
                <p className="text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                {...register('diagnosis')}
                placeholder="Enter diagnosis (if applicable)"
                className={errors.diagnosis ? 'border-red-500' : ''}
                rows={2}
              />
              {errors.diagnosis && (
                <p className="text-sm text-red-600">{errors.diagnosis.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment</Label>
              <Textarea
                id="treatment"
                {...register('treatment')}
                placeholder="Enter treatment plan (if applicable)"
                className={errors.treatment ? 'border-red-500' : ''}
                rows={2}
              />
              {errors.treatment && (
                <p className="text-sm text-red-600">{errors.treatment.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                {...register('followUpDate')}
                min={new Date().toISOString().split('T')[0]}
                className={errors.followUpDate ? 'border-red-500' : ''}
              />
              {errors.followUpDate && (
                <p className="text-sm text-red-600">{errors.followUpDate.message}</p>
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
                  {isEditing ? 'Update Appointment' : 'Book Appointment'}
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