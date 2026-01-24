import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, Trash2, Play, Image, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface QueueItem {
  id: string;
  product_id: string | null;
  source_url: string;
  status: string | null;
  processed_url: string | null;
  error: string | null;
  attempts: number | null;
  created_at: string;
  processed_at: string | null;
}

export default function AdminImageQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    const { data } = await supabase
      .from('image_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) setQueue(data);
    setLoading(false);
  };

  const processQueue = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('process-image-queue');
      if (error) throw error;
      
      toast({ title: 'Processing started', description: 'Image queue is being processed' });
      
      // Refresh after a delay
      setTimeout(fetchQueue, 5000);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const retryItem = async (id: string) => {
    const { error } = await supabase
      .from('image_queue')
      .update({ status: 'pending', error: null, attempts: 0 })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } else {
      fetchQueue();
      toast({ title: 'Item queued for retry' });
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('image_queue').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } else {
      setQueue(queue.filter(q => q.id !== id));
      toast({ title: 'Item deleted' });
    }
  };

  const clearCompleted = async () => {
    const { error } = await supabase
      .from('image_queue')
      .delete()
      .eq('status', 'completed');

    if (!error) {
      fetchQueue();
      toast({ title: 'Completed items cleared' });
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary',
      pending: 'outline',
    };
    return (
      <Badge variant={variants[status || 'pending'] || 'outline'} className="gap-1">
        {getStatusIcon(status)}
        {status || 'pending'}
      </Badge>
    );
  };

  const stats = {
    total: queue.length,
    pending: queue.filter(q => q.status === 'pending').length,
    processing: queue.filter(q => q.status === 'processing').length,
    completed: queue.filter(q => q.status === 'completed').length,
    failed: queue.filter(q => q.status === 'failed').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Image Processing Queue</h1>
          <p className="text-muted-foreground">Monitor and manage image downloads from CSV imports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearCompleted}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Completed
          </Button>
          <Button onClick={processQueue} disabled={processing}>
            <Play className="h-4 w-4 mr-2" />
            {processing ? 'Processing...' : 'Process Queue'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Processing</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.processing}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats.failed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue Items</CardTitle>
          <CardDescription>Recent image processing jobs</CardDescription>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No items in queue</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <a 
                          href={item.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate max-w-xs block"
                        >
                          {item.source_url.slice(0, 50)}...
                        </a>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{item.attempts || 0}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(item.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell>
                        {item.error && (
                          <span className="text-xs text-red-500 truncate max-w-xs block" title={item.error}>
                            {item.error.slice(0, 30)}...
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {item.status === 'failed' && (
                            <Button variant="ghost" size="icon" onClick={() => retryItem(item.id)}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
