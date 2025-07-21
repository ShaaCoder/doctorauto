'use client';

import { useState } from 'react';
import PatientList from '@/components/patients/PatientList';
import PatientForm from '@/components/patients/PatientForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import AdminProtected from '@/components/auth/AdminProtected';

type ViewMode = 'list' | 'add' | 'edit';

interface Patient {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  lastVisit?: string;
  createdAt: string;
}

export default function PatientsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleAddPatient = () => {
    setViewMode('add');
    setSelectedPatient(null);
  };

  const handleEditPatient = (patient: Patient) => {
    setViewMode('edit');
    setSelectedPatient(patient);
  };

  const handleViewPatient = (patient: Patient) => {
    // TODO: Implement patient detail view
    console.log('View patient:', patient);
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setSelectedPatient(null);
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setSelectedPatient(null);
  };

  return (
    <AdminProtected>
      <Navigation/>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
      {viewMode === 'list' ? (
        <PatientList
          onAddPatient={handleAddPatient}
          onEditPatient={handleEditPatient}
          onViewPatient={handleViewPatient}
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
              Back to Patients
            </Button>
          </div>
          
          <PatientForm
  initialData={
    selectedPatient
      ? {
          ...selectedPatient,
          bloodGroup: selectedPatient.bloodGroup as
            | "A+"
            | "A-"
            | "B+"
            | "B-"
            | "AB+"
            | "AB-"
            | "O+"
            | "O-"
            | undefined,
        }
      : undefined
  }
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