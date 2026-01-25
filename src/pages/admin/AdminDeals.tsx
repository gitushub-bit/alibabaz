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
  Clock
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
  product_id?: string;
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

// Sample products for fallback
const SAMPLE_PRODUCTS = [
  {
    title: "Wireless Bluetooth Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    price: 29.99,
    supplier: "Shenzhen Electronics Co.",
  },
  {
    title: "Organic Cotton T-Shirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    price: 8.50,
    supplier: "Guangzhou Textiles Ltd.",
  },
  {
    title: "Stainless Steel Water Bottles",
    image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop",
    price: 6.80,
    supplier: "Dongguan Manufacturing",
  },
  {
    title: "LED Desk Lamp with USB",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop",
    price: 14.99,
    supplier: "Foshan Lighting",
  },
  {
    title: "Portable Power Bank 20000mAh",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop",
    price: 22.50,
    supplier: "Shenzhen Tech Solutions",
  },
  {
    title: "Yoga Mat Non-Slip",
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop",
    price: 9.99,
    supplier: "Hangzhou Sports Goods",
  },
  {
    title: "Wireless Charging Pad",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=400&fit=crop",
    price: 12.80,
    supplier: "Ningbo Electronics",
  },
  {
    title: "Insulated Lunch Bag",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    price: 4.99,
    supplier: "Wenzhou Packaging",
  },
];

export default function AdminDeals() {
  const { isSuperAdmin } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoPopulateDialogOpen, setAutoPopulateDialogOpen] = useState(false);
  const [numberOfDeals, setNumberOfDeals] = useState(20);
  const [editingDeal, setEditingDeal] = useState<Partial<Deal> | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching deals:', error);
        // If table doesn't exist, show empty state
        setDeals([]);
        return;
      }

      setDeals(data || []);
    } catch (error) {
      console.error('Error:', error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const autoPopulateDeals = async () => {
    try {
      setSaving(true);
      setUsingFallback(false);
      
      // First check if we have any products in the database
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title, images, price_min, discount, moq, seller_id')
        .eq('published', true)
        .limit(numberOfDeals);

      let dealsToInsert;

      if (productsError || !products || products.length === 0) {
        // Use fallback sample products
        setUsingFallback(true);
        toast({ 
          title: 'No products found, creating sample deals',
          description: 'Create products first for more realistic deals'
        });
        
        dealsToInsert = SAMPLE_PRODUCTS.map((product, index) => {
          const randomDiscount = Math.floor(Math.random() * 50) + 10;
          const isFlashDeal = Math.random() > 0.5;
          
          return {
            title: product.title,
            image: product.image,
            price: product.price,
            original_price: product.price * (1 + randomDiscount/100),
            discount: randomDiscount,
            moq: Math.floor(Math.random() * 100) + 1,
            supplier: product.supplier,
            is_verified: true,
            is_flash_deal: isFlashDeal,
            is_active: true,
            sort_order: index,
            ends_at: isFlashDeal 
              ? new Date(Date.now() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000).toISOString()
              : null,
          };
        });
      } else {
        // Use real products from database
        toast({ title: 'Creating deals from your products...' });
        
        dealsToInsert = await Promise.all(
          products.map(async (product, index) => {
            // Try to get supplier info
            let supplierName = 'Verified Supplier';
            let isVerified = false;
            
            try {
              const { data: supplier } = await supabase
                .from('suppliers')
                .select('company_name, verified')
                .eq('user_id', product.seller_id)
                .single();
              
              if (supplier) {
                supplierName = supplier.company_name || 'Verified Supplier';
                isVerified = supplier.verified || false;
              }
            } catch (error) {
              // Fallback to profile
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('full_name, company_name')
                  .eq('user_id', product.seller_id)
                  .single();
                
                if (profile) {
                  supplierName = profile.company_name || profile.full_name || 'Verified Supplier';
                }
              } catch (error) {
                // Use default supplier name
              }
            }

            const randomDiscount = Math.floor(Math.random() * 50) + 10;
            const isFlashDeal = Math.random() > 0.5;
            const basePrice = product.price_min || 10 + Math.random() * 100;
            const originalPrice = basePrice * (1.2 + Math.random() * 0.3);
            const dealPrice = basePrice * (1 - randomDiscount / 100);

            return {
              product_id: product.id,
              title: product.title,
              image: product.images?.[0] || SAMPLE_PRODUCTS[index % SAMPLE_PRODUCTS.length].image,
              price: parseFloat(dealPrice.toFixed(2)),
              original_price: parseFloat(originalPrice.toFixed(2)),
              discount: randomDiscount,
              moq: product.moq || Math.floor(Math.random() * 100) + 1,
              supplier: supplierName,
              is_verified: isVerified,
              is_flash_deal: isFlashDeal,
              is_active: true,
              sort_order: index,
              ends_at: isFlashDeal 
                ? new Date(Date.now() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000).toISOString()
                : null,
            };
          })
        );
      }

      // First, delete all existing deals
      await supabase.from('deals').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert new deals
      const { error: insertError } = await supabase
        .from('deals')
        .insert(dealsToInsert);

      if (insertError) throw insertError;

      toast({ 
        title: `✅ Created ${dealsToInsert.length} deals!`,
        description: usingFallback 
          ? 'Sample deals created. Add real products for better results.'
          : 'Deals created from your products.'
      });

      fetchDeals();
      setAutoPopulateDialogOpen(false);
    } catch (error: any) {
      console.error('Error auto-populating deals:', error);
      toast({ 
        title: 'Error creating deals', 
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
        // Update existing deal
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
        toast({ title: 'Deal updated successfully' });
      } else {
        // Create new deal
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
      toast({ title: 'Deal deleted successfully' });
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
      toast({ title: `Deal ${!deal.is_active ? 'activated' : 'deactivated'}` });
    }
  };

  const formatTimeLeft = (endsAt: string) => {
    const endTime = new Date(endsAt).getTime();
    const now = Date.now();
    const diff = endTime - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
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
            Auto-populate Deals
          </Button>
          <Button onClick={() => { setEditingDeal(emptyDeal); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      {usingFallback && deals.length > 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            Showing sample deals. Add real products to create deals from your inventory.
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
          <CardDescription>Toggle visibility, edit details, or delete</CardDescription>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No deals yet</h3>
              <p className="text-muted-foreground mb-6">
                Create deals manually or auto-populate from products
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
                  Auto-populate Deals
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
              Auto-populate Deals
            </DialogTitle>
            <DialogDescription>
              Create multiple deals automatically from your products
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
                  max="50"
                  value={numberOfDeals}
                  onChange={(e) => setNumberOfDeals(Math.min(50, Math.max(1, parseInt(e.target.value) || 20)))}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  (1-50)
                </span>
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                This will: 
                <ul className="list-disc list-inside mt-1 ml-2">
                  <li>Delete all existing deals</li>
                  <li>Try to use your real products first</li>
                  <li>Fall back to sample deals if no products found</li>
                  <li>Apply random discounts (10-60%)</li>
                  <li>Randomly create flash deals with countdowns</li>
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
