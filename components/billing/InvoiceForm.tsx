'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceSchema, InvoiceFormData } from '@/lib/validations/invoice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X, Plus, Trash2, Search, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  patientName: string;
  patientId: string;
  date: string;
  dueDate: string;
  total: number;
  amountPaid: number; // Ensure amountPaid is included
  balance: number;
  status: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  taxRate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  notes?: string;
  terms?: string;
  patientPhone: string;
  patientEmail?: string;
  patientAddress?: string;
  appointmentId?: string;
  subtotal: number;
}

interface Patient {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface InvoiceFormProps {
  initialData?: Invoice | null;
  onSuccess?: (invoice: any) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function InvoiceForm({
  initialData,
  onSuccess,
  onCancel,
  isEditing = false,
}: InvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Transform initialData to match InvoiceFormData
  const defaultValues: InvoiceFormData = initialData
    ? {
        patientId: initialData.patientId || '',
        patientName: initialData.patientName || '',
        patientPhone: initialData.patientPhone || '',
        patientEmail: initialData.patientEmail || '',
        patientAddress: initialData.patientAddress || '',
        date: new Date(initialData.date).toISOString().split('T')[0],
        dueDate: new Date(initialData.dueDate).toISOString().split('T')[0],
        items: initialData.items || [
          { description: 'Consultation Fee', quantity: 1, rate: 500, amount: 500 },
        ],
        discount: initialData.discount || 0,
        discountType: initialData.discountType || 'fixed',
        taxRate: initialData.taxRate || 0,
        notes: initialData.notes || '',
        terms: initialData.terms || '',
        appointmentId: initialData.appointmentId || undefined,
        invoiceNumber: initialData.invoiceNumber || undefined,
        subtotal: initialData.subtotal || undefined,
        total: initialData.total || undefined,
        balance: initialData.balance || undefined,
        amountPaid: initialData.amountPaid || 0, // Include amountPaid
      }
    : {
        patientId: '',
        patientName: '',
        patientPhone: '',
        patientEmail: '',
        patientAddress: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: 'Consultation Fee', quantity: 1, rate: 500, amount: 500 }],
        discount: 0,
        discountType: 'fixed',
        taxRate: 0,
        appointmentId: undefined,
        invoiceNumber: undefined,
        subtotal: undefined,
        total: undefined,
        balance: undefined,
        amountPaid: 0, // Default to 0 for new invoices
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedDiscount = watch('discount');
  const watchedDiscountType = watch('discountType');
  const watchedTaxRate = watch('taxRate');

  // Calculate totals
  const subtotal = watchedItems?.reduce((sum, item) => sum + (item.quantity * item.rate), 0) || 0;
  const discountAmount =
    watchedDiscountType === 'percentage'
      ? (subtotal * (watchedDiscount || 0)) / 100
      : watchedDiscount || 0;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * (watchedTaxRate || 0)) / 100;
  const total = subtotal - discountAmount + taxAmount;

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
    setValue('patientEmail', patient.email || '');
    setValue('patientAddress', patient.address || '');
    setSearchTerm('');
  };

  const addItem = () => {
    append({
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    });
  };

  const updateItemAmount = (index: number, quantity: number, rate: number) => {
    const amount = quantity * rate;
    setValue(`items.${index}.amount`, amount);
  };

const onSubmit = async (data: InvoiceFormData) => {
  setIsLoading(true);
  try {
    const payload = {
      ...data,
      appointmentId: data.appointmentId && data.appointmentId !== '' ? data.appointmentId : undefined,
      subtotal,
      total,
      balance: total - (data.amountPaid || 0),
      amountPaid: data.amountPaid || 0,
    };

    const url = isEditing && initialData?._id ? `/api/invoices?id=${initialData._id}` : '/api/invoices';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save invoice');
    }

    toast.success(isEditing ? 'Invoice updated successfully' : 'Invoice created successfully');
    onSuccess?.(result.data);
  } catch (error) {
    console.error('Error saving invoice:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to save invoice');
  } finally {
    setIsLoading(false);
  }
};
  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
        </CardTitle>
        <CardDescription>
          {isEditing ? 'Update invoice details' : 'Generate a new invoice for patient'}
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
                  <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                  {selectedPatient.email && (
                    <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
                  )}
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
                    setValue('patientEmail', '');
                    setValue('patientAddress', '');
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
                        <p className="text-sm text-muted-foreground">{patient.phone}</p>
                        {patient.email && (
                          <p className="text-sm text-muted-foreground">{patient.email}</p>
                        )}
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

          {/* Invoice Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Invoice Date *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate')}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-600">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Invoice Items *</Label>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Item {index + 1}</h4>
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Description *</Label>
                      <Input
                        {...register(`items.${index}.description`)}
                        placeholder="e.g., Consultation Fee"
                        className={errors.items?.[index]?.description ? 'border-red-500' : ''}
                      />
                      {errors.items?.[index]?.description && (
                        <p className="text-sm text-red-600">{errors.items[index]?.description?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                          onChange: (e) => {
                            const quantity = parseInt(e.target.value) || 0;
                            const rate = watchedItems[index]?.rate || 0;
                            updateItemAmount(index, quantity, rate);
                          },
                        })}
                        placeholder="1"
                        min="1"
                        className={errors.items?.[index]?.quantity ? 'border-red-500' : ''}
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-sm text-red-600">{errors.items[index]?.quantity?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Rate (₹) *</Label>
                      <Input
                        type="number"
                        {...register(`items.${index}.rate`, {
                          valueAsNumber: true,
                          onChange: (e) => {
                            const rate = parseFloat(e.target.value) || 0;
                            const quantity = watchedItems[index]?.quantity || 1;
                            updateItemAmount(index, quantity, rate);
                          },
                        })}
                        placeholder="500"
                        min="0"
                        step="0.01"
                        className={errors.items?.[index]?.rate ? 'border-red-500' : ''}
                      />
                      {errors.items?.[index]?.rate && (
                        <p className="text-sm text-red-600">{errors.items[index]?.rate?.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-right">
                    <span className="text-sm text-muted-foreground">
                      Amount: ₹{((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.rate || 0)).toFixed(2)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Discount and Tax */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                type="number"
                {...register('discount', { valueAsNumber: true })}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select
                onValueChange={(value) => setValue('discountType', value as 'percentage' | 'fixed')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fixed Amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                {...register('taxRate', { valueAsNumber: true })}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          {/* Invoice Summary */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({watchedTaxRate}%):</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes or payment instructions"
              rows={3}
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
                  {isEditing ? 'Update Invoice' : 'Create Invoice'}
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