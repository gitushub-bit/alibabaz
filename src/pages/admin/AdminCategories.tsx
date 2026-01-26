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
  X,
  Copy,
  RefreshCw,
  Layers,
  Filter,
  Eye,
  EyeOff,
  MoveVertical,
  Zap,
  AlertCircle,
  Grid,
  ListTree,
  FolderPlus,
  FolderOpen,
  FolderClosed
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface BulkOperation {
  type: 'delete' | 'deactivate' | 'activate' | 'move';
  categoryIds: string[];
  data?: any;
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

const SortableCategoryRow = ({ category, onEdit, onDelete, isExpanded, onToggle, viewMode, onMove }: {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  viewMode: 'list' | 'tree';
  onMove: (id: string, direction: 'up' | 'down') => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? 'bg-muted/50' : ''}>
      <TableCell className="w-12">
        <div className="flex items-center gap-1">
          {viewMode === 'tree' && category.subcategories && category.subcategories.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onToggle(category.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          {viewMode === 'list' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-move"
              {...attributes}
              {...listeners}
            >
              <MoveVertical className="h-4 w-4" />
            </Button>
          )}
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
                {category.parent_id ? (
                  <FolderClosed className="h-5 w-5 text-primary" />
                ) : (
                  <FolderOpen className="h-5 w-5 text-primary" />
                )}
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
        <div className="flex flex-col">
          <span className="font-medium">{category.productCount || 0}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => onMove(category.id, 'up')}
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => onMove(category.id, 'down')}
          >
            ↓
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(category)}
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
                      ⚠️ Warning: This will also delete {category.subcategories.length} subcategories!
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground"
                  onClick={() => onDelete(category.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default function AdvancedCategoryManager() {
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
  const [bulkMoveDialogOpen, setBulkMoveDialogOpen] = useState(false);
  const [bulkMoveTarget, setBulkMoveTarget] = useState<string>('');
  
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Build hierarchical category tree
  const buildCategoryTree = useCallback((categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // First pass: Create map and set level/path
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

    // Sort each level
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
        // Get product counts in a single query
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

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!form.name.trim()) {
      errors.push('Category name is required');
    }
    
    if (!form.slug.trim()) {
      errors.push('Slug is required');
    } else if (!validateSlug(form.slug)) {
      errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
    }
    
    if (form.parent_id === editingCategory?.id) {
      errors.push('Category cannot be its own parent');
    }
    
    // Check for circular reference
    if (form.parent_id && editingCategory) {
      const checkCircular = (parentId: string): boolean => {
        if (parentId === editingCategory.id) return true;
        const parent = categories.find(c => c.id === parentId);
        return parent?.parent_id ? checkCircular(parent.parent_id) : false;
      };
      
      if (checkCircular(form.parent_id)) {
        errors.push('Cannot create circular parent-child relationship');
      }
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: errors.join(', '),
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
      const subcategories = categories.filter(c => c.parent_id === id);
      
      if (subcategories.length > 0) {
        const { error: updateError } = await supabase
          .from('categories')
          .update({ parent_id: null })
          .eq('parent_id', id);
          
        if (updateError) throw updateError;
      }

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = flatCategories.findIndex(c => c.id === active.id);
      const newIndex = flatCategories.findIndex(c => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(flatCategories, oldIndex, newIndex);
        setFlatCategories(newOrder);
        
        // Update sort_order in database
        try {
          const updates = newOrder.map((cat, index) => ({
            id: cat.id,
            sort_order: (index + 1) * 10
          }));

          const { error } = await supabase
            .from('categories')
            .upsert(updates);

          if (error) throw error;
          
          fetchCategories();
          toast({ title: 'Order updated successfully' });
        } catch (error: any) {
          console.error('Error updating order:', error);
          toast({
            title: 'Error',
            description: 'Failed to update category order',
            variant: 'destructive'
          });
        }
      }
    }
  };

  const handleBulkOperation = async (operation: BulkOperation) => {
    if (operation.categoryIds.length === 0) {
      toast({
        title: 'No categories selected',
        description: 'Please select categories first',
        variant: 'destructive'
      });
      return;
    }

    try {
      switch (operation.type) {
        case 'delete':
          // Delete categories (will cascade due to foreign key)
          const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .in('id', operation.categoryIds);

          if (deleteError) throw deleteError;
          
          toast({ 
            title: 'Success', 
            description: `${operation.categoryIds.length} categories deleted` 
          });
          break;

        case 'deactivate':
        case 'activate':
          const { error: statusError } = await supabase
            .from('categories')
            .update({ is_active: operation.type === 'activate' })
            .in('id', operation.categoryIds);

          if (statusError) throw statusError;
          
          toast({ 
            title: 'Success', 
            description: `${operation.categoryIds.length} categories ${operation.type}d` 
          });
          break;

        case 'move':
          const { error: moveError } = await supabase
            .from('categories')
            .update({ parent_id: operation.data.parentId })
            .in('id', operation.categoryIds);

          if (moveError) throw moveError;
          
          toast({ 
            title: 'Success', 
            description: `${operation.categoryIds.length} categories moved` 
          });
          break;
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

        // Intelligent parent lookup
        if (row.parent_name || row.parent_slug) {
          const parent = categories.find(c => 
            (row.parent_name && c.name.toLowerCase() === row.parent_name.toLowerCase()) ||
            (row.parent_slug && c.slug === row.parent_slug)
          );
          
          if (parent) {
            categoryData.parent_id = parent.id;
          } else if (row.parent_name || row.parent_slug) {
            // Create parent if it doesn't exist (for nested imports)
            const parentSlug = row.parent_slug || generateSlug(row.parent_name!, existingSlugs);
            existingSlugs.add(parentSlug);
            
            const { data: newParent, error: parentError } = await supabase
              .from('categories')
              .insert([{
                name: row.parent_name!.trim(),
                slug: parentSlug,
                sort_order: (categories.length + i) * 10,
                is_active: true,
                created_at: new Date().toISOString(),
              }])
              .select()
              .single();

            if (parentError) throw parentError;
            
            categoryData.parent_id = newParent.id;
            success++;
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

  const moveCategoryOrder = async (categoryId: string, direction: 'up' | 'down') => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const siblings = categories.filter(c => 
      c.parent_id === category.parent_id && c.id !== categoryId
    );
    
    const allSiblings = [...siblings, category].sort((a, b) => a.sort_order - b.sort_order);
    const currentIndex = allSiblings.findIndex(c => c.id === categoryId);
    
    if (
      (direction === 'up' && currentIndex > 0) ||
      (direction === 'down' && currentIndex < allSiblings.length - 1)
    ) {
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      [allSiblings[currentIndex], allSiblings[newIndex]] = 
      [allSiblings[newIndex], allSiblings[currentIndex]];
      
      // Update sort orders
      const updates = allSiblings.map((cat, index) => ({
        id: cat.id,
        sort_order: (index + 1) * 10
      }));

      try {
        const { error } = await supabase
          .from('categories')
          .upsert(updates);

        if (error) throw error;
        
        fetchCategories();
        toast({ title: 'Category order updated' });
      } catch (error: any) {
        console.error('Error updating order:', error);
        toast({
          title: 'Error',
          description: 'Failed to update category order',
          variant: 'destructive'
        });
      }
    }
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
    const visibleIds = new Set(filteredCategories.map(c => c.id));
    setSelectedCategories(visibleIds);
  };

  const clearSelection = () => {
    setSelectedCategories(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Advanced Category Manager</h1>
          <p className="text-muted-foreground">Intelligent hierarchical category management</p>
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
                  {form.parent_id && (
                    <p className="text-xs text-muted-foreground">
                      Will become a subcategory of {categories.find(c => c.id === form.parent_id)?.name}
                    </p>
                  )}
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
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={form.meta_title}
                      onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                      placeholder="For SEO"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder="For SEO - appears in search results"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="is_active"
                      checked={form.is_active}
                      onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active (visible to customers)</Label>
                  </div>
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
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
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Selected</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{selectedCategories.size}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCategories.size > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearSelection}>
                Clear
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Max Depth</CardDescription>
            <CardTitle className="text-2xl">
              {Math.max(...categories.map(c => c.level || 0), 0)}
            </CardTitle>
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
                  onClick={() => handleBulkOperation({
                    type: 'activate',
                    categoryIds: Array.from(selectedCategories)
                  })}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation({
                    type: 'deactivate',
                    categoryIds: Array.from(selectedCategories)
                  })}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
                <Dialog open={bulkMoveDialogOpen} onOpenChange={setBulkMoveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Move To
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Move Selected Categories</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Select value={bulkMoveTarget} onValueChange={setBulkMoveTarget}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Move to Root</SelectItem>
                          {categories
                            .filter(c => !Array.from(selectedCategories).includes(c.id))
                            .map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => {
                          handleBulkOperation({
                            type: 'move',
                            categoryIds: Array.from(selectedCategories),
                            data: { parentId: bulkMoveTarget || null }
                          });
                          setBulkMoveDialogOpen(false);
                          setBulkMoveTarget('');
                        }}
                      >
                        Move Categories
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                        onClick={() => handleBulkOperation({
                          type: 'delete',
                          categoryIds: Array.from(selectedCategories)
                        })}
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
                  placeholder="Search categories by name, slug, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="show-inactive" className="text-sm whitespace-nowrap">
                  <Switch
                    id="show-inactive"
                    checked={showInactive}
                    onCheckedChange={setShowInactive}
                    className="mr-2"
                  />
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
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
                    <SortableContext
                      items={filteredCategories.map(c => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredCategories.map((category) => (
                        <SortableCategoryRow
                          key={category.id}
                          category={category}
                          onEdit={openEditDialog}
                          onDelete={deleteCategory}
                          isExpanded={expandedCategories.has(category.id)}
                          onToggle={toggleCategoryExpand}
                          viewMode={viewMode}
                          onMove={moveCategoryOrder}
                        />
                      ))}
                    </SortableContext>
                  </TableBody>
                </Table>
              </DndContext>
              
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
            image_url: 'https://example.com/electronics.jpg',
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

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common category management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => {
                // Auto-generate missing slugs
                const updates = categories
                  .filter(cat => !validateSlug(cat.slug))
                  .map(cat => ({
                    id: cat.id,
                    slug: generateSlug(cat.name, new Set(categories.map(c => c.slug).filter(s => s !== cat.slug)))
                  }));
                
                if (updates.length > 0) {
                  supabase
                    .from('categories')
                    .upsert(updates)
                    .then(() => {
                      toast({ title: `Fixed ${updates.length} invalid slugs` });
                      fetchCategories();
                    });
                } else {
                  toast({ title: 'All slugs are valid!' });
                }
              }}
            >
              <Zap className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Fix Invalid Slugs</div>
                <div className="text-xs text-muted-foreground">Auto-correct malformed slugs</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={async () => {
                // Reorder all categories
                const updates = flatCategories.map((cat, index) => ({
                  id: cat.id,
                  sort_order: (index + 1) * 10
                }));
                
                const { error } = await supabase
                  .from('categories')
                  .upsert(updates);
                
                if (error) {
                  toast({
                    title: 'Error',
                    description: 'Failed to reorder categories',
                    variant: 'destructive'
                  });
                } else {
                  toast({ title: 'Categories reordered successfully' });
                  fetchCategories();
                }
              }}
            >
              <Layers className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Reorder All</div>
                <div className="text-xs text-muted-foreground">Reset sort order by current view</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => {
                // Deactivate empty categories
                const emptyCategories = categories.filter(cat => (cat.productCount || 0) === 0);
                
                if (emptyCategories.length > 0) {
                  handleBulkOperation({
                    type: 'deactivate',
                    categoryIds: emptyCategories.map(c => c.id)
                  });
                } else {
                  toast({ title: 'No empty categories found' });
                }
              }}
            >
              <AlertCircle className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Deactivate Empty</div>
                <div className="text-xs text-muted-foreground">Deactivate categories with no products</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
