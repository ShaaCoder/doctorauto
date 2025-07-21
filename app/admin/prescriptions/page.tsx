'use client';

import { useState, useEffect } from 'react';
import PrescriptionForm from '@/components/prescriptions/PrescriptionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Copy,
  ArrowLeft,
  Loader2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { PrescriptionFormData } from '@/lib/validations/prescription';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as ShadcnDialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import Navigation from '@/components/layout/Navigation';
import AdminProtected from '@/components/auth/AdminProtected';

// Define the Medicine interface to match the prescriptionSchema
interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  beforeAfterFood: 'before' | 'after' | 'with' | 'anytime';
}

// Update Prescription interface to align with IPrescription
interface Prescription {
  _id: string;
  prescriptionNumber?: string;
  patientId: {
    _id: string;
    name: string;
    age: number;
    phone: string;
    email?: string;
    gender: 'male' | 'female' | 'other';
  };
  appointmentId?: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  medicines: Medicine[];
  medicineCount: number;
  tests?: string[];
  advice?: string;
  followUpDate?: string;
  icdCode?: string;
  isActive: boolean;
}

interface ApiResponse {
  success: boolean;
  data: {
    prescriptions: Prescription[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  error?: string;
}

// PrescriptionView component for displaying prescription details
function PrescriptionView({ 
  prescription, 
  onBack 
}: { 
  prescription: Prescription; 
  onBack: () => void;
}) {
  return (
    <AdminProtected>
      <Navigation/>
      <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Prescription Details
        </CardTitle>
        <CardDescription>View prescription details for {prescription.patientName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium">Name:</span> {prescription.patientName}
              </div>
              <div>
                <span className="font-medium">Age:</span> {prescription.patientAge} years
              </div>
              <div>
                <span className="font-medium">Phone:</span> {prescription.patientPhone}
              </div>
              <div>
                <span className="font-medium">Gender:</span> {prescription.patientId.gender}
              </div>
              {prescription.patientId.email && (
                <div>
                  <span className="font-medium">Email:</span> {prescription.patientId.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Prescription Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium">Prescription #:</span>{' '}
                {prescription.prescriptionNumber || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Date:</span>{' '}
                {new Date(prescription.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                {prescription.isActive ? 'Active' : 'Inactive'}
              </div>
              {prescription.icdCode && (
                <div>
                  <span className="font-medium">ICD Code:</span> {prescription.icdCode}
                </div>
              )}
              {prescription.appointmentId && (
                <div>
                  <span className="font-medium">Appointment ID:</span> {prescription.appointmentId}
                </div>
              )}
              {prescription.followUpDate && (
                <div>
                  <span className="font-medium">Follow-up Date:</span>{' '}
                  {new Date(prescription.followUpDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Symptoms</h3>
            <p className="text-sm mt-2">{prescription.symptoms || 'N/A'}</p>
          </div>

          <div>
            <h3 className="font-semibold">Diagnosis</h3>
            <p className="text-sm mt-2">{prescription.diagnosis}</p>
          </div>

          <div>
            <h3 className="font-semibold">Medicines</h3>
            {prescription.medicines.length > 0 ? (
              <div className="space-y-4 mt-2">
                {prescription.medicines.map((medicine, index) => (
                  <Card key={index} className="p-4">
                    <h4 className="font-medium">Medicine {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mt-2">
                      <div>
                        <span className="font-medium">Name:</span> {medicine.name}
                      </div>
                      <div>
                        <span className="font-medium">Dosage:</span> {medicine.dosage}
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span> {medicine.frequency}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {medicine.duration}
                      </div>
                      <div>
                        <span className="font-medium">Before/After Food:</span> {medicine.beforeAfterFood}
                      </div>
                      {medicine.instructions && (
                        <div>
                          <span className="font-medium">Instructions:</span> {medicine.instructions}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm mt-2">No medicines prescribed</p>
            )}
          </div>

          {prescription.tests && prescription.tests.length > 0 && (
            <div>
              <h3 className="font-semibold">Tests</h3>
              <ul className="list-disc list-inside text-sm mt-2">
                {prescription.tests.map((test, index) => (
                  <li key={index}>{test}</li>
                ))}
              </ul>
            </div>
          )}

          {prescription.advice && (
            <div>
              <h3 className="font-semibold">Advice</h3>
              <p className="text-sm mt-2">{prescription.advice}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prescriptions
          </Button>
        </div>
      </CardContent>
    </Card>
    </AdminProtected>
  );
}

export default function PrescriptionsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit' | 'view'>('list');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);
  const [deleteType, setDeleteType] = useState<'soft' | 'permanent'>('soft');

  // Fetch prescriptions from API
  useEffect(() => {
    const fetchPrescriptions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/prescriptions?page=${pagination.page}&limit=${pagination.limit}&search=${encodeURIComponent(searchTerm)}`
        );
        const result: ApiResponse = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch prescriptions');
        }

        const mappedPrescriptions: Prescription[] = result.data.prescriptions.map((p) => ({
          _id: p._id,
          prescriptionNumber: p.prescriptionNumber || `RX${p._id.slice(-6)}`,
          patientId: p.patientId,
          appointmentId: p.appointmentId,
          patientName: p.patientId?.name || p.patientName || 'Unknown',
          patientAge: p.patientId?.age || p.patientAge || 0,
          patientPhone: p.patientId?.phone || p.patientPhone || '',
          date: p.date,
          symptoms: p.symptoms || '',
          diagnosis: p.diagnosis,
          medicines: p.medicines || [],
          medicineCount: p.medicines?.length || 0,
          tests: p.tests || [],
          advice: p.advice || '',
          followUpDate: p.followUpDate,
          icdCode: p.icdCode,
          isActive: p.isActive ?? true,
        }));

        setPrescriptions(mappedPrescriptions);
        setPagination(result.data.pagination);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch prescriptions');
        toast.error('Failed to load prescriptions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [searchTerm, pagination.page, pagination.limit]);

  const handleAddPrescription = () => {
    setViewMode('add');
    setSelectedPrescription(null);
  };

  const handleEditPrescription = (prescription: Prescription) => {
    setViewMode('edit');
    setSelectedPrescription(prescription);
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setViewMode('view');
    setSelectedPrescription(prescription);
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setSelectedPrescription(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setSelectedPrescription(null);
  };

  const handleCopyPrescription = (prescription: Prescription) => {
    const text = `
      Prescription #: ${prescription.prescriptionNumber || 'N/A'}
      Patient: ${prescription.patientName}
      Age: ${prescription.patientAge} years
      Phone: ${prescription.patientPhone}
      Date: ${new Date(prescription.date).toLocaleDateString()}
      Symptoms: ${prescription.symptoms || 'N/A'}
      Diagnosis: ${prescription.diagnosis}
      Medicines: ${prescription.medicines
        .map(
          (m, i) =>
            `${i + 1}. ${m.name} (${m.dosage}, ${m.frequency}, ${m.duration}, ${m.beforeAfterFood})${m.instructions ? ` - ${m.instructions}` : ''}`
        )
        .join('\n    ')}
      Tests: ${prescription.tests?.length ? prescription.tests.join(', ') : 'None'}
      Advice: ${prescription.advice || 'None'}
      Follow-up: ${prescription.followUpDate ? new Date(prescription.followUpDate).toLocaleDateString() : 'None'}
      Status: ${prescription.isActive ? 'Active' : 'Inactive'}
    `;
    navigator.clipboard
      .writeText(text.trim())
      .then(() => {
        toast.success('Prescription details copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy prescription:', err);
        toast.error('Failed to copy prescription details');
      });
  };

  const handleDownloadPrescription = (prescription: Prescription) => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Prescription Details', 20, 20);
    doc.text(`Prescription #: ${prescription.prescriptionNumber || 'N/A'}`, 20, 30);
    doc.text(`Patient: ${prescription.patientName}`, 20, 40);
    doc.text(`Age: ${prescription.patientAge} years`, 20, 50);
    doc.text(`Phone: ${prescription.patientPhone}`, 20, 60);
    doc.text(`Date: ${new Date(prescription.date).toLocaleDateString()}`, 20, 70);
    doc.text(`Symptoms: ${prescription.symptoms || 'N/A'}`, 20, 80);
    doc.text(`Diagnosis: ${prescription.diagnosis}`, 20, 90);
    doc.text('Medicines:', 20, 100);
    prescription.medicines.forEach((m, i) => {
      doc.text(
        `${i + 1}. ${m.name} (${m.dosage}, ${m.frequency}, ${m.duration}, ${m.beforeAfterFood})${m.instructions ? ` - ${m.instructions}` : ''}`,
        25,
        110 + i * 10
      );
    });
    let yOffset = 110 + prescription.medicines.length * 10;
    doc.text(`Tests: ${prescription.tests?.length ? prescription.tests.join(', ') : 'None'}`, 20, yOffset);
    doc.text(`Advice: ${prescription.advice || 'None'}`, 20, yOffset + 10);
    doc.text(
      `Follow-up: ${prescription.followUpDate ? new Date(prescription.followUpDate).toLocaleDateString() : 'None'}`,
      20,
      yOffset + 20
    );
    doc.text(`Status: ${prescription.isActive ? 'Active' : 'Inactive'}`, 20, yOffset + 30);
    doc.save(`Prescription_${prescription.prescriptionNumber || prescription._id}.pdf`);
    toast.success('Prescription PDF downloaded');
  };

  const handleDeletePrescription = async (prescriptionId: string, permanent: boolean) => {
    try {
      setIsLoading(true);
      // Optimistically update the UI
      setPrescriptions((prev) => prev.filter((p) => p._id !== prescriptionId));
      const response = await fetch(`/api/prescriptions/${prescriptionId}?permanent=${permanent}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!result.success) {
        // Revert optimistic update on failure
        setPagination((prev) => ({ ...prev, page: 1 })); // Trigger re-fetch
        throw new Error(result.error || `Failed to ${permanent ? 'delete' : 'deactivate'} prescription`);
      }

      toast.success(`Prescription ${permanent ? 'permanently deleted' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error deleting prescription:', err);
      toast.error(err instanceof Error ? err.message : `Failed to ${permanent ? 'delete' : 'deactivate'} prescription`);
      // Trigger re-fetch to restore correct state
      setPagination((prev) => ({ ...prev, page: 1 }));
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setPrescriptionToDelete(null);
      setDeleteType('soft');
    }
  };

  const openDeleteDialog = (prescription: Prescription, type: 'soft' | 'permanent') => {
    setPrescriptionToDelete(prescription);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const transformToFormData = (prescription: Prescription | null): Partial<PrescriptionFormData> | undefined => {
    if (!prescription) return undefined;
    return {
      _id: prescription._id,
      patientId: prescription.patientId._id,
      appointmentId: prescription.appointmentId,
      patientName: prescription.patientName,
      patientAge: prescription.patientAge,
      patientPhone: prescription.patientPhone,
      date: prescription.date,
      symptoms: prescription.symptoms,
      diagnosis: prescription.diagnosis,
      medicines: prescription.medicines,
      tests: prescription.tests,
      advice: prescription.advice,
      followUpDate: prescription.followUpDate,
      icdCode: prescription.icdCode,
      prescriptionNumber: prescription.prescriptionNumber,
      isActive: prescription.isActive,
    };
  };

  return (
    <AdminProtected>
      <Navigation/>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
      {viewMode === 'list' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Prescriptions</h2>
              <p className="text-muted-foreground">
                Create and manage patient prescriptions
              </p>
            </div>
            <Button onClick={handleAddPrescription}>
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pagination.total}</div>
                <p className="text-xs text-muted-foreground">
                  Total prescriptions in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {prescriptions.filter((p) => p.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active treatments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {prescriptions.filter(
                    (p) =>
                      new Date(p.date).getMonth() === new Date().getMonth() &&
                      new Date(p.date).getFullYear() === new Date().getFullYear()
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Prescriptions this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    prescriptions.filter(
                      (p) =>
                        p.followUpDate &&
                        new Date(p.followUpDate) <=
                          new Date(new Date().setDate(new Date().getDate() + 7))
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Patients need follow-up
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search prescriptions by patient name, prescription number, or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="pt-6 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-red-600">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setPagination((prev) => ({ ...prev }))}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Prescriptions List */}
          {!isLoading && !error && prescriptions.length > 0 && (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <Card key={prescription._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{prescription.patientName}</h3>
                          <Badge variant="outline">
                            {prescription.patientAge} years
                          </Badge>
                          <Badge variant="secondary" className={getStatusColor(prescription.isActive)}>
                            {prescription.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Prescription #:</span>{' '}
                            {prescription.prescriptionNumber || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{' '}
                            {new Date(prescription.date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Medicines:</span>{' '}
                            {prescription.medicineCount} items
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Diagnosis:</span> {prescription.diagnosis}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPrescription(prescription)}
                          title="View prescription"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPrescription(prescription)}
                          title="Edit prescription"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyPrescription(prescription)}
                          title="Copy prescription details"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPrescription(prescription)}
                          title="Download prescription as PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(prescription, 'soft')}
                              title="Deactivate prescription"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <ShadcnDialogDescription>
                                {deleteType === 'soft'
                                  ? `Are you sure you want to deactivate the prescription for ${prescriptionToDelete?.patientName} (#${prescriptionToDelete?.prescriptionNumber || 'N/A'})? It will be marked as inactive but can be restored later.`
                                  : `Are you sure you want to permanently delete the prescription for ${prescriptionToDelete?.patientName} (#${prescriptionToDelete?.prescriptionNumber || 'N/A'})? This action cannot be undone.`}
                              </ShadcnDialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setDeleteDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              {deleteType === 'soft' && (
                                <Button
                                  variant="secondary"
                                  onClick={() => setDeleteType('permanent')}
                                  disabled={isLoading}
                                >
                                  Switch to Permanent Delete
                                </Button>
                              )}
                              {deleteType === 'permanent' && (
                                <Button
                                  variant="secondary"
                                  onClick={() => setDeleteType('soft')}
                                  disabled={isLoading}
                                >
                                  Switch to Deactivate
                                </Button>
                              )}
                              <Button
                                variant={deleteType === 'soft' ? 'destructive' : 'destructive'}
                                onClick={() => prescriptionToDelete && handleDeletePrescription(prescriptionToDelete._id, deleteType === 'permanent')}
                                disabled={isLoading}
                              >
                                {deleteType === 'soft' ? 'Deactivate' : 'Delete Permanently'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && prescriptions.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchTerm
                      ? 'No prescriptions found matching your search.'
                      : 'No prescriptions created yet.'}
                  </p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={handleAddPrescription}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Prescription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : viewMode === 'view' && selectedPrescription ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleFormCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Prescriptions
            </Button>
          </div>
          <PrescriptionView 
            prescription={selectedPrescription} 
            onBack={handleFormCancel}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleFormCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Prescriptions
            </Button>
          </div>
          <PrescriptionForm
            initialData={transformToFormData(selectedPrescription)}
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