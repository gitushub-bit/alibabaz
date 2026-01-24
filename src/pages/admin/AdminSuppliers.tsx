import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Search, Building2, Shield, ShieldCheck, ShieldX } from 'lucide-react';
import { format } from 'date-fns';

interface Supplier {
  id: string;
  user_id: string;
  verified: boolean;
  year_established: number | null;
  employees: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    company_name: string | null;
  };
  productCount?: number;
}

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    
    const { data: suppliersData } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (suppliersData) {
      // Enrich with profile data and product counts
      const enrichedSuppliers = await Promise.all(
        suppliersData.map(async (supplier) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, company_name')
            .eq('user_id', supplier.user_id)
            .single();

          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', supplier.user_id);

          return {
            ...supplier,
            profile,
            productCount: count || 0
          };
        })
      );

      setSuppliers(enrichedSuppliers);
    }
    
    setLoading(false);
  };

  const toggleVerification = async (supplierId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('suppliers')
      .update({ verified: !currentStatus })
      .eq('id', supplierId);

    if (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to update verification status', 
        variant: 'destructive' 
      });
    } else {
      setSuppliers(suppliers.map(s => 
        s.id === supplierId ? { ...s, verified: !currentStatus } : s
      ));
      toast({ 
        title: currentStatus ? 'Supplier unverified' : 'Supplier verified successfully' 
      });
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      (supplier.profile?.company_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (supplier.profile?.full_name?.toLowerCase() || '').includes(search.toLowerCase());
    
    const matchesVerification = 
      verificationFilter === 'all' || 
      (verificationFilter === 'verified' && supplier.verified) ||
      (verificationFilter === 'unverified' && !supplier.verified);
    
    return matchesSearch && matchesVerification;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supplier Verification</h1>
          <p className="text-muted-foreground">Review and verify supplier accounts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{suppliers.length}</p>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{suppliers.filter(s => s.verified).length}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShieldX className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{suppliers.filter(s => !s.verified).length}</p>
                <p className="text-sm text-muted-foreground">Pending Verification</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={verificationFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVerificationFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={verificationFilter === 'verified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVerificationFilter('verified')}
              >
                Verified
              </Button>
              <Button 
                variant={verificationFilter === 'unverified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVerificationFilter('unverified')}
              >
                Pending
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No suppliers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Established</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {supplier.profile?.company_name || 'Unnamed Company'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {supplier.profile?.full_name || 'No contact'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {supplier.year_established || '-'}
                      </TableCell>
                      <TableCell>
                        {supplier.employees || '-'}
                      </TableCell>
                      <TableCell>
                        {supplier.productCount}
                      </TableCell>
                      <TableCell>
                        <Badge className={supplier.verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                          {supplier.verified ? (
                            <>
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={supplier.verified ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => toggleVerification(supplier.id, supplier.verified)}
                        >
                          {supplier.verified ? 'Revoke' : 'Verify'}
                        </Button>
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
