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
  RefreshCw,
  AlertCircle,
  Package,
  Wand2,
  Filter
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
  product_id: string;
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
  product_id: '',
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

export default function AdminDeals() {
  const { isSuperAdmin } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoPopulateDialogOpen, setAutoPopulateDialogOpen] = useState(false);
  const [numberOfDeals, setNumberOfDeals] = useState(20);
  const [editingDeal, setEditingDeal] = useState<Partial<Deal> | null>(null);
  const [showSampleAlert, setShowSampleAlert] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    const { data } = await supabase
      .from('deals')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data) {
      setDeals(data);
    }
    setLoading(false);
  };

  const autoPopulateDeals = async () => {
    try {
      setSaving(true);
      toast({ title: 'Auto-populating deals from products...' });

      // First, clear all existing deals
      await supabase.from('deals').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Fetch random products
      const { data: products } = await supabase
        .from('products')
        .select(`
          id,
          title,
          images,
          price_min,
          price_max,
          original_price,
          discount,
          moq,
          seller_id,
          categories!inner(name),
          suppliers!inner(company_name, verified, response_rate)
        `)
        .eq('published', true)
        .limit(numberOfDeals)
        .order('RANDOM()');

      if (!products || products.length === 0) {
        toast({ title: 'No products found to create deals from', variant: 'destructive' });
        return;
      }

      // Prepare deals to insert
      const dealsToInsert = products.map((product, index) => {
        const randomDiscount = Math.floor(Math.random() * 50) + 10; // 10-60% discount
        const isFlashDeal = Math.random() > 0.5; // 50% chance of being flash deal
        const endsAt = isFlashDeal 
          ? new Date(Date.now() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000).toISOString()
          : null;

        // Calculate deal price (apply discount)
        const basePrice = product.price_min || 0;
        const originalPrice = product.original_price || basePrice * 1.3; // Add 30% if no original price
        const dealPrice = basePrice * (1 - randomDiscount / 100);

        return {
          product_id: product.id,
          title: product.title,
          image: product.images?.[0] || null,
          price: parseFloat(dealPrice.toFixed(2)),
          original_price: parseFloat(originalPrice.toFixed(2)),
          discount: randomDiscount,
          moq: product.moq || Math.floor(Math.random() * 100) + 1,
          supplier: product.suppliers?.company_name || 'Verified Supplier',
          is_verified: product.suppliers?.verified || false,
          is_flash_deal: isFlashDeal,
          is_active: true,
          sort_order: index,
          ends_at: endsAt,
        };
      });

      // Insert all deals
      const { error } = await supabase
        .from('deals')
        .insert(dealsToInsert);

      if (error) throw error;

      toast({ title: `Created ${dealsToInsert.length} deals from products!` });
      fetchDeals();
      setAutoPopulateDialogOpen(false);
    } catch (error: any) {
      toast({ 
        title: 'Error auto-populating deals', 
        description: error.message,
        variant: 'destructive' 
      });
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
          })
          .eq('id', editingDeal.id);

        if (error) throw error;
        toast({ title: 'Deal updated successfully' });
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
          }]);

        if (error) throw error;
        toast({ title: 'Deal created successfully' });
      }

      fetchDeals();
      setDialogOpen(false);
      setEditingDeal(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting deal', variant: 'destructive' });
    } else {
      setDeals(deals.filter(d => d.id !== id));
      toast({ title: 'Deal deleted' });
    }
  };

  const toggleActive = async (deal: Deal) => {
    const { error } = await supabase
      .from('deals')
      .update({ is_active: !deal.is_active })
      .eq('id', deal.id);

    if (error) {
      toast({ title: 'Error updating deal', variant: 'destructive' });
    } else {
      setDeals(deals.map(d => 
        d.id === deal.id ? { ...d, is_active: !d.is_active } : d
      ));
    }
  };

  const deleteAllDeals = async () => {
    if (!confirm('Are you sure you want to delete ALL deals? This cannot be undone.')) return;

    const { error } = await supabase
      .from('deals')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      toast({ title: 'Error deleting deals', variant: 'destructive' });
    } else {
      setDeals([]);
      toast({ title: 'All deals deleted' });
    }
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
          <Button 
            variant="outline" 
            onClick={() => setAutoPopulateDialogOpen(true)}
            className="border-green-600 text-green-700 hover:bg-green-50"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Auto-populate from Products
          </Button>
          <Button onClick={() => { setEditingDeal(emptyDeal); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

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
          <CardDescription>Drag to reorder, toggle visibility, or edit details</CardDescription>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No deals yet</h3>
              <p className="text-muted-foreground mb-6">
                Create deals manually or auto-populate from existing products
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
                  Auto-populate from Products
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => (
                    <TableRow key={deal.id} className={!deal.is_active ? 'opacity-50' : ''}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      </TableCell>
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
                            {deal.product_id && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Linked Product
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
                        {deal.discount && (
                          <Badge variant="destructive">{deal.discount}% OFF</Badge>
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

      {/* Add Deal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDeal?.id ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
            <DialogDescription>Fill in the deal details below</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingDeal?.title || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, title: e.target.value })}
                  placeholder="Product title"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={editingDeal?.image || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={editingDeal?.price || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Original Price ($)</Label>
                <Input
                  type="number"
                  value={editingDeal?.original_price || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, original_price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  value={editingDeal?.discount || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, discount: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>MOQ</Label>
                <Input
                  type="number"
                  value={editingDeal?.moq || 1}
                  onChange={(e) => setEditingDeal({ ...editingDeal, moq: parseInt(e.target.value) })}
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

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingDeal?.is_verified || false}
                    onCheckedChange={(checked) => setEditingDeal({ ...editingDeal, is_verified: checked })}
                  />
                  <Label>Verified Supplier</Label>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingDeal?.is_flash_deal || false}
                    onCheckedChange={(checked) => setEditingDeal({ ...editingDeal, is_flash_deal: checked })}
                  />
                  <Label>Flash Deal</Label>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-4">
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
              {saving ? 'Saving...' : 'Save Deal'}
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
              Auto-populate Deals from Products
            </DialogTitle>
            <DialogDescription>
              This will create deals from your existing products. Existing deals will be deleted.
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
                  max="100"
                  value={numberOfDeals}
                  onChange={(e) => setNumberOfDeals(parseInt(e.target.value) || 20)}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  (max: 100)
                </span>
              </div>
            </div>

            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                This will delete all existing deals and create new ones from random products.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoPopulateDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={autoPopulateDeals} 
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
