import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminProductFormProps {
  onComplete?: () => void;
}

export default function AdminProductForm({ onComplete }: AdminProductFormProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_min: '',
    price_max: '',
    moq: '1',
    unit: 'piece',
    stock_quantity: '100',
    sku: '',
    published: false,
    images: ['', '', ''],
  });

  const normalizeSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      const slug = normalizeSlug(formData.title) + '-' + Date.now();
      const images = formData.images.filter(Boolean);

      const { error } = await supabase.from('products').insert({
        title: formData.title,
        slug,
        description: formData.description || null,
        price_min: formData.price_min ? parseFloat(formData.price_min) : null,
        price_max: formData.price_max ? parseFloat(formData.price_max) : null,
        moq: parseInt(formData.moq) || 1,
        unit: formData.unit,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        sku: formData.sku || null,
        images: images.length > 0 ? images : null,
        seller_id: user?.id || '',
        published: formData.published,
        verified: false,
      });

      if (error) throw error;

      toast({ title: 'Product created successfully' });
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        price_min: '',
        price_max: '',
        moq: '1',
        unit: 'piece',
        stock_quantity: '100',
        sku: '',
        published: false,
        images: ['', '', ''],
      });
      onComplete?.();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Fill in the product details below</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Product title"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Price ($)</Label>
              <Input
                type="number"
                value={formData.price_min}
                onChange={(e) => setFormData({ ...formData, price_min: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Price ($)</Label>
              <Input
                type="number"
                value={formData.price_max}
                onChange={(e) => setFormData({ ...formData, price_max: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>MOQ</Label>
              <Input
                type="number"
                value={formData.moq}
                onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Stock Quantity</Label>
            <Input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Image URLs (up to 3)</Label>
            {formData.images.map((img, i) => (
              <Input
                key={i}
                value={img}
                onChange={(e) => {
                  const newImages = [...formData.images];
                  newImages[i] = e.target.value;
                  setFormData({ ...formData, images: newImages });
                }}
                placeholder={`Image URL ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
            />
            <Label>Published</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Create Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
