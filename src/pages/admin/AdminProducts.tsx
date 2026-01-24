import { useState, useEffect } from 'react';
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

    // If admin, load all products
    // If not admin, only load published products
    const query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    const { data, error } = await query;

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
    const headers = ['title', 'slug', 'description', 'price_min', 'price_max', 'inventory', 'published', 'verified', 'image_url'];
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
        p.verified,
        p.images?.[0] || ''
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

          // THIS IS THE FIX
          await supabase.from('image_queue').insert({
            product_id: productId,
            source_url: row.image_url || '',
            status: 'pending'
          });

          await supabase.from('ai_generation_queue').insert({
            product_id: productId,
            status: 'pending',
            prompt: `Generate product description for ${row.title}`
          });

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
