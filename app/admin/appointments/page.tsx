// app/appointments/page.tsx
'use client';

import { useState } from 'react';
import AppointmentList from '@/components/appointments/AppointmentList';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AppointmentFormData } from '@/lib/validations/appointment';
import Navigation from '@/components/layout/Navigation';
import AdminProtected from '@/components/auth/AdminProtected';

type ViewMode = 'list' | 'add' | 'edit';

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentFormData | null>(null);

  const handleAddAppointment = () => {
    setViewMode('add');
    setSelectedAppointment(null);
  };

  const handleEditAppointment = (appointment: any) => {
    // Transform appointment to match AppointmentFormData
    const transformedAppointment: AppointmentFormData = {
      ...appointment,
      patientId: appointment.patientId?._id || appointment.patientId, // Extract string ID
      date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '', // Format date
      followUpDate: appointment.followUpDate ? new Date(appointment.followUpDate).toISOString().split('T')[0] : '',
    };
    console.log('Transformed appointment:', transformedAppointment); // Debug log
    setViewMode('edit');
    setSelectedAppointment(transformedAppointment);
  };

  const handleViewAppointment = (appointment: AppointmentFormData) => {
    console.log('View appointment:', appointment);
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setSelectedAppointment(null);
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setSelectedAppointment(null);
  };

  return (
    <AdminProtected>
      <Navigation/>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
      {viewMode === 'list' ? (
        <AppointmentList
          onAddAppointment={handleAddAppointment}
          onEditAppointment={handleEditAppointment}
          onViewAppointment={handleViewAppointment}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleFormCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Appointments
            </Button>
          </div>
          
          <AppointmentForm
            initialData={selectedAppointment ?? undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            isEditing={viewMode === 'edit'}
          />
        </div>
      )}
    </div>
    </AdminProtected>
  );
}