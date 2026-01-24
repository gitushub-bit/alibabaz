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
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface RFQ {
  id: string;
  buyer_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  quantity: number | null;
  unit: string | null;
  deadline: string | null;
  status: string;
  images: string[] | null;
  created_at: string;
  buyer_profile?: { full_name: string | null; company_name: string | null };
  category?: { name: string } | null;
  responses_count?: number;
}

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  awarded: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminRFQs() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rfqs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching RFQs', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Fetch related data
    const rfqsWithDetails = await Promise.all(
      (data || []).map(async (rfq) => {
        const [buyerRes, categoryRes, responsesRes] = await Promise.all([
          supabase.from('profiles').select('full_name, company_name').eq('user_id', rfq.buyer_id).single(),
          rfq.category_id 
            ? supabase.from('categories').select('name').eq('id', rfq.category_id).single()
            : null,
          supabase.from('rfq_responses').select('id', { count: 'exact', head: true }).eq('rfq_id', rfq.id),
        ]);

        return {
          ...rfq,
          buyer_profile: buyerRes.data,
          category: categoryRes?.data,
          responses_count: responsesRes.count || 0,
        };
      })
    );

    setRfqs(rfqsWithDetails);
    setLoading(false);
  };

  const updateRfqStatus = async (rfqId: string, newStatus: string) => {
    const { error } = await supabase
      .from('rfqs')
      .update({ status: newStatus })
      .eq('id', rfqId);

    if (error) {
      toast({ title: 'Error updating RFQ', variant: 'destructive' });
      return;
    }

    toast({ title: 'RFQ status updated' });
    fetchRFQs();
  };

  const filteredRfqs = rfqs.filter(rfq => {
    const matchesSearch = 
      rfq.title.toLowerCase().includes(search.toLowerCase()) ||
      rfq.buyer_profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      rfq.buyer_profile?.company_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const rfqStats = {
    total: rfqs.length,
    open: rfqs.filter(r => r.status === 'open').length,
    closed: rfqs.filter(r => r.status === 'closed' || r.status === 'awarded').length,
    totalResponses: rfqs.reduce((sum, r) => sum + (r.responses_count || 0), 0),
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
        <h1 className="text-3xl font-bold">RFQs</h1>
        <p className="text-muted-foreground">Manage Request for Quotations</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total RFQs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfqStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfqStats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Closed/Awarded</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfqStats.closed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfqStats.totalResponses}</div>
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
                placeholder="Search RFQs..."
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchRFQs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RFQs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRfqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No RFQs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRfqs.map((rfq) => (
                  <TableRow key={rfq.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {rfq.title}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {rfq.buyer_profile?.company_name || rfq.buyer_profile?.full_name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>{rfq.category?.name || 'Uncategorized'}</TableCell>
                    <TableCell>
                      {rfq.quantity ? `${rfq.quantity} ${rfq.unit || 'pcs'}` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {rfq.deadline ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(rfq.deadline), 'MMM dd, yyyy')}
                        </div>
                      ) : (
                        'No deadline'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {rfq.responses_count} responses
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[rfq.status] || 'bg-gray-100'}>
                        {rfq.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedRfq(rfq)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>RFQ Details</DialogTitle>
                            </DialogHeader>
                            {selectedRfq && (
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-semibold text-lg">{selectedRfq.title}</h3>
                                  <p className="text-muted-foreground text-sm mt-1">
                                    {selectedRfq.description || 'No description provided'}
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Buyer</p>
                                    <p>{selectedRfq.buyer_profile?.company_name || selectedRfq.buyer_profile?.full_name}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Category</p>
                                    <p>{selectedRfq.category?.name || 'Uncategorized'}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Quantity</p>
                                    <p>{selectedRfq.quantity} {selectedRfq.unit}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Deadline</p>
                                    <p>{selectedRfq.deadline ? format(new Date(selectedRfq.deadline), 'PPP') : 'No deadline'}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Created</p>
                                    <p>{format(new Date(selectedRfq.created_at), 'PPpp')}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Responses</p>
                                    <p>{selectedRfq.responses_count} seller responses</p>
                                  </div>
                                </div>

                                {selectedRfq.images && selectedRfq.images.length > 0 && (
                                  <div>
                                    <p className="text-muted-foreground text-sm mb-2">Attached Images</p>
                                    <div className="flex gap-2 flex-wrap">
                                      {selectedRfq.images.map((img, i) => (
                                        <img 
                                          key={i} 
                                          src={img} 
                                          alt="" 
                                          className="w-20 h-20 object-cover rounded-lg"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <p className="text-muted-foreground text-sm mb-2">Update Status</p>
                                  <Select 
                                    value={selectedRfq.status} 
                                    onValueChange={(v) => {
                                      updateRfqStatus(selectedRfq.id, v);
                                      setSelectedRfq({ ...selectedRfq, status: v });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="open">Open</SelectItem>
                                      <SelectItem value="closed">Closed</SelectItem>
                                      <SelectItem value="awarded">Awarded</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Select 
                          value={rfq.status}
                          onValueChange={(v) => updateRfqStatus(rfq.id, v)}
                        >
                          <SelectTrigger className="w-[100px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="awarded">Awarded</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
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
