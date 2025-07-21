'use client';

import { useState, useEffect } from 'react';
import InvoiceForm from '@/components/billing/InvoiceForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/layout/Navigation';
import AdminProtected from '@/components/auth/AdminProtected';

type ViewMode = 'list' | 'add' | 'edit';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  patientName: string;
  patientId: string;
  date: string;
  dueDate: string;
  total: number;
  amountPaid: number;
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

interface ApiResponse {
  success: boolean;
  data: {
    invoices: Invoice[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export default function BillingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/invoices?page=${pagination.page}&limit=${pagination.limit}&search=${encodeURIComponent(searchTerm)}`
      );
      const result: ApiResponse = await response.json();
      if (result.success) {
        setInvoices(result.data.invoices);
        setPagination(result.data.pagination);
      } else {
        toast.error('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [pagination.page, searchTerm]);

  const handleAddInvoice = () => {
    setViewMode('add');
    setSelectedInvoice(null);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setViewMode('edit');
    setSelectedInvoice(invoice);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      const response = await fetch(`/api/invoices?id=${invoiceToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Invoice deleted successfully');
        fetchInvoices();
      } else {
        toast.error(result.error || 'Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    } finally {
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setViewMode('list');
    setSelectedInvoice(null);
    fetchInvoices();
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setSelectedInvoice(null);
  };

  const handleRecordPayment = async (invoice: Invoice) => {
    try {
      const amount = prompt('Enter payment amount (₹):');
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        toast.error('Please enter a valid payment amount');
        return;
      }

      const paymentData = {
        amount: parseFloat(amount),
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
      };

      const response = await fetch(`/api/invoices/payment?id=${invoice._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Payment recorded successfully');
        fetchInvoices();
      } else {
        toast.error(result.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    toast.info(`Viewing invoice ${invoice.invoiceNumber}`);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast.info(`Downloading invoice ${invoice.invoiceNumber}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially-paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);
  const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length;

  return (
    <AdminProtected>
      <Navigation/>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
      {viewMode === 'list' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Billing & Invoices</h2>
              <p className="text-muted-foreground">Manage patient invoices and track payments</p>
            </div>
            <Button onClick={handleAddInvoice}>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalOutstanding.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Pending payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overdueCount}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">Require attention</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pagination.total}</div>
                <p className="text-xs text-muted-foreground">Invoices generated</p>
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
                    placeholder="Search invoices by patient name, invoice number..."
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

          {/* Invoices List */}
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{invoice.patientName}</h3>
                          <Badge variant="secondary" className={getStatusColor(invoice.status)}>
                            {invoice.status.replace('-', ' ')}
                          </Badge>
                          {invoice.status === 'overdue' && (
                            <Badge variant="destructive">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Invoice #:</span> {invoice.invoiceNumber}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{' '}
                            {new Date(invoice.date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Due Date:</span>{' '}
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Total:</span> ₹{invoice.total.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="font-medium text-green-600">Paid:</span>{' '}
                            ₹{invoice.amountPaid.toLocaleString()}
                          </div>
                          {invoice.balance > 0 && (
                            <div>
                              <span className="font-medium text-red-600">Balance:</span>{' '}
                              ₹{invoice.balance.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditInvoice(invoice)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {invoice.balance > 0 && (
                          <Button size="sm" onClick={() => handleRecordPayment(invoice)}>
                            Record Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Invoice</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete invoice {invoiceToDelete?.invoiceNumber}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                disabled={pagination.page === 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && invoices.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchTerm ? 'No invoices found matching your search.' : 'No invoices created yet.'}
                  </p>
                  <Button className="mt-4" variant="outline" onClick={handleAddInvoice}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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
              Back to Billing
            </Button>
          </div>

          <InvoiceForm
            initialData={selectedInvoice}
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