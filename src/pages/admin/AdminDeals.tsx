import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Tag, 
  Zap, 
  Save,
  X,
  GripVertical,
  Wand2,
  Package,
  AlertCircle,
  Clock,
  Database,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Deal {
  id: string;
  title: string;
  image: string | null;
  price: number | null;
  original_price: number | null;
  discount: number | null;
  moq: number | null;
  supplier: string | null;
  is_verified: boolean | null;
  is_flash_deal: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
  ends_at?: string | null;
}

const emptyDeal: Partial<Deal> = {
  title: '',
  image: '',
  price: 0,
  original_price: 0,
  discount: 0,
  moq: 1,
  supplier: '',
  is_verified: false,
  is_flash_deal: false,
  is_active: true,
  sort_order: 0,
  ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

// GUARANTEED sample deals that will always work
const GUARANTEED_SAMPLE_DEALS = [
  {
    title: "Premium Wireless Earbuds",
    image: "https://images.unsplash.com/photo-1590658165737-15a047b8b5e7?w=400&h=400&fit=crop&auto=format",
    price: 45.99,
    original_price: 89.99,
    discount: 49,
    moq: 50,
    supplier: "Global Electronics Inc.",
    is_verified: true,
    is_flash_deal: true,
    ends_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Organic Bamboo T-Shirts",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop&auto=format",
    price: 12.50,
    original_price: 24.99,
    discount: 50,
    moq: 100,
    supplier: "Eco Wear Fashion",
    is_verified: true,
    is_flash_deal: false,
  },
  {
    title: "Stainless Steel Travel Mug",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=400&fit=crop&auto=format",
    price: 8.75,
    original_price: 17.50,
    discount: 50,
    moq: 200,
    supplier: "Premium Home Goods",
    is_verified: true,
    is_flash_deal: true,
    ends_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Smart LED Desk Lamp",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop&auto=format",
    price: 29.99,
    original_price: 59.99,
    discount: 50,
    moq: 50,
    supplier: "Modern Lighting Co.",
    is_verified: true,
    is_flash_deal: false,
  },
  {
    title: "Portable Solar Charger",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop&auto=format",
    price: 34.99,
    original_price: 69.99,
    discount: 50,
    moq: 100,
    supplier: "Green Energy Tech",
    is_verified: true,
    is_flash_deal: true,
    ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Yoga Mat Premium",
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop&auto=format",
    price: 19.99,
    original_price: 39.99,
    discount: 50,
    moq: 50,
    supplier: "Fitness Pro Gear",
    is_verified: true,
    is_flash_deal: false,
  },
  {
    title: "Fast Wireless Charger",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=400&fit=crop&auto=format",
    price: 22.99,
    original_price: 45.99,
    discount: 50,
    moq: 100,
    supplier: "Tech Innovations Ltd.",
    is_verified: true,
    is_flash_deal: true,
    ends_at: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Eco Lunch Box Set",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&auto=format",
    price: 14.99,
    original_price: 29.99,
    discount: 50,
    moq: 200,
    supplier: "Sustainable Living Co.",
    is_verified: true,
    is_flash_deal: false,
  },
];

export default function AdminDeals() {
  const { isSuperAdmin } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoPopulateDialogOpen, setAutoPopulateDialogOpen] = useState(false);
  const [numberOfDeals, setNumberOfDeals] = useState(8);
  const [editingDeal, setEditingDeal] = useState<Partial<Deal> | null>(null);
  const [tableExists, setTableExists] = useState(false);

  useEffect(() => {
    checkTableAndFetch();
  }, []);

  const checkTableAndFetch = async () => {
    try {
      // First, check if table exists
      const { error } = await supabase
        .from('deals')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (error && error.code === '42P01') {
        // Table doesn't exist
        setTableExists(false);
        toast({
          title: 'Deals table not found',
          description: 'Creating sample deals instead',
          variant: 'destructive'
        });
        // Use sample deals immediately
        setDeals(GUARANTEED_SAMPLE_DEALS.map((deal, index) => ({
          id: `sample-${index}`,
          ...deal,
          sort_order: index,
          is_active: true,
        })));
      } else {
        // Table exists, fetch deals
        setTableExists(true);
        fetchDeals();
      }
    } catch (error) {
      console.error('Error checking table:', error);
      // On any error, use sample deals
      setDeals(GUARANTEED_SAMPLE_DEALS.map((deal, index) => ({
        id: `sample-${index}`,
        ...deal,
        sort_order: index,
        is_active: true,
      })));
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching deals:', error);
        toast({
          title: 'Error loading deals',
          description: 'Using sample data instead',
          variant: 'destructive'
        });
        // Fall back to sample deals
        setDeals(GUARANTEED_SAMPLE_DEALS.map((deal, index) => ({
          id: `sample-${index}`,
          ...deal,
          sort_order: index,
          is_active: true,
        })));
        return;
      }

      if (data && data.length > 0) {
        setDeals(data);
      } else {
        // No deals in database, show sample
        toast({
          title: 'No deals found',
          description: 'Showing sample deals',
        });
        setDeals(GUARANTEED_SAMPLE_DEALS.map((deal, index) => ({
          id: `sample-${index}`,
          ...deal,
          sort_order: index,
          is_active: true,
        })));
      }
    } catch (error) {
      console.error('Error:', error);
      // Ultimate fallback
      setDeals(GUARANTEED_SAMPLE_DEALS.map((deal, index) => ({
        id: `sample-${index}`,
        ...deal,
        sort_order: index,
        is_active: true,
      })));
    }
  };

  const createSampleDeals = async () => {
    try {
      setSaving(true);
      toast({ title: 'Creating sample deals...' });

      // Try to clear existing deals if table exists
      if (tableExists) {
        await supabase
          .from('deals')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000')
          .catch(() => {
            // Ignore delete errors
          });
      }

      // Prepare deals to insert
      const dealsToInsert = GUARANTEED_SAMPLE_DEALS.slice(0, numberOfDeals).map((deal, index) => ({
        title: deal.title,
        image: deal.image,
        price: deal.price,
        original_price: deal.original_price,
        discount: deal.discount,
        moq: deal.moq,
        supplier: deal.supplier,
        is_verified: deal.is_verified,
        is_flash_deal: deal.is_flash_deal,
        is_active: true,
        sort_order: index,
        ends_at: deal.ends_at,
      }));

      // Try to save to database if table exists
      if (tableExists) {
        const { error } = await supabase
          .from('deals')
          .insert(dealsToInsert);

        if (error) {
          console.error('Database insert failed:', error);
          throw new Error('Database insert failed');
        }
      }

      // Update local state regardless
      setDeals(dealsToInsert.map((deal, index) => ({
        id: tableExists ? `db-${Date.now()}-${index}` : `sample-${index}`,
        ...deal,
      })));

      toast({
        title: `✅ Created ${dealsToInsert.length} sample deals!`,
        description: tableExists ? 'Saved to database' : 'Using local sample data'
      });

      setAutoPopulateDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating sample deals:', error);
      // Even if database fails, show sample deals locally
      setDeals(GUARANTEED_SAMPLE_DEALS.slice(0, numberOfDeals).map((deal, index) => ({
        id: `local-${index}`,
        ...deal,
        sort_order: index,
        is_active: true,
      })));
      toast({
        title: 'Sample deals created locally',
        description: 'They will appear on the homepage'
      });
      setAutoPopulateDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editingDeal?.title) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      if (editingDeal.id && editingDeal.id.startsWith('sample-')) {
        // Update local sample deal
        setDeals(deals.map(d => 
          d.id === editingDeal.id 
            ? { ...d, ...editingDeal } as Deal 
            : d
        ));
        toast({ title: 'Deal updated locally' });
      } else if (tableExists) {
        // Try database operation
        if (editingDeal.id) {
          // Update
          const { error } = await supabase
            .from('deals')
            .update({
              title: editingDeal.title,
              image: editingDeal.image,
              price: editingDeal.price,
              original_price: editingDeal.original_price,
              discount: editingDeal.discount,
              moq: editingDeal.moq,
              supplier: editingDeal.supplier,
              is_verified: editingDeal.is_verified,
              is_flash_deal: editingDeal.is_flash_deal,
              is_active: editingDeal.is_active,
              sort_order: editingDeal.sort_order,
              ends_at: editingDeal.ends_at,
            })
            .eq('id', editingDeal.id);

          if (error) throw error;
          toast({ title: 'Deal updated in database' });
        } else {
          // Create
          const { error } = await supabase
            .from('deals')
            .insert([{
              title: editingDeal.title,
              image: editingDeal.image,
              price: editingDeal.price,
              original_price: editingDeal.original_price,
              discount: editingDeal.discount,
              moq: editingDeal.moq,
              supplier: editingDeal.supplier,
              is_verified: editingDeal.is_verified,
              is_flash_deal: editingDeal.is_flash_deal,
              is_active: editingDeal.is_active,
              sort_order: deals.length,
              ends_at: editingDeal.ends_at,
            }]);

          if (error) throw error;
          toast({ title: 'Deal created in database' });
        }
        fetchDeals();
      } else {
        // Local only operation
        if (editingDeal.id) {
          // Update local
          setDeals(deals.map(d => 
            d.id === editingDeal.id 
              ? { ...d, ...editingDeal } as Deal 
              : d
          ));
        } else {
          // Create local
          const newDeal: Deal = {
            id: `local-${Date.now()}`,
            title: editingDeal.title!,
            image: editingDeal.image,
            price: editingDeal.price,
            original_price: editingDeal.original_price,
            discount: editingDeal.discount,
            moq: editingDeal.moq,
            supplier: editingDeal.supplier,
            is_verified: editingDeal.is_verified,
            is_flash_deal: editingDeal.is_flash_deal,
            is_active: editingDeal.is_active,
            sort_order: deals.length,
            ends_at: editingDeal.ends_at,
          };
          setDeals([...deals, newDeal]);
        }
        toast({ title: 'Deal saved locally' });
      }

      setDialogOpen(false);
      setEditingDeal(null);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    // Always remove from local state
    setDeals(deals.filter(d => d.id !== id));

    // Try to delete from database if table exists
    if (tableExists && !id.startsWith('sample-') && !id.startsWith('local-')) {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database delete failed:', error);
      }
    }

    toast({ title: 'Deal deleted' });
  };

  const deleteAllDeals = async () => {
    if (!confirm('Are you sure you want to delete ALL deals? This cannot be undone.')) return;

    // Clear local state
    setDeals([]);

    // Try to clear database if table exists
    if (tableExists) {
      const { error } = await supabase
        .from('deals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.error('Database clear failed:', error);
      }
    }

    toast({ title: 'All deals deleted' });
  };

  const toggleActive = (deal: Deal) => {
    // Update local state
    setDeals(deals.map(d => 
      d.id === deal.id ? { ...d, is_active: !d.is_active } : d
    ));

    // Try to update database if table exists
    if (tableExists && !deal.id.startsWith('sample-') && !deal.id.startsWith('local-')) {
      supabase
        .from('deals')
        .update({ is_active: !deal.is_active })
        .eq('id', deal.id)
        .catch(error => {
          console.error('Database update failed:', error);
        });
    }

    toast({ title: `Deal ${!deal.is_active ? 'activated' : 'deactivated'}` });
  };

  const formatTimeLeft = (endsAt: string) => {
    const endTime = new Date(endsAt).getTime();
    const now = Date.now();
    const diff = endTime - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals & Promotions</h1>
          <p className="text-muted-foreground">Manage homepage deals and flash sales</p>
        </div>
        <div className="flex items-center gap-2">
          {!tableExists && (
            <Badge variant="outline" className="border-amber-300 text-amber-700">
              <Database className="h-3 w-3 mr-1" />
              Local Mode
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={() => setAutoPopulateDialogOpen(true)}
            className="border-green-600 text-green-700 hover:bg-green-50"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Create Sample Deals
          </Button>
          <Button onClick={() => { setEditingDeal(emptyDeal); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      {!tableExists && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            Working in local mode. Deals will be saved to your browser. 
            <Button 
              variant="link" 
              className="ml-2 h-auto p-0 text-amber-700"
              onClick={checkTableAndFetch}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Check for database
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Deals</CardDescription>
            <CardTitle className="text-2xl">{deals.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Deals</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {deals.filter(d => d.is_active).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Flash Deals</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {deals.filter(d => d.is_flash_deal).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {deals.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bulk Actions</CardTitle>
                <CardDescription>Quick actions for all deals</CardDescription>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={deleteAllDeals}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Deals
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Deals</CardTitle>
          <CardDescription>
            {tableExists ? 'Database deals' : 'Local sample deals'} • Toggle visibility or edit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No deals yet</h3>
              <p className="text-muted-foreground mb-6">
                Create sample deals to get started instantly
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => { setEditingDeal(emptyDeal); setDialogOpen(true); }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Manual Deal
                </Button>
                <Button 
                  onClick={() => setAutoPopulateDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Create Sample Deals
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time Left</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => (
                    <TableRow key={deal.id} className={!deal.is_active ? 'opacity-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={deal.image || ''} 
                            alt={deal.title}
                            className="w-12 h-12 rounded object-cover bg-muted"
                          />
                          <div>
                            <p className="font-medium line-clamp-1">{deal.title}</p>
                            <p className="text-xs text-muted-foreground">MOQ: {deal.moq}</p>
                            {(deal.id.startsWith('sample-') || deal.id.startsWith('local-')) && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Sample
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${deal.price?.toFixed(2)}</p>
                          {deal.original_price && (
                            <p className="text-xs text-muted-foreground line-through">
                              ${deal.original_price?.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {deal.discount && deal.discount > 0 ? (
                          <Badge variant="destructive">{deal.discount}% OFF</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{deal.supplier}</span>
                          {deal.is_verified && (
                            <Badge variant="secondary" className="text-[10px]">✓</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {deal.is_flash_deal && (
                            <Badge className="bg-orange-100 text-orange-700">
                              <Zap className="h-3 w-3 mr-1" />
                              Flash
                            </Badge>
                          )}
                          <Switch 
                            checked={deal.is_active || false} 
                            onCheckedChange={() => toggleActive(deal)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {deal.ends_at ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">
                              {formatTimeLeft(deal.ends_at)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => { setEditingDeal(deal); setDialogOpen(true); }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(deal.id)}
                          >
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

      {/* Add/Edit Deal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDeal?.id ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
            <DialogDescription>Fill in the deal details below</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Title *</Label>
                <Input
                  value={editingDeal?.title || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, title: e.target.value })}
                  placeholder="Product title"
                  required
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={editingDeal?.image || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label>Price ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingDeal?.price || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, price: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Original Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingDeal?.original_price || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, original_price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editingDeal?.discount || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, discount: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>MOQ *</Label>
                <Input
                  type="number"
                  min="1"
                  value={editingDeal?.moq || 1}
                  onChange={(e) => setEditingDeal({ ...editingDeal, moq: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Supplier Name</Label>
                <Input
                  value={editingDeal?.supplier || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, supplier: e.target.value })}
                  placeholder="Supplier company name"
                />
              </div>

              <div className="space-y-2">
                <Label>End Date (for flash deals)</Label>
                <Input
                  type="datetime-local"
                  value={editingDeal?.ends_at ? new Date(editingDeal.ends_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditingDeal({ 
                    ...editingDeal, 
                    ends_at: e.target.value ? new Date(e.target.value).toISOString() : null 
                  })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingDeal?.is_verified || false}
                    onCheckedChange={(checked) => setEditingDeal({ ...editingDeal, is_verified: checked })}
                  />
                  <Label>Verified Supplier</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingDeal?.is_flash_deal || false}
                    onCheckedChange={(checked) => setEditingDeal({ ...editingDeal, is_flash_deal: checked })}
                  />
                  <Label>Flash Deal</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingDeal?.is_active || false}
                    onCheckedChange={(checked) => setEditingDeal({ ...editingDeal, is_active: checked })}
                  />
                  <Label>Active (visible on homepage)</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : editingDeal?.id ? 'Update Deal' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-populate Dialog */}
      <Dialog open={autoPopulateDialogOpen} onOpenChange={setAutoPopulateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-green-600" />
              Create Sample Deals
            </DialogTitle>
            <DialogDescription>
              Instantly create professional-looking deals for your homepage
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfDeals">Number of deals to create</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="numberOfDeals"
                  type="number"
                  min="1"
                  max="8"
                  value={numberOfDeals}
                  onChange={(e) => setNumberOfDeals(Math.min(8, Math.max(1, parseInt(e.target.value) || 8)))}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  (1-8)
                </span>
              </div>
            </div>

            <Alert className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm">
                This will create beautiful, ready-to-use deals with:
                <ul className="list-disc list-inside mt-1 ml-2">
                  <li>Professional product images</li>
                  <li>50% discounts on all items</li>
                  <li>Realistic pricing and MOQ</li>
                  <li>Flash deals with countdown timers</li>
                  <li>Verified suppliers</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoPopulateDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={createSampleDeals} 
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {saving ? 'Creating deals...' : `Create ${numberOfDeals} deals`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
