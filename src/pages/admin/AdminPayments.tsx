import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Eye, 
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

interface PaymentTransaction {
  id: string;
  user_id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: string;
  card_last_four: string | null;
  card_brand: string | null;
  otp_verified: boolean;
  metadata: any;
  created_at: string;
  user_profile?: { full_name: string | null; company_name: string | null };
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function AdminPayments() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching transactions', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Fetch user profiles
    const transactionsWithProfiles = await Promise.all(
      (data || []).map(async (txn) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, company_name')
          .eq('user_id', txn.user_id)
          .single();

        return { ...txn, user_profile: profile };
      })
    );

    setTransactions(transactionsWithProfiles);
    setLoading(false);
  };

  const updateTransactionStatus = async (txnId: string, newStatus: string) => {
    const { error } = await supabase
      .from('payment_transactions')
      .update({ status: newStatus })
      .eq('id', txnId);

    if (error) {
      toast({ title: 'Error updating transaction', variant: 'destructive' });
      return;
    }

    toast({ title: 'Transaction status updated' });
    fetchTransactions();
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.id.toLowerCase().includes(search.toLowerCase()) ||
      txn.user_profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      txn.card_last_four?.includes(search);
    
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    failed: transactions.filter(t => t.status === 'failed').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">View and manage payment transactions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, or card..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchTransactions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Card</TableHead>
                <TableHead>OTP Verified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-xs">
                      {txn.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {txn.user_profile?.company_name || txn.user_profile?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${txn.amount.toFixed(2)} {txn.currency}
                    </TableCell>
                    <TableCell>
                      {txn.card_brand && txn.card_last_four ? (
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          <span>{txn.card_brand} •••• {txn.card_last_four}</span>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {txn.otp_verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Verified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[txn.status] || 'bg-gray-100'}>
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(txn.created_at), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setSelectedTransaction(txn)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Transaction Details</DialogTitle>
                            </DialogHeader>
                            {selectedTransaction && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Transaction ID</p>
                                    <p className="font-mono text-xs">{selectedTransaction.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <Badge className={statusColors[selectedTransaction.status]}>
                                      {selectedTransaction.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Amount</p>
                                    <p className="font-bold text-lg">
                                      ${selectedTransaction.amount.toFixed(2)} {selectedTransaction.currency}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Card</p>
                                    <p>
                                      {selectedTransaction.card_brand} •••• {selectedTransaction.card_last_four}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">OTP Verified</p>
                                    <p>{selectedTransaction.otp_verified ? 'Yes' : 'No'}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Created</p>
                                    <p>{format(new Date(selectedTransaction.created_at), 'PPpp')}</p>
                                  </div>
                                </div>

                                {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                                  <div>
                                    <p className="text-muted-foreground text-sm mb-2">Metadata</p>
                                    <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                                      {JSON.stringify(selectedTransaction.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                <div>
                                  <p className="text-muted-foreground text-sm mb-2">Update Status</p>
                                  <Select 
                                    value={selectedTransaction.status}
                                    onValueChange={(v) => {
                                      updateTransactionStatus(selectedTransaction.id, v);
                                      setSelectedTransaction({ ...selectedTransaction, status: v });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="failed">Failed</SelectItem>
                                      <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
