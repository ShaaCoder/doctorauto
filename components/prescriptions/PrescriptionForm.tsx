'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { prescriptionSchema, PrescriptionFormData } from '@/lib/validations/prescription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X, Plus, Trash2, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  _id: string;
  name: string;
  phone: string;
  age: number;
}

interface PrescriptionFormProps {
  initialData?: Partial<PrescriptionFormData>;
  onSuccess?: (prescription: any) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function PrescriptionForm({ 
  initialData, 
  onSuccess, 
  onCancel, 
  isEditing = false 
}: PrescriptionFormProps) {
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
    control,
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: initialData || {
      patientId: '',
      patientName: '',
      patientAge: 0,
      patientPhone: '',
      date: new Date().toISOString().split('T')[0],
      symptoms: '',
      diagnosis: '',
      medicines: [
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
          beforeAfterFood: 'after',
        }
      ],
      tests: [],
      advice: '',
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicines',
  });

  // Fetch patients for selection
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`/api/patients?limit=50&search=${searchTerm}`);
        const result = await response.json();
        if (result.success) {
          setPatients(result.data.patients);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, [searchTerm]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setValue('patientId', patient._id);
    setValue('patientName', patient.name);
    setValue('patientPhone', patient.phone);
    setValue('patientAge', patient.age);
    setSearchTerm('');
  };

  const addMedicine = () => {
    append({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      beforeAfterFood: 'after',
    });
  };

  const onSubmit = async (data: PrescriptionFormData) => {
    setIsLoading(true);
    
    try {
      const url = isEditing && data._id ? `/api/prescriptions/${data._id}` : '/api/prescriptions';
      const method = isEditing && data._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save prescription');
      }

      toast.success(isEditing ? 'Prescription updated successfully' : 'Prescription created successfully');
      onSuccess?.(result.data);
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save prescription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {isEditing ? 'Edit Prescription' : 'Create New Prescription'}
        </CardTitle>
        <CardDescription>
          {isEditing ? 'Update prescription details' : 'Create a new prescription for patient'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-4">
            <Label>Patient *</Label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{selectedPatient.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPatient.phone} • {selectedPatient.age} years</p>
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
                    setValue('patientAge', 0);
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

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Symptoms and Diagnosis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms *</Label>
              <Textarea
                id="symptoms"
                {...register('symptoms')}
                placeholder="Enter patient symptoms"
                className={errors.symptoms ? 'border-red-500' : ''}
                rows={4}
              />
              {errors.symptoms && (
                <p className="text-sm text-red-600">{errors.symptoms.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis *</Label>
              <Textarea
                id="diagnosis"
                {...register('diagnosis')}
                placeholder="Enter diagnosis"
                className={errors.diagnosis ? 'border-red-500' : ''}
                rows={4}
              />
              {errors.diagnosis && (
                <p className="text-sm text-red-600">{errors.diagnosis.message}</p>
              )}
            </div>
          </div>

          {/* Medicines */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Medicines *</Label>
              <Button type="button" onClick={addMedicine} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Medicine {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Medicine Name *</Label>
                      <Input
                        {...register(`medicines.${index}.name`)}
                        placeholder="e.g., Paracetamol"
                        className={errors.medicines?.[index]?.name ? 'border-red-500' : ''}
                      />
                      {errors.medicines?.[index]?.name && (
                        <p className="text-sm text-red-600">{errors.medicines[index]?.name?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Dosage *</Label>
                      <Input
                        {...register(`medicines.${index}.dosage`)}
                        placeholder="e.g., 500mg"
                        className={errors.medicines?.[index]?.dosage ? 'border-red-500' : ''}
                      />
                      {errors.medicines?.[index]?.dosage && (
                        <p className="text-sm text-red-600">{errors.medicines[index]?.dosage?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Frequency *</Label>
                      <Select onValueChange={(value) => setValue(`medicines.${index}.frequency`, value)}>
                        <SelectTrigger className={errors.medicines?.[index]?.frequency ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Once daily">Once daily</SelectItem>
                          <SelectItem value="Twice daily">Twice daily</SelectItem>
                          <SelectItem value="Three times daily">Three times daily</SelectItem>
                          <SelectItem value="Four times daily">Four times daily</SelectItem>
                          <SelectItem value="As needed">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.medicines?.[index]?.frequency && (
                        <p className="text-sm text-red-600">{errors.medicines[index]?.frequency?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Duration *</Label>
                      <Input
                        {...register(`medicines.${index}.duration`)}
                        placeholder="e.g., 7 days"
                        className={errors.medicines?.[index]?.duration ? 'border-red-500' : ''}
                      />
                      {errors.medicines?.[index]?.duration && (
                        <p className="text-sm text-red-600">{errors.medicines[index]?.duration?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Before/After Food</Label>
                      <Select onValueChange={(value) => setValue(`medicines.${index}.beforeAfterFood`, value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="After food" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="before">Before food</SelectItem>
                          <SelectItem value="after">After food</SelectItem>
                          <SelectItem value="with">With food</SelectItem>
                          <SelectItem value="anytime">Anytime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Instructions</Label>
                      <Input
                        {...register(`medicines.${index}.instructions`)}
                        placeholder="Special instructions"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Tests and Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="advice">Advice</Label>
              <Textarea
                id="advice"
                {...register('advice')}
                placeholder="General advice for the patient"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                {...register('followUpDate')}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* ICD Code */}
          <div className="space-y-2">
            <Label htmlFor="icdCode">ICD Code</Label>
            <Input
              id="icdCode"
              {...register('icdCode')}
              placeholder="Enter ICD code (optional)"
            />
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
                  {isEditing ? 'Update Prescription' : 'Create Prescription'}
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