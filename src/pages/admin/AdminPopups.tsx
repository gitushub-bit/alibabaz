import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Save, X, Megaphone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PopupPromotion {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  discount_percent: number | null;
  discount_code: string | null;
  cta_text: string | null;
  cta_link: string | null;
  display_frequency: string | null;
  show_on_pages: string[] | null;
  is_active: boolean | null;
  start_at: string | null;
  end_at: string | null;
}

const emptyPopup: Partial<PopupPromotion> = {
  title: '',
  description: '',
  image: '',
  discount_percent: 10,
  discount_code: '',
  cta_text: 'Shop Now',
  cta_link: '/products',
  display_frequency: 'once_per_session',
  show_on_pages: ['home'],
  is_active: true,
};

export default function AdminPopups() {
  const [popups, setPopups] = useState<PopupPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Partial<PopupPromotion> | null>(null);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    const { data } = await supabase
      .from('popup_promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPopups(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingPopup?.title) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      if (editingPopup.id) {
        const { error } = await supabase
          .from('popup_promotions')
          .update({
            title: editingPopup.title,
            description: editingPopup.description,
            image: editingPopup.image,
            discount_percent: editingPopup.discount_percent,
            discount_code: editingPopup.discount_code,
            cta_text: editingPopup.cta_text,
            cta_link: editingPopup.cta_link,
            display_frequency: editingPopup.display_frequency,
            show_on_pages: editingPopup.show_on_pages,
            is_active: editingPopup.is_active,
            start_at: editingPopup.start_at,
            end_at: editingPopup.end_at,
          })
          .eq('id', editingPopup.id);

        if (error) throw error;
        toast({ title: 'Popup updated successfully' });
      } else {
        const { error } = await supabase
          .from('popup_promotions')
          .insert([{
            title: editingPopup.title,
            description: editingPopup.description,
            image: editingPopup.image,
            discount_percent: editingPopup.discount_percent,
            discount_code: editingPopup.discount_code,
            cta_text: editingPopup.cta_text,
            cta_link: editingPopup.cta_link,
            display_frequency: editingPopup.display_frequency,
            show_on_pages: editingPopup.show_on_pages,
            is_active: editingPopup.is_active,
          }]);

        if (error) throw error;
        toast({ title: 'Popup created successfully' });
      }

      fetchPopups();
      setDialogOpen(false);
      setEditingPopup(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this popup?')) return;

    const { error } = await supabase.from('popup_promotions').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting popup', variant: 'destructive' });
    } else {
      setPopups(popups.filter(p => p.id !== id));
      toast({ title: 'Popup deleted' });
    }
  };

  const toggleActive = async (popup: PopupPromotion) => {
    const { error } = await supabase
      .from('popup_promotions')
      .update({ is_active: !popup.is_active })
      .eq('id', popup.id);

    if (!error) {
      setPopups(popups.map(p => p.id === popup.id ? { ...p, is_active: !p.is_active } : p));
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
          <h1 className="text-3xl font-bold">Popup Promotions</h1>
          <p className="text-muted-foreground">Manage promotional popups and discount codes</p>
        </div>
        <Button onClick={() => { setEditingPopup(emptyPopup); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Popup
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Popups</CardDescription>
            <CardTitle className="text-2xl">{popups.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl text-green-600">{popups.filter(p => p.is_active).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>With Discount Codes</CardDescription>
            <CardTitle className="text-2xl text-orange-600">{popups.filter(p => p.discount_code).length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Popups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popups.map((popup) => (
                <TableRow key={popup.id} className={!popup.is_active ? 'opacity-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Megaphone className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{popup.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {popup.discount_percent && (
                      <Badge variant="destructive">{popup.discount_percent}% OFF</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {popup.discount_code && (
                      <code className="bg-muted px-2 py-1 rounded text-sm">{popup.discount_code}</code>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{popup.display_frequency}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={popup.is_active || false} onCheckedChange={() => toggleActive(popup)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingPopup(popup); setDialogOpen(true); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(popup.id)}>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPopup?.id ? 'Edit Popup' : 'Add New Popup'}</DialogTitle>
            <DialogDescription>Configure the popup promotion</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editingPopup?.title || ''}
                onChange={(e) => setEditingPopup({ ...editingPopup, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editingPopup?.description || ''}
                onChange={(e) => setEditingPopup({ ...editingPopup, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={editingPopup?.image || ''}
                onChange={(e) => setEditingPopup({ ...editingPopup, image: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  value={editingPopup?.discount_percent || 0}
                  onChange={(e) => setEditingPopup({ ...editingPopup, discount_percent: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Code</Label>
                <Input
                  value={editingPopup?.discount_code || ''}
                  onChange={(e) => setEditingPopup({ ...editingPopup, discount_code: e.target.value })}
                  placeholder="SAVE10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input
                  value={editingPopup?.cta_text || ''}
                  onChange={(e) => setEditingPopup({ ...editingPopup, cta_text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Link</Label>
                <Input
                  value={editingPopup?.cta_link || ''}
                  onChange={(e) => setEditingPopup({ ...editingPopup, cta_link: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Display Frequency</Label>
              <Select
                value={editingPopup?.display_frequency || 'once_per_session'}
                onValueChange={(value) => setEditingPopup({ ...editingPopup, display_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once_per_session">Once per session</SelectItem>
                  <SelectItem value="once_per_day">Once per day</SelectItem>
                  <SelectItem value="always">Always show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={editingPopup?.is_active || false}
                onCheckedChange={(checked) => setEditingPopup({ ...editingPopup, is_active: checked })}
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
