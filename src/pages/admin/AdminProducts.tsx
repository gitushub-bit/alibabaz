import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CSVImport } from '@/components/admin/CSVImport';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  Download, 
  Upload, 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  published: boolean;
  verified: boolean;
  created_at: string;
  seller_id: string;
  price_min: number | null;
  price_max: number | null;
  images: string[] | null;
  inventory: number | null;
  sellerName?: string;
  ai_description?: string | null;
  ai_generated_at?: string | null;
  category?: string;
  tags?: string[];
  features?: string[];
  specifications?: Record<string, any>;
}

export default function AdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [productToPreview, setProductToPreview] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch seller names if you have a sellers table
      const enriched = await Promise.all((data || []).map(async (product) => {
        let sellerName = 'Unknown Seller';
        if (product.seller_id) {
          const { data: seller } = await supabase
            .from('sellers')
            .select('name')
            .eq('id', product.seller_id)
            .single();
          if (seller) {
            sellerName = seller.name;
          }
        }
        return {
          ...product,
          sellerName
        };
      }));

      setProducts(enriched);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load products: ' + error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.slug.toLowerCase().includes(search.toLowerCase()) ||
      product.sellerName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && product.published) ||
      (statusFilter === 'draft' && !product.published) ||
      (statusFilter === 'verified' && product.verified);

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleSaveProduct = async (updatedProduct: Partial<Product>) => {
    if (!selectedProduct) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update(updatedProduct)
        .eq('id', selectedProduct.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product updated successfully'
      });

      setEditDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update product: ' + error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ published: !product.published, updated_at: new Date().toISOString() })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Product ${!product.published ? 'published' : 'unpublished'} successfully`
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update status: ' + error.message,
        variant: 'destructive'
      });
    }
  };

  const toggleVerify = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ verified: !product.verified, updated_at: new Date().toISOString() })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Product ${!product.verified ? 'verified' : 'unverified'} successfully`
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update verification: ' + error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Product deleted successfully'
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete product: ' + error.message,
        variant: 'destructive'
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handlePreview = (product: Product) => {
    setProductToPreview(product);
    setPreviewDialogOpen(true);
  };

  const generateAI = async (product: Product) => {
    try {
      const { error } = await supabase.from('ai_generation_queue').insert({
        product_id: product.id,
        status: 'pending',
        prompt: `Generate product description for ${product.title}`,
        type: 'description'
      });

      if (error) throw error;

      toast({
        title: 'Queued',
        description: 'AI generation queued successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to queue AI generation: ' + error.message,
        variant: 'destructive'
      });
    }
  };

  const bulkPublish = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ published: true, updated_at: new Date().toISOString() })
        .in('id', selectedIds);

      if (error) throw error;

      toast({
        title: 'Bulk Updated',
        description: 'Selected products published'
      });

      setSelectedIds([]);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to bulk publish: ' + error.message,
        variant: 'destructive'
      });
    }
  };

  const bulkUnpublish = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ published: false, updated_at: new Date().toISOString() })
        .in('id', selectedIds);

      if (error) throw error;

      toast({
        title: 'Bulk Updated',
        description: 'Selected products unpublished'
      });

      setSelectedIds([]);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to bulk unpublish: ' + error.message,
        variant: 'destructive'
      });
    }
  };

  const bulkDelete = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      toast({
        title: 'Bulk Deleted',
        description: 'Selected products deleted'
      });

      setSelectedIds([]);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to bulk delete: ' + error.message,
        variant: 'destructive'
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const exportProductsCSV = () => {
    const headers = [
      'id', 'title', 'slug', 'description', 'price_min', 'price_max', 
      'inventory', 'published', 'verified', 'category', 'seller_id'
    ];
    
    const csvContent = [
      headers.join(','),
      ...products.map(p => [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.slug,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        p.price_min || '',
        p.price_max || '',
        p.inventory || 0,
        p.published,
        p.verified,
        p.category || '',
        p.seller_id
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVImport = async (data: Record<string, string>[]) => {
    let success = 0;
    let updated = 0;
    const errors: string[] = [];

    try {
      const { data: existingProducts } = await supabase.from('products').select('id, slug');
      const slugToIdMap = new Map<string, string>();

      for (const p of existingProducts || []) {
        slugToIdMap.set(p.slug, p.id);
      }

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          const slug = row.slug || row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const existingProductId = slugToIdMap.get(slug);

          const productData = {
            title: row.title,
            slug,
            description: row.description || null,
            price_min: row.price_min ? parseFloat(row.price_min) : null,
            price_max: row.price_max ? parseFloat(row.price_max) : null,
            inventory: row.inventory ? parseInt(row.inventory) : 0,
            published: row.published?.toLowerCase() === 'true',
            verified: row.verified?.toLowerCase() === 'true',
            category: row.category || null,
            seller_id: user?.id || '',
            updated_at: new Date().toISOString()
          };

          if (existingProductId) {
            const { error } = await supabase
              .from('products')
              .update(productData)
              .eq('id', existingProductId);

            if (error) throw error;
            updated++;
          } else {
            const { data: insertedData, error } = await supabase
              .from('products')
              .insert(productData)
              .select();

            if (error) throw error;

            const productId = insertedData![0].id;

            // Add to image queue if image_url provided
            if (row.image_url) {
              await supabase.from('image_queue').insert({
                product_id: productId,
                source_url: row.image_url,
                status: 'pending'
              });
            }

            // Add to AI generation queue
            await supabase.from('ai_generation_queue').insert({
              product_id: productId,
              status: 'pending',
              prompt: `Generate product description for ${row.title}`,
              type: 'description'
            });

            success++;
          }
        } catch (err: any) {
          errors.push(`Row ${i + 2}: ${err.message || 'Unknown error'}`);
        }
      }

      if (success > 0 || updated > 0) {
        fetchProducts();
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${success} new products and updated ${updated} existing products`
        });
      }

      return { success: success + updated, errors };
    } catch (error: any) {
      toast({
        title: 'Import Error',
        description: 'Failed to process CSV import',
        variant: 'destructive'
      });
      return { success: 0, errors: [error.message] };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">
            Review, verify, and manage all products
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={exportProductsCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => setCsvImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" /> Import CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <Button 
              onClick={bulkPublish} 
              variant="outline" 
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" /> Publish Selected
            </Button>
            <Button 
              onClick={bulkUnpublish} 
              variant="outline" 
              size="sm"
            >
              <EyeOff className="w-4 h-4 mr-2" /> Unpublish Selected
            </Button>
            <Button
              variant="destructive"
              onClick={bulkDelete}
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSelectedIds([])}
              size="sm"
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Products</CardDescription>
            <CardTitle className="text-2xl">{products.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {products.filter(p => p.published).length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-2xl text-amber-600">
              {products.filter(p => !p.published).length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verified</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {products.filter(p => p.verified).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.title}</span>
                        <span className="text-sm text-muted-foreground">{product.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.sellerName}</TableCell>
                    <TableCell>
                      {product.price_min && product.price_max ? (
                        `$${product.price_min} - $${product.price_max}`
                      ) : product.price_min ? (
                        `$${product.price_min}`
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={product.published ? "default" : "secondary"}>
                          {product.published ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" /> Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" /> Draft
                            </>
                          )}
                        </Badge>
                        {product.verified && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            <CheckCircle className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.inventory && product.inventory > 0 ? "default" : "destructive"}>
                        {product.inventory ?? 0} in stock
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(product.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handlePreview(product)}>
                            <Eye className="w-4 h-4 mr-2" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublish(product)}>
                            {product.published ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" /> Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" /> Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleVerify(product)}>
                            {product.verified ? (
                              <>
                                <XCircle className="w-4 h-4 mr-2" /> Unverify
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" /> Verify
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => generateAI(product)}>
                            <Package className="w-4 h-4 mr-2" /> Generate AI
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(product.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
                <TabsTrigger value="media">Media & SEO</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    defaultValue={selectedProduct.title}
                    onChange={(e) => setSelectedProduct({
                      ...selectedProduct,
                      title: e.target.value
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    defaultValue={selectedProduct.slug}
                    onChange={(e) => setSelectedProduct({
                      ...selectedProduct,
                      slug: e.target.value
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    defaultValue={selectedProduct.description || ''}
                    rows={4}
                    onChange={(e) => setSelectedProduct({
                      ...selectedProduct,
                      description: e.target.value
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    defaultValue={selectedProduct.category || ''}
                    onChange={(e) => setSelectedProduct({
                      ...selectedProduct,
                      category: e.target.value
                    })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_min">Minimum Price</Label>
                    <Input
                      id="price_min"
                      type="number"
                      step="0.01"
                      defaultValue={selectedProduct.price_min || ''}
                      onChange={(e) => setSelectedProduct({
                        ...selectedProduct,
                        price_min: e.target.value ? parseFloat(e.target.value) : null
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_max">Maximum Price</Label>
                    <Input
                      id="price_max"
                      type="number"
                      step="0.01"
                      defaultValue={selectedProduct.price_max || ''}
                      onChange={(e) => setSelectedProduct({
                        ...selectedProduct,
                        price_max: e.target.value ? parseFloat(e.target.value) : null
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventory">Inventory Quantity</Label>
                  <Input
                    id="inventory"
                    type="number"
                    defaultValue={selectedProduct.inventory || 0}
                    onChange={(e) => setSelectedProduct({
                      ...selectedProduct,
                      inventory: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>AI Description</Label>
                  <Textarea
                    value={selectedProduct.ai_description || ''}
                    rows={3}
                    readOnly
                    className="bg-muted"
                  />
                  <Button 
                    onClick={() => generateAI(selectedProduct)} 
                    size="sm"
                    variant="outline"
                  >
                    Regenerate AI Description
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Images</Label>
                  <div className="border rounded-md p-4">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {selectedProduct.images.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={img}
                              alt={`Product image ${index + 1}`}
                              className="rounded-md w-full h-24 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No images available</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Published</Label>
                      <p className="text-sm text-muted-foreground">
                        Make product visible to customers
                      </p>
                    </div>
                    <Switch
                      checked={selectedProduct.published}
                      onCheckedChange={(checked) => setSelectedProduct({
                        ...selectedProduct,
                        published: checked
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Verified</Label>
                      <p className="text-sm text-muted-foreground">
                        Mark product as verified by admin
                      </p>
                    </div>
                    <Switch
                      checked={selectedProduct.verified}
                      onCheckedChange={(checked) => setSelectedProduct({
                        ...selectedProduct,
                        verified: checked
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Product ID</Label>
                  <Input value={selectedProduct.id} readOnly className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label>Created At</Label>
                  <Input 
                    value={format(new Date(selectedProduct.created_at), 'PPpp')} 
                    readOnly 
                    className="bg-muted" 
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSaveProduct(selectedProduct!)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Product Preview</DialogTitle>
          </DialogHeader>
          {productToPreview && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{productToPreview.title}</h3>
                  <p className="text-muted-foreground">{productToPreview.slug}</p>
                </div>
                <Badge variant={productToPreview.published ? "default" : "secondary"}>
                  {productToPreview.published ? 'Published' : 'Draft'}
                </Badge>
              </div>

              {productToPreview.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{productToPreview.description}</p>
                </div>
              )}

              {productToPreview.ai_description && (
                <div>
                  <h4 className="font-medium mb-2">AI Generated Description</h4>
                  <p className="text-muted-foreground">{productToPreview.ai_description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Price Range</h4>
                  <p>
                    {productToPreview.price_min && productToPreview.price_max 
                      ? `$${productToPreview.price_min} - $${productToPreview.price_max}`
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Inventory</h4>
                  <p>{productToPreview.inventory ?? 0} units</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Seller</h4>
                <p>{productToPreview.sellerName}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CSVImport
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        type="products"
        requiredColumns={['title']}
        optionalColumns={[
          'slug', 
          'description', 
          'price_min', 
          'price_max', 
          'inventory', 
          'published', 
          'verified', 
          'image_url',
          'category'
        ]}
        onImport={handleCSVImport}
      />
    </div>
  );
}import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CSVImport } from '@/components/admin/CSVImport';
import AdminProductForm from '@/pages/admin/AdminProductForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Download, Upload, Package } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  verified: boolean;
  created_at: string;
  seller_id: string;
  price_min: number | null;
  price_max: number | null;
  images: string[] | null;
  inventory: number | null;
  sellerName?: string;
  ai_description?: string | null;
  ai_generated_at?: string | null;
}

export default function AdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }

    const enriched = (data || []).map((product: any) => ({
      ...product,
      sellerName: 'Unknown Seller'
    }));

    setProducts(enriched);
    setLoading(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && product.published) ||
      (statusFilter === 'draft' && !product.published) ||
      (statusFilter === 'verified' && product.verified);

    return matchesSearch && matchesStatus;
  });

  const togglePublish = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ published: !product.published })
      .eq('id', product.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Updated',
      description: 'Product status updated successfully'
    });

    fetchProducts();
  };

  const generateAI = async (product: Product) => {
    const { error } = await supabase.from('ai_generation_queue').insert({
      product_id: product.id,
      status: 'pending',
      prompt: `Generate product description for ${product.title}`
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to queue AI generation',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Queued',
      description: 'AI generation queued successfully'
    });
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Deleted',
      description: 'Product deleted successfully'
    });

    fetchProducts();
  };

  const bulkPublish = async () => {
    const { error } = await supabase
      .from('products')
      .update({ published: true })
      .in('id', selectedIds);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to bulk publish',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Bulk Updated',
      description: 'Selected products published'
    });

    setSelectedIds([]);
    fetchProducts();
  };

  const bulkUnpublish = async () => {
    const { error } = await supabase
      .from('products')
      .update({ published: false })
      .in('id', selectedIds);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to bulk unpublish',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Bulk Updated',
      description: 'Selected products unpublished'
    });

    setSelectedIds([]);
    fetchProducts();
  };

  const bulkDelete = async () => {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', selectedIds);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to bulk delete',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Bulk Deleted',
      description: 'Selected products deleted'
    });

    setSelectedIds([]);
    fetchProducts();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const exportProductsCSV = () => {
    const headers = ['title', 'slug', 'description', 'price_min', 'price_max', 'inventory', 'published', 'verified'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => [
        `"${p.title.replace(/"/g, '""')}"`,
        p.slug,
        '""',
        p.price_min || '',
        p.price_max || '',
        p.inventory || '',
        p.published,
        p.verified
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVImport = async (data: Record<string, string>[]) => {
    let success = 0;
    let updated = 0;
    const errors: string[] = [];

    const { data: existingProducts } = await supabase.from('products').select('id, slug');
    const slugToIdMap = new Map<string, string>();

    for (const p of existingProducts || []) {
      slugToIdMap.set(p.slug, p.id);
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const slug = row.slug || row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const existingProductId = slugToIdMap.get(slug);

        const productData = {
          title: row.title,
          slug,
          description: row.description || null,
          price_min: row.price_min ? parseFloat(row.price_min) : null,
          price_max: row.price_max ? parseFloat(row.price_max) : null,
          inventory: row.inventory ? parseInt(row.inventory) : 0,
          published: row.published?.toLowerCase() === 'true',
          verified: row.verified?.toLowerCase() === 'true',
          seller_id: user?.id || ''
        };

        if (existingProductId) {
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', existingProductId);

          if (error) throw error;
          updated++;
        } else {
          const { data: insertedData, error } = await supabase
            .from('products')
            .insert(productData)
            .select();

          if (error) throw error;

          const productId = insertedData![0].id;

          // ⚠️ FIXED: insert correct column name "source_url"
          const { error: imgErr } = await supabase.from('image_queue').insert({
            product_id: productId,
            source_url: row.image_url || '',
            status: 'pending'
          });

          if (imgErr) throw imgErr;

          const { error: aiErr } = await supabase.from('ai_generation_queue').insert({
            product_id: productId,
            status: 'pending',
            prompt: `Generate product description for ${row.title}`
          });

          if (aiErr) throw aiErr;

          success++;
        }
      } catch (err: any) {
        errors.push(`Row ${i + 2}: ${err.message || 'Unknown error'}`);
      }
    }

    if (success > 0 || updated > 0) {
      fetchProducts();
    }

    return { success: success + updated, errors };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">
            Review, verify, and manage all products
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={exportProductsCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => setCsvImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" /> Import CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={bulkPublish} disabled={selectedIds.length === 0}>
            Bulk Publish
          </Button>
          <Button onClick={bulkUnpublish} disabled={selectedIds.length === 0}>
            Bulk Unpublish
          </Button>
          <Button
            variant="destructive"
            onClick={bulkDelete}
            disabled={selectedIds.length === 0}
          >
            Bulk Delete
          </Button>
        </div>
      </div>

      <AdminProductForm onComplete={fetchProducts} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{products.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {products.filter(p => p.published).length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-2xl text-gray-600">
              {products.filter(p => !p.published).length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verified</CardDescription>
            <CardTitle className="text-2xl text-amber-600">
              {products.filter(p => p.verified).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <Skeleton className="h-32" />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>AI</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </TableCell>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>{product.sellerName}</TableCell>
                    <TableCell>
                      <Badge>
                        {product.published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.inventory ?? 0}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => generateAI(product)}
                      >
                        Generate AI
                      </Button>
                    </TableCell>
                    <TableCell>
                      {format(new Date(product.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => togglePublish(product)}
                      >
                        Change Status
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => setEditProduct(product)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editProduct && (
        <AdminProductForm
          product={editProduct}
          onComplete={() => {
            setEditProduct(null);
            fetchProducts();
          }}
        />
      )}

      <CSVImport
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        type="products"
        requiredColumns={['title']}
        optionalColumns={['slug', 'description', 'price_min', 'price_max', 'inventory', 'published', 'verified', 'image_url']}
        onImport={handleCSVImport}
      />
    </div>
  );
}
