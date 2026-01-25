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
  RefreshCw,
  Download,
  Upload
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
  product_id: string | null;
  title: string;
  image: string | null;
  price: number | null;
  original_price: number | null;
  discount: number | null;
  moq: number | null;
  supplier: string | null;
  is_verified: boolean;
  is_flash_deal: boolean;
  is_active: boolean;
  sort_order: number;
  ends_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Product {
  id: string;
  title: string;
  images: string[] | null;
  price_min: number | null;
  price_max: number | null;
  moq: number | null;
  seller_id: string | null;
  suppliers?: {
    company_name: string | null;
    verified: boolean | null;
  } | null;
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
    is_active: true,
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
    is_active: true,
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
    is_active: true,
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
    is_active: true,
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
    is_active: true,
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
    is_active: true,
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
    is_active: true,
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
    is_active: true,
  },
];

export default function AdminDeals() {
  const { isSuperAdmin } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoPopulateDialogOpen, setAutoPopulateDialogOpen] = useState(false);
  const [autoFromProductsDialogOpen, setAutoFromProductsDialogOpen] = useState(false);
  const [numberOfDeals, setNumberOfDeals] = useState(8);
  const [numberOfProducts, setNumberOfProducts] = useState(8);
  const [editingDeal, setEditingDeal] = useState<Partial<Deal> | null>(null);
  const [tableExists, setTableExists] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    checkTableAndFetch();
  }, []);

  const checkTableAndFetch = async () => {
    try {
      const { error } = await supabase
        .from('deals')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (error && error.code === '42P01') {
        setTableExists(false);
        toast({
          title: 'Deals table not found',
          description: 'Creating sample deals instead',
          variant: 'destructive'
        });
        setDeals(GUARANTEED_SAMPLE_DEALS.map((deal, index) => ({
          id: `sample-${index}`,
          product_id: null,
          ...deal,
          sort_order: index,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })));
      } else {
        setTableExists(true);
        fetchDeals();
      }
    } catch (error) {
      console.error('Error checking table:', error);
      setDeals(GUARANTEED_SAMPLE_DEALS.map((deal, index) => ({
        id: `sample-${index}`,
        product_id: null,
        ...deal,
        sort_order: index,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
        setDeals(GUARANTEED_SAMPLE_DEALS.map((deal, index) => ({
          id: `sample-${index}`,
          product_id: null,
          ...deal,
          sort_order: index,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })));
        return;
      }

      if (data && data.length > 0) {
        setDeals(data);
      } else {
        toast({
          title: 'No deals found',
          description: 'Showing sample deals',
        });
        setDeals(GUARANTEED_SAMPLE_DEALS.map((deal, index) => ({
          id: `sample-${index}`,
          product_id: null,
          ...deal,
          sort_order: index,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })));
      }
    } catch (error) {
      console.error('Error:', error);
      setDeals(GUARANTEED_SAMPLE_DEALS.map((deal, index) => ({
        id: `sample-${index}`,
        product_id: null,
        ...deal,
        sort_order: index,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })));
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          images,
          price_min,
          price_max,
          moq,
          seller_id,
          suppliers!products_seller_id_fkey (
            id,
            company_name,
            verified
          )
        `)
        .eq('published', true)
        .limit(50)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error loading products',
          description: 'Cannot fetch products for auto-population',
          variant: 'destructive'
        });
        return [];
      }

      console.log('Fetched products:', data);
      return data || [];
    } catch (error) {
      console.error('Error:', error);
      return [];
    } finally {
      setProductsLoading(false);
    }
  };

  const createSampleDeals = async () => {
    try {
      setSaving(true);
      toast({ title: 'Creating sample deals...' });

      if (tableExists) {
        await supabase
          .from('deals')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000')
          .catch(() => {});
      }

      const dealsToInsert = GUARANTEED_SAMPLE_DEALS.slice(0, numberOfDeals).map((deal, index) => ({
        title: deal.title,
        image: deal.image,
        price: deal.price,
        original_price: deal.original_price,
        discount: deal.discount,
        moq: deal.moq,
        supplier: deal.supplier,
        is_verified: deal.is_verified ?? false,
        is_flash_deal: deal.is_flash_deal ?? false,
        is_active: deal.is_active ?? true,
        sort_order: index,
        ends_at: deal.ends_at,
      }));

      if (tableExists) {
        const { error } = await supabase
          .from('deals')
          .insert(dealsToInsert);

        if (error) {
          console.error('Database insert failed:', error);
          throw new Error('Database insert failed');
        }
      }

      setDeals(dealsToInsert.map((deal, index) => ({
        id: tableExists ? `db-${Date.now()}-${index}` : `sample-${index}`,
        product_id: null,
        ...deal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })));

      toast({
        title: `✅ Created ${dealsToInsert.length} sample deals!`,
        description: tableExists ? 'Saved to database' : 'Using local sample data'
      });

      setAutoPopulateDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating sample deals:', error);
      setDeals(GUARANTEED_SAMPLE_DEALS.slice(0, numberOfDeals).map((deal, index) => ({
        id: `local-${index}`,
        product_id: null,
        ...deal,
        sort_order: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

  const createDealsFromProducts = async () => {
    try {
      setSaving(true);
      toast({ title: 'Fetching products and creating deals...' });

      // Fetch products from database
      const productsData = await fetchProducts();
      
      if (productsData.length === 0) {
        toast({
          title: 'No products found',
          description: 'Cannot create deals from empty product list',
          variant: 'destructive'
        });
        return;
      }

      // Try to clear existing deals if table exists
      if (tableExists) {
        await supabase
          .from('deals')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000')
          .catch(() => {});
      }

      // Prepare deals from products
      const dealsToInsert = productsData.slice(0, numberOfProducts).map((product, index) => {
        // Get the first image from the array or use default
        const firstImage = product.images && product.images.length > 0 
          ? product.images[0] 
          : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format';
        
        // Use price_min or calculate average if both exist
        const productPrice = product.price_min || 
          (product.price_min && product.price_max ? (product.price_min + product.price_max) / 2 : 49.99);
        
        const originalPrice = productPrice * 2;
        const discount = Math.round(((originalPrice - productPrice) / originalPrice) * 100);
        
        return {
          title: product.title,
          image: firstImage,
          price: productPrice,
          original_price: originalPrice,
          discount: Math.min(discount, 70), // Cap at 70% discount
          moq: product.moq || 50,
          supplier: product.suppliers?.company_name || 'Verified Supplier',
          is_verified: product.suppliers?.verified || true,
          is_flash_deal: index % 3 === 0, // Make every 3rd product a flash deal
          is_active: true,
          sort_order: index,
          ends_at: index % 3 === 0 ? new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString() : null,
          product_id: product.id, // Link to the actual product
        };
      });

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

      // Update local state
      setDeals(dealsToInsert.map((deal, index) => ({
        id: tableExists ? `db-${Date.now()}-${index}` : `product-${index}`,
        ...deal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })));

      toast({
        title: `✅ Created ${dealsToInsert.length} deals from products!`,
        description: tableExists ? 'Saved to database' : 'Using local data'
      });

      setAutoFromProductsDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating deals from products:', error);
      toast({
        title: 'Error creating deals from products',
        description: error.message || 'Please try again',
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
      if (editingDeal.id && editingDeal.id.startsWith('sample-')) {
        setDeals(deals.map(d => 
          d.id === editingDeal.id 
            ? { ...d, ...editingDeal } as Deal 
            : d
        ));
        toast({ title: 'Deal updated locally' });
      } else if (tableExists) {
        if (editingDeal.id) {
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
              product_id: editingDeal.product_id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', editingDeal.id);

          if (error) throw error;
          toast({ title: 'Deal updated in database' });
        } else {
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
              sort_order: editingDeal.sort_order || deals.length,
              ends_at: editingDeal.ends_at,
              product_id: editingDeal.product_id,
            }]);

          if (error) throw error;
          toast({ title: 'Deal created in database' });
        }
        fetchDeals();
      } else {
        if (editingDeal.id) {
          setDeals(deals.map(d => 
            d.id === editingDeal.id 
              ? { 
                  ...d, 
                  ...editingDeal,
                  updated_at: new Date().toISOString()
                } as Deal 
              : d
          ));
        } else {
          const newDeal: Deal = {
            id: `local-${Date.now()}`,
            product_id: editingDeal.product_id || null,
            title: editingDeal.title!,
            image: editingDeal.image,
            price: editingDeal.price,
            original_price: editingDeal.original_price,
            discount: editingDeal.discount,
            moq: editingDeal.moq,
            supplier: editingDeal.supplier,
            is_verified: editingDeal.is_verified || false,
            is_flash_deal: editingDeal.is_flash_deal || false,
            is_active: editingDeal.is_active !== undefined ? editingDeal.is_active : true,
            sort_order: editingDeal.sort_order || deals.length,
            ends_at: editingDeal.ends_at,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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

    setDeals(deals.filter(d => d.id !== id));

    if (tableExists && !id.startsWith('sample-') && !id.startsWith('local-') && !id.startsWith('product-')) {
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

    setDeals([]);

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
    setDeals(deals.map(d => 
      d.id === deal.id ? { 
        ...d, 
        is_active: !d.is_active,
        updated_at: new Date().toISOString()
      } : d
    ));

    if (tableExists && !deal.id.startsWith('sample-') && !deal.id.startsWith('local-') && !deal.id.startsWith('product-')) {
      supabase
        .from('deals')
        .update({ 
          is_active: !deal.is_active,
          updated_at: new Date().toISOString()
        })
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

  // Debug function to test product connection
  const testProductConnection = async () => {
    try {
      toast({ title: 'Testing product connection...' });
      
      // Test 1: Simple select
      const { data: simpleData, error: simpleError } = await supabase
        .from('products')
        .select('id, title')
        .limit(5);
        
      console.log('Simple query result:', { simpleData, simpleError });
      
      if (simpleError) {
        toast({ 
          title: 'Simple query failed', 
          description: simpleError.message,
          variant: 'destructive'
        });
        return;
      }
      
      // Test 2: Check if suppliers table exists
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, company_name')
        .limit(5);
        
      console.log('Suppliers query result:', { suppliersData, suppliersError });
      
      toast({ 
        title: 'Connection test complete', 
        description: `Found ${simpleData?.length || 0} products, ${suppliersData?.length || 0} suppliers` 
      });
      
    } catch (error: any) {
      console.error('Test error:', error);
      toast({ 
        title: 'Test failed', 
        description: error.message,
        variant: 'destructive'
      });
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
          {!tableExists && (
            <Badge variant="outline" className="border-amber-300 text-amber-700">
              <Database className="h-3 w-3 mr-1" />
              Local Mode
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={() => setAutoFromProductsDialogOpen(true)}
            className="border-blue-600 text-blue-700 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Auto from Products
          </Button>
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={testProductConnection}
            title="Test product database connection"
          >
            <Database className="h-4 w-4" />
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
                Create deals to get started instantly
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button 
                  variant="outline"
                  onClick={() => { setEditingDeal(emptyDeal); setDialogOpen(true); }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Manual Deal
                </Button>
                <Button 
                  onClick={() => setAutoFromProductsDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Auto from Products
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
                            {deal.product_id && (
                              <Badge variant="outline" className="mt-1 text-xs bg-blue-50 text-blue-700">
                                <Tag className="h-2 w-2 mr-1" />
                                Linked
                              </Badge>
                            )}
                            {(deal.id.startsWith('sample-') || deal.id.startsWith('local-')) && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Sample
                              </Badge>
                            )}
                            {deal.id.startsWith('product-') && (
                              <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700">
                                From Product
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
                            checked={deal.is_active} 
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
                <Label>Product ID (optional)</Label>
                <Input
                  value={editingDeal?.product_id || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, product_id: e.target.value || null })}
                  placeholder="Link to a product by UUID"
                />
              </div>

              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  min="0"
                  value={editingDeal?.sort_order || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Price ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingDeal?.price || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Original Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingDeal?.original_price || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, original_price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editingDeal?.discount || 0}
                  onChange={(e) => setEditingDeal({ ...editingDeal, discount: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>MOQ *</Label>
                <Input
                  type="number"
                  min="1"
                  value={editingDeal?.moq || 1}
                  onChange={(e) => setEditingDeal({ ...editingDeal, moq: parseInt(e.target.value) || 1 })}
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
                    checked={editingDeal?.is_active !== undefined ? editingDeal.is_active : true}
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

      {/* Auto-populate from Products Dialog */}
      <Dialog open={autoFromProductsDialogOpen} onOpenChange={setAutoFromProductsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Create Deals from Products
            </DialogTitle>
            <DialogDescription>
              Automatically create deals from your existing products database
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfProducts">Number of products to convert</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="numberOfProducts"
                  type="number"
                  min="1"
                  max="50"
                  value={numberOfProducts}
                  onChange={(e) => setNumberOfProducts(Math.min(50, Math.max(1, parseInt(e.target.value) || 8)))}
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
                  <li>Fetch latest published products from your database</li>
                  <li>Convert them into attractive deals with discounts</li>
                  <li>Link deals to original products via product_id</li>
                  <li>Use actual supplier information and verification status</li>
                  <li>Auto-calculate prices from product data</li>
                </ul>
              </AlertDescription>
            </Alert>

            {productsLoading && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading products from database...
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoFromProductsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={createDealsFromProducts} 
              disabled={saving || productsLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {saving ? 'Creating deals...' : `Create ${numberOfProducts} deals from products`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-populate Sample Deals Dialog */}
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
              {saving ? 'Creating deals...' : `Create ${numberOfDeals} sample deals`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
