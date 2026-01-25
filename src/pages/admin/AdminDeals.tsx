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
  Search,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  images: string[] | null;
  price_min: number | null;
  price_max: number | null;
  original_price: number | null;
  discount: number | null;
  moq: number | null;
  seller_id: string;
  slug: string;
  published: boolean;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Partial<Deal> | null>(null);
  const [showSampleAlert, setShowSampleAlert] = useState(false);

  useEffect(() => {
    fetchDeals();
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search term
    const filtered = products.filter(product => 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, images, price_min, price_max, original_price, discount, moq, seller_id, slug, published')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error loading products',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const checkAndCreateDealsTable = async () => {
    try {
      // Check if deals table exists by trying to query it
      const { error } = await supabase
        .from('deals')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        // Table doesn't exist, create it
        toast({ title: 'Creating deals table...' });
        
        // Create table with proper structure
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS deals (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            product_id UUID REFERENCES products(id),
            title TEXT NOT NULL,
            image TEXT,
            price DECIMAL(10,2),
            original_price DECIMAL(10,2),
            discount INTEGER,
            moq INTEGER,
            supplier TEXT,
            is_verified BOOLEAN DEFAULT false,
            is_flash_deal BOOLEAN DEFAULT false,
            is_active BOOLEAN DEFAULT true,
            sort_order INTEGER DEFAULT 0,
            ends_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        
        // Note: In production, you'd need to run this SQL in Supabase SQL editor
        console.log('Please run this SQL in Supabase SQL editor:');
        console.log(createTableSQL);
        
        toast({
          title: 'Table creation required',
          description: 'Please create the deals table using the SQL above',
          variant: 'destructive'
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking table:', error);
      return false;
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      
      // Check if table exists first
      const tableExists = await checkAndCreateDealsTable();
      
      if (!tableExists) {
        return;
      }

      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setDeals(data);
        setShowSampleAlert(false);
      } else {
        // No deals found
        setShowSampleAlert(true);
        setDeals([]);
      }
    } catch (error: any) {
      console.error('Error fetching deals:', error);
      toast({ 
        title: 'Error loading deals', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const createDealFromProduct = async (product: Product) => {
    try {
      // Get supplier info for the product
      const { data: supplierData } = await supabase
        .from('suppliers')
        .select('company_name, verified')
        .eq('user_id', product.seller_id)
        .single();

      // Get product images
      const productImage = product.images?.[0] || '';

      const newDeal = {
        product_id: product.id,
        title: product.title,
        image: productImage,
        price: product.price_min,
        original_price: product.original_price,
        discount: product.discount,
        moq: product.moq,
        supplier: supplierData?.company_name || 'Verified Supplier',
        is_verified: supplierData?.verified || false,
        is_flash_deal: true,
        is_active: true,
        sort_order: deals.length,
        ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { error } = await supabase
        .from('deals')
        .insert([newDeal]);

      if (error) throw error;

      toast({ title: 'Deal created from product!' });
      fetchDeals();
      setDialogOpen(false);
    } catch (error: any) {
      toast({ 
        title: 'Error creating deal', 
        description: error.message,
        variant: 'destructive' 
      });
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
        // Create new deal (from selected product)
        const { error } = await supabase
          .from('deals')
          .insert([{
            product_id: editingDeal.product_id,
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
      toast({ title: 'Error deleting deal', description: error.message, variant: 'destructive' });
    } else {
      setDeals(deals.filter(d => d.id !== id));
      toast({ title: 'Deal deleted successfully' });
    }
  };

  const toggleActive = async (deal: Deal) => {
    const { error } = await supabase
      .from('deals')
      .update({ is_active: !deal.is_active })
      .eq('id', deal.id);

    if (error) {
      toast({ title: 'Error updating deal', description: error.message, variant: 'destructive' });
    } else {
      setDeals(deals.map(d => 
        d.id === deal.id ? { ...d, is_active: !d.is_active } : d
      ));
      toast({ title: `Deal ${!deal.is_active ? 'activated' : 'deactivated'}` });
    }
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) return;

    // Auto-populate deal form from product
    setEditingDeal({
      ...emptyDeal,
      product_id: selectedProduct.id,
      title: selectedProduct.title,
      image: selectedProduct.images?.[0] || '',
      price: selectedProduct.price_min,
      original_price: selectedProduct.original_price,
      discount: selectedProduct.discount || 0,
      moq: selectedProduct.moq || 1,
    });
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
      {showSampleAlert && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between">
            <span>No deals found. Create deals from your existing products.</span>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals & Promotions</h1>
          <p className="text-muted-foreground">Create deals from existing products to feature on homepage</p>
        </div>
        <Button onClick={() => { setEditingDeal(emptyDeal); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Deal from Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardDescription>Total Products</CardDescription>
            <CardTitle className="text-2xl">{products.length}</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Current Deals</CardTitle>
          <CardDescription>Deals featured on homepage - click to edit details</CardDescription>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No deals created yet</h3>
              <p className="text-muted-foreground mb-4">
                Create deals from your existing products to feature them on the homepage
              </p>
              <Button onClick={() => { setEditingDeal(emptyDeal); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Deal
              </Button>
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
                    <TableHead>Ends At</TableHead>
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
                                Linked to Product
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${deal.price?.toFixed(2)}</p>
                          {deal.original_price && deal.original_price > (deal.price || 0) && (
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
                          <div className="text-sm">
                            {new Date(deal.ends_at).toLocaleDateString()}
                            <div className="text-xs text-muted-foreground">
                              {new Date(deal.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDeal?.id ? 'Edit Deal' : 'Create New Deal'}</DialogTitle>
            <DialogDescription>
              {editingDeal?.id ? 'Update deal details' : 'Select a product and configure deal settings'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!editingDeal?.id && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No products found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredProducts.slice(0, 10).map((product) => (
                        <button
                          key={product.id}
                          className="w-full p-4 text-left hover:bg-muted transition-colors flex items-center gap-3"
                          onClick={() => handleProductSelect(product.id)}
                        >
                          <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                            {product.images?.[0] ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 mx-auto mt-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.title}</p>
                            <p className="text-sm text-muted-foreground">
                              ${product.price_min?.toFixed(2)} • MOQ: {product.moq}
                            </p>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0">
                            Select
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={editingDeal?.title || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, title: e.target.value })}
                  placeholder="Enter product title"
                  disabled={!editingDeal?.product_id && !editingDeal?.id}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={editingDeal?.image || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Deal Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editingDeal?.price || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price ($)</Label>
                <Input
                  id="original_price"
                  type="number"
                  step="0.01"
                  value={editingDeal?.original_price || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, original_price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={editingDeal?.discount || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, discount: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moq">MOQ *</Label>
                <Input
                  id="moq"
                  type="number"
                  min="1"
                  value={editingDeal?.moq || 1}
                  onChange={(e) => setEditingDeal({ ...editingDeal, moq: parseInt(e.target.value) })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="supplier">Supplier Name</Label>
                <Input
                  id="supplier"
                  value={editingDeal?.supplier || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, supplier: e.target.value })}
                  placeholder="Supplier company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ends_at">Deal End Date</Label>
                <Input
                  id="ends_at"
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
                    id="is_verified"
                    checked={editingDeal?.is_verified || false}
                    onCheckedChange={(checked) => setEditingDeal({ ...editingDeal, is_verified: checked })}
                  />
                  <Label htmlFor="is_verified">Verified Supplier</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_flash_deal"
                    checked={editingDeal?.is_flash_deal || false}
                    onCheckedChange={(checked) => setEditingDeal({ ...editingDeal, is_flash_deal: checked })}
                  />
                  <Label htmlFor="is_flash_deal">Flash Deal</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={editingDeal?.is_active || false}
                    onCheckedChange={(checked) => setEditingDeal({ ...editingDeal, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active (show on homepage)</Label>
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
    </div>
  );
}
