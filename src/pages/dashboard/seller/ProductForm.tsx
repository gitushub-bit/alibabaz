import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Upload, X } from 'lucide-react';
import { z } from 'zod';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  price_min: z.number().min(0).optional(),
  price_max: z.number().min(0).optional(),
  moq: z.number().min(1),
  unit: z.string().min(1),
  category_id: z.string().optional(),
  published: z.boolean()
});

interface Category {
  id: string;
  name: string;
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    price_min: '',
    price_max: '',
    moq: '1',
    unit: 'piece',
    category_id: '',
    published: false
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name').order('name');
    if (data) setCategories(data);
  };

  const fetchProduct = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      navigate('/seller/products');
      return;
    }

    // Verify ownership
    if (data.seller_id !== user?.id) {
      navigate('/seller/products');
      return;
    }

    setForm({
      title: data.title,
      description: data.description || '',
      price_min: data.price_min?.toString() || '',
      price_max: data.price_max?.toString() || '',
      moq: data.moq.toString(),
      unit: data.unit,
      category_id: data.category_id || '',
      published: data.published
    });
    setImages(data.images || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (!error) {
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        
        newImages.push(urlData.publicUrl);
      }
    }

    setImages([...images, ...newImages]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + 
      '-' + Date.now().toString(36);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const validated = productSchema.parse({
        title: form.title,
        description: form.description || undefined,
        price_min: form.price_min ? parseFloat(form.price_min) : undefined,
        price_max: form.price_max ? parseFloat(form.price_max) : undefined,
        moq: parseInt(form.moq),
        unit: form.unit,
        category_id: form.category_id || undefined,
        published: form.published
      });

      if (isEditing) {
        const updateData = {
          title: validated.title,
          description: validated.description,
          price_min: validated.price_min,
          price_max: validated.price_max,
          moq: validated.moq,
          unit: validated.unit,
          category_id: validated.category_id,
          published: validated.published,
          images
        };

        const { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
        toast({ title: 'Product updated' });
      } else {
        const insertData = {
          title: validated.title,
          description: validated.description,
          price_min: validated.price_min,
          price_max: validated.price_max,
          moq: validated.moq,
          unit: validated.unit,
          category_id: validated.category_id,
          published: validated.published,
          images,
          seller_id: user.id,
          slug: generateSlug(form.title)
        };

        const { error } = await supabase
          .from('products')
          .insert(insertData);

        if (error) throw error;
        toast({ title: 'Product created' });
      }

      navigate('/seller/products');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: 'Validation error', description: error.errors[0].message, variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Failed to save product', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/seller/products')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Product' : 'Add Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Premium Wireless Bluetooth Headphones"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your product in detail..."
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm({ ...form, category_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
              
              <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">
                  {uploading ? 'Uploading...' : 'Add Image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & MOQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_min">Min Price ($)</Label>
                <Input
                  id="price_min"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price_min}
                  onChange={(e) => setForm({ ...form, price_min: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_max">Max Price ($)</Label>
                <Input
                  id="price_max"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price_max}
                  onChange={(e) => setForm({ ...form, price_max: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="moq">Minimum Order Quantity *</Label>
                <Input
                  id="moq"
                  type="number"
                  min="1"
                  value={form.moq}
                  onChange={(e) => setForm({ ...form, moq: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="set">Set</SelectItem>
                    <SelectItem value="pair">Pair</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="ton">Ton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="published">Publish Product</Label>
                <p className="text-sm text-muted-foreground">
                  Make this product visible to buyers
                </p>
              </div>
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(checked) => setForm({ ...form, published: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/seller/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
