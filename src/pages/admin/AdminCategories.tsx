import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  FolderTree,
  Upload,
  Download,
  Search,
  ChevronRight,
  ChevronDown,
  Check,
  Copy,
  RefreshCw,
  Layers,
  Filter,
  Eye,
  EyeOff,
  Grid,
  ListTree,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { CSVImport } from '@/components/admin/CSVImport';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  productCount?: number;
  subcategories?: Category[];
  level?: number;
  path?: string[];
}

const generateSlug = (name: string, existingSlugs: Set<string> = new Set()): string => {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();

  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('tree');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showInactive, setShowInactive] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'productCount' | 'created_at' | 'sort_order'>('sort_order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    parent_id: '',
    image_url: '',
    description: '',
    meta_title: '',
    meta_description: '',
    sort_order: 0,
    is_active: true,
  });

  // Build hierarchical category tree
  const buildCategoryTree = useCallback((categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // First pass: Create map
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        subcategories: [],
        level: 0,
        path: []
      });
    });

    // Second pass: Build hierarchy
    categories.forEach(category => {
      const enrichedCategory = categoryMap.get(category.id)!;
      
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        const parent = categoryMap.get(category.parent_id)!;
        parent.subcategories!.push(enrichedCategory);
        enrichedCategory.level = (parent.level || 0) + 1;
        enrichedCategory.path = [...(parent.path || []), parent.name];
      } else {
        rootCategories.push(enrichedCategory);
      }
    });

    // Sort categories
    const sortCategories = (cats: Category[]): Category[] => {
      return [...cats].sort((a, b) => {
        if (sortBy === 'name') {
          return sortOrder === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortBy === 'productCount') {
          return sortOrder === 'asc'
            ? (a.productCount || 0) - (b.productCount || 0)
            : (b.productCount || 0) - (a.productCount || 0);
        } else if (sortBy === 'created_at') {
          return sortOrder === 'asc'
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else {
          return sortOrder === 'asc'
            ? a.sort_order - b.sort_order
            : b.sort_order - a.sort_order;
        }
      }).map(cat => ({
        ...cat,
        subcategories: cat.subcategories ? sortCategories(cat.subcategories) : []
      }));
    };

    return sortCategories(rootCategories);
  }, [sortBy, sortOrder]);

  // Flatten tree for display
  const flattenTree = useCallback((tree: Category[], level = 0, visible = true): Category[] => {
    let result: Category[] = [];
    
    tree.forEach(category => {
      const isVisible = visible && (showInactive || category.is_active);
      const shouldShowChildren = expandedCategories.has(category.id);
      
      if (isVisible) {
        result.push({
          ...category,
          level,
          path: category.path || []
        });
      }
      
      if (category.subcategories && shouldShowChildren) {
        result = result.concat(flattenTree(category.subcategories, level + 1, isVisible));
      }
    });
    
    return result;
  }, [expandedCategories, showInactive]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const tree = buildCategoryTree(categories);
    setFlatCategories(flattenTree(tree));
  }, [categories, buildCategoryTree, flattenTree]);

  const fetchCategories = async () => {
    setLoading(true);
    
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      if (categoriesData) {
        // Get product counts
        const { data: productCounts, error: countsError } = await supabase
          .from('products')
          .select('category_id')
          .in('category_id', categoriesData.map(c => c.id));

        if (countsError) throw countsError;

        const countMap = new Map<string, number>();
        productCounts?.forEach(p => {
          if (p.category_id) {
            countMap.set(p.category_id, (countMap.get(p.category_id) || 0) + 1);
          }
        });

        const enrichedCategories = categoriesData.map(category => ({
          ...category,
          productCount: countMap.get(category.id) || 0
        }));

        setCategories(enrichedCategories);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch categories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    const existingSlugs = new Set(categories.map(c => c.slug).filter(s => s !== editingCategory?.slug));
    const newSlug = generateSlug(name, existingSlugs);
    
    setForm({
      ...form,
      name,
      slug: editingCategory ? form.slug : newSlug,
      meta_title: form.meta_title || name,
      meta_description: form.meta_description || `Browse our collection of ${name.toLowerCase()}`
    });
  };

  const resetForm = () => {
    const maxSortOrder = categories.reduce((max, cat) => Math.max(max, cat.sort_order), 0);
    
    setForm({
      name: '',
      slug: '',
      parent_id: '',
      image_url: '',
      description: '',
      meta_title: '',
      meta_description: '',
      sort_order: maxSortOrder + 10,
      is_active: true,
    });
    setEditingCategory(null);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id || '',
      image_url: category.image_url || '',
      description: category.description || '',
      meta_title: category.meta_title || '',
      meta_description: category.meta_description || '',
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive'
      });
      return;
    }

    if (!form.slug.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Slug is required',
        variant: 'destructive'
      });
      return;
    }

    if (!validateSlug(form.slug)) {
      toast({
        title: 'Validation Error',
        description: 'Slug can only contain lowercase letters, numbers, and hyphens',
        variant: 'destructive'
      });
      return;
    }

    if (form.parent_id === editingCategory?.id) {
      toast({
        title: 'Validation Error',
        description: 'Category cannot be its own parent',
        variant: 'destructive'
      });
      return;
    }

    const categoryData = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      parent_id: form.parent_id || null,
      image_url: form.image_url || null,
      description: form.description || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast({ 
          title: 'Success', 
          description: 'Category updated successfully' 
        });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{
            ...categoryData,
            created_at: new Date().toISOString(),
          }]);

        if (error) throw error;
        toast({ 
          title: 'Success', 
          description: 'Category created successfully' 
        });
      }

      fetchCategories();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save category',
        variant: 'destructive'
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // First, move all subcategories to parent (or make them root)
      const { error: updateError } = await supabase
        .from('categories')
        .update({ parent_id: null })
        .eq('parent_id', id);
        
      if (updateError) throw updateError;

      // Then delete the category
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setCategories(categories.filter(c => c.id !== id));
      toast({ 
        title: 'Success', 
        description: 'Category deleted successfully. Subcategories moved to root level.' 
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete category',
        variant: 'destructive'
      });
    }
  };

  const handleBulkOperation = async (operation: 'delete' | 'deactivate' | 'activate', categoryIds: string[]) => {
    if (categoryIds.length === 0) {
      toast({
        title: 'No categories selected',
        description: 'Please select categories first',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (operation === 'delete') {
        // For bulk delete, move all to root first
        for (const id of categoryIds) {
          const { error: updateError } = await supabase
            .from('categories')
            .update({ parent_id: null })
            .eq('parent_id', id);
            
          if (updateError) throw updateError;
        }

        const { error: deleteError } = await supabase
          .from('categories')
          .delete()
          .in('id', categoryIds);

        if (deleteError) throw deleteError;
        
        toast({ 
          title: 'Success', 
          description: `${categoryIds.length} categories deleted` 
        });
      } else {
        const { error } = await supabase
          .from('categories')
          .update({ is_active: operation === 'activate' })
          .in('id', categoryIds);

        if (error) throw error;
        
        toast({ 
          title: 'Success', 
          description: `${categoryIds.length} categories ${operation}d` 
        });
      }

      fetchCategories();
      setSelectedCategories(new Set());
    } catch (error: any) {
      console.error('Error in bulk operation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to perform bulk operation',
        variant: 'destructive'
      });
    }
  };

  const handleCSVImport = async (data: Record<string, string>[]) => {
    let success = 0;
    const errors: string[] = [];
    const existingSlugs = new Set(categories.map(c => c.slug));

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        if (!row.name || !row.name.trim()) {
          errors.push(`Row ${i + 2}: Name is required`);
          continue;
        }

        const categoryData = {
          name: row.name.trim(),
          slug: row.slug?.trim() || generateSlug(row.name, existingSlugs),
          description: row.description?.trim() || null,
          meta_title: row.meta_title?.trim() || null,
          meta_description: row.meta_description?.trim() || null,
          image_url: row.image_url?.trim() || null,
          parent_id: null as string | null,
          sort_order: parseInt(row.sort_order) || (categories.length + i + 1) * 10,
          is_active: row.is_active?.toLowerCase() !== 'false',
        };

        // Find parent by name or slug
        if (row.parent_name || row.parent_slug) {
          const parent = categories.find(c => 
            (row.parent_name && c.name.toLowerCase() === row.parent_name.toLowerCase()) ||
            (row.parent_slug && c.slug === row.parent_slug)
          );
          
          if (parent) {
            categoryData.parent_id = parent.id;
          }
        }

        existingSlugs.add(categoryData.slug);
        
        const { error } = await supabase
          .from('categories')
          .upsert(categoryData, { onConflict: 'slug' });

        if (error) throw error;
        success++;
      } catch (err: any) {
        errors.push(`Row ${i + 2}: ${err.message || 'Unknown error'}`);
      }
    }

    if (success > 0) {
      fetchCategories();
    }

    return { success, errors };
  };

  const exportCategoriesCSV = () => {
    const headers = [
      'name', 'slug', 'parent_name', 'parent_slug', 'description', 
      'meta_title', 'meta_description', 'image_url', 'sort_order', 'is_active'
    ];
    
    const csvContent = [
      headers.join(','),
      ...categories.map(c => {
        const parent = categories.find(p => p.id === c.parent_id);
        return [
          `"${c.name.replace(/"/g, '""')}"`,
          c.slug,
          parent ? `"${parent.name.replace(/"/g, '""')}"` : '',
          parent ? parent.slug : '',
          c.description ? `"${c.description.replace(/"/g, '""')}"` : '',
          c.meta_title ? `"${c.meta_title.replace(/"/g, '""')}"` : '',
          c.meta_description ? `"${c.meta_description.replace(/"/g, '""')}"` : '',
          c.image_url || '',
          c.sort_order,
          c.is_active ? 'true' : 'false'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const selectAllVisible = () => {
    const visibleIds = new Set(flatCategories.map(c => c.id));
    setSelectedCategories(visibleIds);
  };

  const clearSelection = () => {
    setSelectedCategories(new Set());
  };

  const filteredCategories = flatCategories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: categories.length,
    active: categories.filter(c => c.is_active).length,
    topLevel: categories.filter(c => !c.parent_id).length,
    subCategories: categories.filter(c => c.parent_id).length,
    withProducts: categories.filter(c => (c.productCount || 0) > 0).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground">Organize products into categories</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <Button variant="outline" size="sm" onClick={exportCategoriesCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCsvImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Electronics"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="slug"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="e.g. electronics"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const existingSlugs = new Set(categories.map(c => c.slug).filter(s => s !== editingCategory?.slug));
                          const newSlug = generateSlug(form.name, existingSlugs);
                          setForm({ ...form, slug: newSlug });
                        }}
                      >
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {validateSlug(form.slug) ? (
                        <span className="text-green-600">✓ Valid slug format</span>
                      ) : (
                        <span className="text-red-600">⚠ Use lowercase letters, numbers, and hyphens only</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent">Parent Category</Label>
                  <Select 
                    value={form.parent_id} 
                    onValueChange={(v) => setForm({ ...form, parent_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (top-level category)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (top-level)</SelectItem>
                      {categories
                        .filter(c => c.id !== editingCategory?.id)
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name} {!cat.is_active && '(inactive)'}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of this category..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title (SEO)</Label>
                  <Input
                    id="meta_title"
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder="For search engines"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                  <Textarea
                    id="meta_description"
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder="Appears in search results"
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active (visible to customers)</Label>
                </div>

                <DialogFooter className="pt-4">
                  <Button variant="outline" onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Categories</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats.active} active • {stats.total - stats.active} inactive
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Level</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.topLevel}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Subcategories</CardDescription>
            <CardTitle className="text-2xl text-purple-600">{stats.subCategories}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>With Products</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.withProducts}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Bulk Operations Bar */}
      {selectedCategories.size > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedCategories.size} selected</Badge>
                <span className="text-sm text-muted-foreground">
                  {Array.from(selectedCategories).slice(0, 3).map(id => {
                    const cat = categories.find(c => c.id === id);
                    return cat?.name;
                  }).join(', ')}
                  {selectedCategories.size > 3 && '...'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('activate', Array.from(selectedCategories))}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('deactivate', Array.from(selectedCategories))}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedCategories.size} Categories?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All products in these categories will become uncategorized.
                        Subcategories will be moved to root level.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground"
                        onClick={() => handleBulkOperation('delete', Array.from(selectedCategories))}
                      >
                        Delete {selectedCategories.size} Categories
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls Bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="show-inactive"
                  checked={showInactive}
                  onCheckedChange={setShowInactive}
                  className="mr-2"
                />
                <Label htmlFor="show-inactive" className="text-sm whitespace-nowrap">
                  Show Inactive
                </Label>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Sort: {sortBy} ({sortOrder})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  {(['name', 'productCount', 'created_at', 'sort_order'] as const).map((field) => (
                    <DropdownMenuCheckboxItem
                      key={field}
                      checked={sortBy === field}
                      onCheckedChange={() => setSortBy(field)}
                    >
                      {field.replace('_', ' ')}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Order</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={sortOrder === 'asc'}
                    onCheckedChange={() => setSortOrder('asc')}
                  >
                    Ascending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortOrder === 'desc'}
                    onCheckedChange={() => setSortOrder('desc')}
                  >
                    Descending
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'tree' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode('tree')}
                >
                  <ListTree className="h-4 w-4 mr-2" />
                  Tree
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCategories}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {filteredCategories.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllVisible}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Select All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories found</h3>
              <p className="text-muted-foreground mb-6">
                {search ? 'Try a different search term' : 'Get started by creating your first category'}
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden md:table-cell">Hierarchy</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="w-12">
                        <div className="flex items-center gap-1">
                          {viewMode === 'tree' && category.subcategories && category.subcategories.length > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleCategoryExpand(category.id)}
                            >
                              {expandedCategories.has(category.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <input
                            type="checkbox"
                            checked={selectedCategories.has(category.id)}
                            onChange={() => toggleSelectCategory(category.id)}
                            className="h-4 w-4"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${category.image_url ? 'bg-muted' : 'bg-primary/10'} overflow-hidden shrink-0`}>
                            {category.image_url ? (
                              <img 
                                src={category.image_url} 
                                alt={category.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FolderTree className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${!category.is_active ? 'opacity-50' : ''}`}>
                                {category.name}
                              </span>
                              {!category.is_active && (
                                <Badge variant="outline" className="text-xs">Inactive</Badge>
                              )}
                              {category.level && category.level > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  Level {category.level}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {category.slug} {category.description && ` • ${category.description.substring(0, 30)}...`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{category.parent_id ? 'Subcategory' : 'Main Category'}</span>
                          {category.path && category.path.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {category.path.map((p, i) => (
                                <span key={i}>
                                  {p}
                                  {i < category.path!.length - 1 && <ChevronRight className="h-3 w-3 inline mx-1" />}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{category.productCount || 0}</span>
                          {category.productCount === 0 && (
                            <Badge variant="outline" className="text-xs">Empty</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(category)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              navigator.clipboard.writeText(category.id);
                              toast({ title: 'Category ID copied to clipboard' });
                            }}
                            title="Copy ID"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will delete "{category.name}" and {category.productCount || 0} products will become uncategorized.
                                  {category.subcategories && category.subcategories.length > 0 && (
                                    <span className="block mt-2 text-destructive">
                                      ⚠️ Subcategories will be moved to root level
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground"
                                  onClick={() => deleteCategory(category.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredCategories.length} of {flatCategories.length} categories
                {search && ` matching "${search}"`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSV Import Component */}
      <CSVImport
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        type="categories"
        requiredColumns={['name']}
        optionalColumns={[
          'slug', 'parent_name', 'parent_slug', 'description', 
          'meta_title', 'meta_description', 'image_url', 
          'sort_order', 'is_active'
        ]}
        onImport={handleCSVImport}
        sampleData={[
          { 
            name: 'Electronics', 
            slug: 'electronics', 
            parent_name: '', 
            parent_slug: '',
            description: 'Latest electronic gadgets',
            meta_title: 'Electronics Store',
            meta_description: 'Shop the latest electronics',
            image_url: '',
            sort_order: '10',
            is_active: 'true'
          },
          { 
            name: 'Smartphones', 
            slug: 'smartphones', 
            parent_name: 'Electronics', 
            parent_slug: 'electronics',
            description: 'Latest smartphones',
            meta_title: 'Smartphones',
            meta_description: 'Shop smartphones',
            image_url: '',
            sort_order: '20',
            is_active: 'true'
          },
        ]}
      />
    </div>
  );
}
