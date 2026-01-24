import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Save, X, Image } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PromoSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  cta_text: string | null;
  cta_link: string | null;
  is_active: boolean | null;
  sort_order: number | null;
}

const emptySlide: Partial<PromoSlide> = {
  title: '',
  subtitle: '',
  image: '',
  cta_text: 'Shop Now',
  cta_link: '/products',
  is_active: true,
  sort_order: 0,
};

export default function AdminPromoSlides() {
  const [slides, setSlides] = useState<PromoSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<PromoSlide> | null>(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const { data } = await supabase
      .from('promo_slides')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data) setSlides(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingSlide?.title) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      if (editingSlide.id) {
        const { error } = await supabase
          .from('promo_slides')
          .update({
            title: editingSlide.title,
            subtitle: editingSlide.subtitle,
            image: editingSlide.image,
            cta_text: editingSlide.cta_text,
            cta_link: editingSlide.cta_link,
            is_active: editingSlide.is_active,
            sort_order: editingSlide.sort_order,
          })
          .eq('id', editingSlide.id);

        if (error) throw error;
        toast({ title: 'Slide updated successfully' });
      } else {
        const { error } = await supabase
          .from('promo_slides')
          .insert([{
            title: editingSlide.title,
            subtitle: editingSlide.subtitle,
            image: editingSlide.image,
            cta_text: editingSlide.cta_text,
            cta_link: editingSlide.cta_link,
            is_active: editingSlide.is_active,
            sort_order: slides.length,
          }]);

        if (error) throw error;
        toast({ title: 'Slide created successfully' });
      }

      fetchSlides();
      setDialogOpen(false);
      setEditingSlide(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return;

    const { error } = await supabase.from('promo_slides').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting slide', variant: 'destructive' });
    } else {
      setSlides(slides.filter(s => s.id !== id));
      toast({ title: 'Slide deleted' });
    }
  };

  const toggleActive = async (slide: PromoSlide) => {
    const { error } = await supabase
      .from('promo_slides')
      .update({ is_active: !slide.is_active })
      .eq('id', slide.id);

    if (!error) {
      setSlides(slides.map(s => s.id === slide.id ? { ...s, is_active: !s.is_active } : s));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
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
          <h1 className="text-3xl font-bold">Promo Slides</h1>
          <p className="text-muted-foreground">Manage homepage hero banner slides</p>
        </div>
        <Button onClick={() => { setEditingSlide(emptySlide); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Slides</CardTitle>
          <CardDescription>{slides.length} slides configured</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>CTA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides.map((slide) => (
                <TableRow key={slide.id} className={!slide.is_active ? 'opacity-50' : ''}>
                  <TableCell>
                    {slide.image ? (
                      <img src={slide.image} alt="" className="w-24 h-14 rounded object-cover" />
                    ) : (
                      <div className="w-24 h-14 bg-muted rounded flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{slide.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{slide.subtitle}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{slide.cta_text}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={slide.is_active || false} onCheckedChange={() => toggleActive(slide)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingSlide(slide); setDialogOpen(true); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(slide.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSlide?.id ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
            <DialogDescription>Configure the promo slide details</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editingSlide?.title || ''}
                onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                placeholder="Slide title"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={editingSlide?.subtitle || ''}
                onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                placeholder="Subtitle text"
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={editingSlide?.image || ''}
                onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input
                  value={editingSlide?.cta_text || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, cta_text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Link</Label>
                <Input
                  value={editingSlide?.cta_link || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, cta_link: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={editingSlide?.is_active || false}
                onCheckedChange={(checked) => setEditingSlide({ ...editingSlide, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
