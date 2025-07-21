'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Calendar,
  FileText,
  CreditCard,
  Plus,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import Navigation from '@/components/layout/Navigation';
import AdminProtected from '@/components/auth/AdminProtected';
import { useSession, signOut } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ChartContainer } from '@/components/ui/chart';
import * as RechartsPrimitive from 'recharts';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingBills: number;
  monthlyRevenue: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingBills: 0,
    monthlyRevenue: 0,
  });
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [pendingBills, setPendingBills] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [appointmentTrends, setAppointmentTrends] = useState<any[]>([]);
  const [patientGrowth, setPatientGrowth] = useState<any[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function fetchStatsAndChart() {
      setStatsLoading(true);
      try {
        const [patientsRes, apptsRes, invoicesRes] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/appointments?view=today'),
          fetch('/api/invoices'),
        ]);
        const patients = await patientsRes.json();
        const appts = await apptsRes.json();
        const invoices = await invoicesRes.json();
        setStats({
          totalPatients: patients.data?.pagination?.total || 0,
          todayAppointments: appts.data?.pagination?.total || 0,
          pendingBills: (invoices.data?.invoices || []).filter((inv: any) => inv.status !== 'paid').length,
          monthlyRevenue: (invoices.data?.invoices || []).reduce((sum: number, inv: any) => sum + (inv.status === 'paid' ? inv.total : 0), 0),
        });
        // Prepare chart data: revenue by month (last 6 months)
        const now = new Date();
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return { label: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() };
        });
        const revenueByMonth = months.map(({ label, year, month }) => {
          const monthInvoices = (invoices.data?.invoices || []).filter((inv: any) => {
            const d = new Date(inv.date);
            return d.getFullYear() === year && d.getMonth() === month && inv.status === 'paid';
          });
          return {
            month: label,
            revenue: monthInvoices.reduce((sum: number, inv: any) => sum + inv.total, 0),
          };
        });
        setChartData(revenueByMonth);

        // Fetch all appointments for the last 90 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 89);
        const apptTrendsRes = await fetch(`/api/appointments?page=1&limit=1000&from=${startDate.toISOString().split('T')[0]}`);
        const apptTrendsData = await apptTrendsRes.json();
        // Aggregate by day
        const trendsMap: Record<string, number> = {};
        (apptTrendsData.data?.appointments || []).forEach((appt: any) => {
          const d = new Date(appt.date);
          const key = d.toISOString().split('T')[0];
          trendsMap[key] = (trendsMap[key] || 0) + 1;
        });
        const trendsArr = Object.entries(trendsMap).map(([date, count]) => ({ date, count }));
        trendsArr.sort((a, b) => a.date.localeCompare(b.date));
        setAppointmentTrends(trendsArr);

        // Fetch all patients for the last 12 months
        const startPatientDate = new Date();
        startPatientDate.setMonth(startPatientDate.getMonth() - 11);
        const patientGrowthRes = await fetch(`/api/patients?page=1&limit=1000&from=${startPatientDate.toISOString().split('T')[0]}`);
        const patientGrowthData = await patientGrowthRes.json();
        // Aggregate by month
        const growthMap: Record<string, number> = {};
        (patientGrowthData.data?.patients || []).forEach((p: any) => {
          const d = new Date(p.createdAt);
          const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
          growthMap[key] = (growthMap[key] || 0) + 1;
        });
        const patientMonths = Array.from({ length: 12 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (11 - i));
          return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        });
        const growthArr = patientMonths.map((key) => ({
          month: new Date(key + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }),
          count: growthMap[key] || 0,
        }));
        setPatientGrowth(growthArr);
      } catch (e) {
        setStats({ totalPatients: 0, todayAppointments: 0, pendingBills: 0, monthlyRevenue: 0 });
        setChartData([]);
        setAppointmentTrends([]);
        setPatientGrowth([]);
      }
      setStatsLoading(false);
    }
    fetchStatsAndChart();
    interval = setInterval(fetchStatsAndChart, 60000); // auto-refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // User info for edit
  useEffect(() => {
    if (session?.user) {
      setEditForm({ name: session.user.name || '', email: session.user.email || '', password: '' });
    }
  }, [session]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Failed to update user');
      setEditSuccess('Profile updated!');
    } catch (err: any) {
      setEditError(err.message || 'Error updating profile');
    }
    setEditLoading(false);
  };

  const quickActions = [
    {
      title: 'Add Patient',
      description: 'Register a new patient',
      href: '/patients',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Book Appointment',
      description: 'Schedule new appointment',
      href: '/appointments',
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      title: 'Write Prescription',
      description: 'Create new prescription',
      href: '/prescriptions',
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      title: 'Generate Bill',
      description: 'Create patient invoice',
      href: '/billing',
      icon: CreditCard,
      color: 'bg-orange-500',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminProtected>
      <Navigation />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">My Profile</CardTitle>
              <div className="text-muted-foreground text-sm">{session?.user?.email}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEdit(true)}>Edit Profile</Button>
              <Button variant="destructive" onClick={() => signOut({ callbackUrl: '/auth/login' })}>Logout</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>{session?.user?.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{session?.user?.name}</div>
                <div className="text-muted-foreground text-sm">{session?.user?.email}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Edit Profile Modal */}
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input name="name" value={editForm.name} onChange={handleEditChange} placeholder="Name" required />
              <Input name="email" value={editForm.email} onChange={handleEditChange} placeholder="Email" type="email" required />
              <Input name="password" value={editForm.password} onChange={handleEditChange} placeholder="New Password (optional)" type="password" />
              {editError && <div className="text-red-600 text-sm">{editError}</div>}
              {editSuccess && <div className="text-green-600 text-sm">{editSuccess}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
                <Button type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <div className="space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                {session?.user?.name ? `Welcome back, ${session.user.name}!` : 'Welcome back!'}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </div>
          </div>

          {/* Modern Stats + Analytics Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stats Cards */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {statsLoading ? <span className="animate-pulse">...</span> : stats.totalPatients}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {statsLoading ? <span className="animate-pulse">...</span> : stats.todayAppointments}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {statsLoading ? <span className="animate-pulse">...</span> : stats.pendingBills}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {statsLoading ? <span className="animate-pulse">...</span> : `₹${stats.monthlyRevenue.toLocaleString()}`}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Analytics Chart */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-8 items-center justify-center">
                {chartData.length === 0 ? (
                  <div className="text-muted-foreground">No revenue data.</div>
                ) : (
                  <ChartContainer
                    config={{ revenue: { label: 'Revenue', color: '#4f46e5' } }}
                    style={{ width: '100%', height: 220 }}
                  >
                    <RechartsPrimitive.BarChart data={chartData}>
                      <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                      <RechartsPrimitive.XAxis dataKey="month" />
                      <RechartsPrimitive.YAxis />
                      <RechartsPrimitive.Tooltip />
                      <RechartsPrimitive.Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </RechartsPrimitive.BarChart>
                  </ChartContainer>
                )}
                {/* Appointment Trends Line Chart */}
                <div className="w-full mt-8">
                  <div className="font-semibold mb-2">Appointment Trends (Last 90 Days)</div>
                  {appointmentTrends.length === 0 ? (
                    <div className="text-muted-foreground">No appointment data.</div>
                  ) : (
                    <ChartContainer
                      config={{ count: { label: 'Appointments', color: '#10b981' } }}
                      style={{ width: '100%', height: 220 }}
                    >
                      <RechartsPrimitive.LineChart data={appointmentTrends}>
                        <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                        <RechartsPrimitive.XAxis dataKey="date" />
                        <RechartsPrimitive.YAxis allowDecimals={false} />
                        <RechartsPrimitive.Tooltip />
                        <RechartsPrimitive.Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
                      </RechartsPrimitive.LineChart>
                    </ChartContainer>
                  )}
                </div>
                {/* Patient Growth Bar Chart */}
                <div className="w-full mt-8">
                  <div className="font-semibold mb-2">Patient Growth (Last 12 Months)</div>
                  {patientGrowth.length === 0 ? (
                    <div className="text-muted-foreground">No patient data.</div>
                  ) : (
                    <ChartContainer
                      config={{ count: { label: 'New Patients', color: '#6366f1' } }}
                      style={{ width: '100%', height: 220 }}
                    >
                      <RechartsPrimitive.BarChart data={patientGrowth}>
                        <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                        <RechartsPrimitive.XAxis dataKey="month" />
                        <RechartsPrimitive.YAxis allowDecimals={false} />
                        <RechartsPrimitive.Tooltip />
                        <RechartsPrimitive.Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </RechartsPrimitive.BarChart>
                    </ChartContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.title} href={action.href}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${action.color}`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{action.title}</h3>
                              <p className="text-sm text-muted-foreground">{action.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminProtected>
  );
}
