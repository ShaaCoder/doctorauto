// AppointmentList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar, 
  User,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { AppointmentFormData } from '@/lib/validations/appointment';

interface AppointmentListProps {
  onAddAppointment: () => void;
  onEditAppointment: (appointment: AppointmentFormData) => void;
  onViewAppointment: (appointment: AppointmentFormData) => void;
}

export default function AppointmentList({ 
  onAddAppointment, 
  onEditAppointment, 
  onViewAppointment 
}: AppointmentListProps) {
  const [appointments, setAppointments] = useState<AppointmentFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);

 const fetchAppointments = async (page: number = 1, search: string = '') => {
  try {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      search,
    });

    const response = await fetch(`/api/appointments?${params}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch appointments');
    }

    // Optional: Validate that each appointment has an _id
    const validatedAppointments = result.data.appointments.map((appt: any) => {
      if (!appt._id) {
        console.warn('Appointment missing _id:', appt);
        return { ...appt, _id: '' }; // Fallback or handle as needed
      }
      return appt;
    });

    setAppointments(validatedAppointments);
    setTotalPages(result.data.pagination.pages);
    setTotalAppointments(result.data.pagination.total);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    toast.error('Failed to load appointments');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAppointments(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

 const handleDeleteAppointment = async (appointmentId: string | undefined) => {
  if (!appointmentId) {
    toast.error('Cannot delete appointment: Missing ID');
    return;
  }
  if (!confirm('Are you sure you want to delete this appointment?')) {
    return;
  }

  try {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete appointment');
    }

    toast.success('Appointment deleted successfully');
    fetchAppointments(currentPage, searchTerm);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    toast.error('Failed to delete appointment');
  }
};

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'follow-up': return 'bg-green-100 text-green-800';
      case 'checkup': return 'bg-purple-100 text-purple-800';
      case 'procedure': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            Manage your appointment schedule and bookings
          </p>
        </div>
        <Button onClick={onAddAppointment} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments by patient name or phone..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
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

      {/* Appointments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchTerm ? 'No appointments found matching your search.' : 'No appointments scheduled yet.'}
                </p>
                <Button 
                  onClick={onAddAppointment} 
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Book First Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {appointment.patientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                        <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                          {appointment.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getTypeColor(appointment.type)}>
                          {appointment.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(appointment.date), 'dd MMM yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {appointment.patientPhone}
                        </span>
                      </div>
                      {appointment.symptoms && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="font-medium">Fee:</span> ₹{appointment.consultationFee}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewAppointment(appointment)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditAppointment(appointment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAppointment(appointment._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalAppointments)} of {totalAppointments} appointments
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}