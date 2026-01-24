import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface RFQ {
  id: string;
  title: string;
  description: string | null;
  quantity: number | null;
  unit: string | null;
  deadline: string | null;
  status: string;
  created_at: string;
  responses_count: number;
}

export default function BuyerRFQs() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRFQs();
    }
  }, [user]);

  const fetchRFQs = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('rfqs')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      // Get response counts
      const rfqsWithCounts = await Promise.all(
        data.map(async (rfq) => {
          const { count } = await supabase
            .from('rfq_responses')
            .select('id', { count: 'exact' })
            .eq('rfq_id', rfq.id);
          
          return { ...rfq, responses_count: count || 0 };
        })
      );
      
      setRfqs(rfqsWithCounts);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My RFQs</h1>
        <Button asChild>
          <Link to="/buyer/rfqs/new">
            <Plus className="h-4 w-4 mr-2" />
            Post RFQ
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : rfqs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No RFQs yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Post a request and receive quotes from suppliers
          </p>
          <Button asChild className="mt-4">
            <Link to="/buyer/rfqs/new">Post Your First RFQ</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {rfqs.map((rfq) => (
            <Card key={rfq.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{rfq.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Posted {format(new Date(rfq.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {getStatusBadge(rfq.status)}
                </div>
              </CardHeader>
              <CardContent>
                {rfq.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {rfq.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm">
                  {rfq.quantity && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{rfq.quantity} {rfq.unit || 'pieces'}</span>
                    </div>
                  )}
                  {rfq.deadline && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Deadline: {format(new Date(rfq.deadline), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{rfq.responses_count} {rfq.responses_count === 1 ? 'response' : 'responses'}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/buyer/rfqs/${rfq.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
