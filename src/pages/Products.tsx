import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import AlibabaHeader from '@/components/layout/AlibabaHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from '@/hooks/use-toast';
import {
  Grid3X3, List, Shield, Heart, Package, Clock, ShoppingCart, ChevronRight, SlidersHorizontal
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';

// New Components
import { FilterSidebar } from '@/components/product/FilterSidebar';
import { ActiveFilters } from '@/components/product/ActiveFilters';
import { QuickFilters } from '@/components/product/QuickFilters';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  moq: number | null;
  unit: string | null;
  images: string[] | null;
  verified: boolean | null;
  published: boolean | null;
  seller_id: string;
  category_id: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SupplierInfo {
  user_id: string;
  verified: boolean | null;
  year_established: number | null;
  response_rate: number | null;
}

interface ProfileInfo {
  user_id: string;
  company_name: string | null;
  full_name: string | null;
  country: string | null;
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { formatPriceOnly } = useCurrency();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Map<string, SupplierInfo>>(new Map());
  const [profiles, setProfiles] = useState<Map<string, ProfileInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // Filter States
  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'best-match';
  const verifiedOnly = searchParams.get('verified') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Advanced Filter States
  const ratingParams = searchParams.get('rating');
  const ratings = ratingParams ? ratingParams.split(',').map(Number) : [];

  const locationParams = searchParams.get('locations');
  const locations = locationParams ? locationParams.split(',') : [];

  const moqRange = searchParams.get('moq') || '';

  useEffect(() => {
    fetchCategories();
    fetchFavorites();
  }, [user]);

  useEffect(() => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
    fetchProducts(0);
  }, [query, categorySlug, sortBy, verifiedOnly, minPrice, maxPrice, ratingParams, locationParams, moqRange]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .is('parent_id', null)
      .order('name');

    if (data) setCategories(data);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase.from('favorites').select('product_id').eq('user_id', user.id);
    if (data) setFavorites(new Set(data.map(f => f.product_id)));
  };

  const fetchProducts = async (pageNum: number) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      let categoryId: string | null = null;
      if (categorySlug) {
        const cat = categories.find(c => c.slug === categorySlug);
        if (cat) categoryId = cat.id;
      }

      let queryBuilder = supabase
        .from('products')
        .select('*')
        .eq('published', true);

      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (categoryId) {
        queryBuilder = queryBuilder.eq('category_id', categoryId);
      }

      if (verifiedOnly) {
        queryBuilder = queryBuilder.eq('verified', true);
      }

      if (minPrice) queryBuilder = queryBuilder.gte('price_min', parseFloat(minPrice));
      if (maxPrice) queryBuilder = queryBuilder.lte('price_max', parseFloat(maxPrice));

      if (moqRange) {
        const [minMoq, maxMoq] = moqRange.split('-');
        if (minMoq) queryBuilder = queryBuilder.gte('moq', parseInt(minMoq));
        if (maxMoq && maxMoq !== 'plus') queryBuilder = queryBuilder.lte('moq', parseInt(maxMoq));
      }

      switch (sortBy) {
        case 'price-low':
          queryBuilder = queryBuilder.order('price_min', { ascending: true, nullsFirst: false });
          break;
        case 'price-high':
          queryBuilder = queryBuilder.order('price_min', { ascending: false, nullsFirst: false });
          break;
        case 'newest':
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
          break;
        default:
          queryBuilder = queryBuilder.order('verified', { ascending: false }).order('created_at', { ascending: false });
      }

      queryBuilder = queryBuilder.range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

      const { data: productsData, error } = await queryBuilder;

      if (error) throw error;

      if (productsData) {
        const sellerIds = [...new Set(productsData.map(p => p.seller_id))];

        if (sellerIds.length > 0) {
          const [suppliersRes, profilesRes] = await Promise.all([
            supabase.from('suppliers').select('user_id, verified, year_established, response_rate').in('user_id', sellerIds),
            supabase.from('profiles').select('user_id, company_name, full_name, country').in('user_id', sellerIds)
          ]);

          if (suppliersRes.data) {
            const supplierList = suppliersRes.data as SupplierInfo[];
            const supplierMap = new Map(supplierList.map(s => [s.user_id, s]));
            setSuppliers(prev => new Map([...prev, ...supplierMap]));
          }

          if (profilesRes.data) {
            const profileList = profilesRes.data as ProfileInfo[];
            const profileMap = new Map(profileList.map(p => [p.user_id, p]));
            setProfiles(prev => new Map([...prev, ...profileMap]));
          }
        }

        // Client-side filtering for Location
        let filteredProducts = productsData;

        // Note: For now we are not filtering locations on the client side aggressively to avoid pagination issues
        // without backend support, but valid filtering would happen here if desired.

        if (pageNum === 0) setProducts(productsData);
        else setProducts(prev => [...prev, ...productsData]);

        setHasMore(productsData.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '') newParams.delete(key);
    else newParams.set(key, value);
    setSearchParams(newParams);
  };

  // Helper for toggle filters (boolean/string)
  const updateFilter = (key: string, value: string | boolean) => {
    updateParam(key, value === '' || value === false ? null : String(value));
  };

  const handleRatingChange = (newRatings: number[]) => updateParam('rating', newRatings.length ? newRatings.join(',') : null);
  const handleLocationChange = (newLocations: string[]) => updateParam('locations', newLocations.length ? newLocations.join(',') : null);

  const handleRemoveFilter = (key: string) => {
    if (key === 'price') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('minPrice');
      newParams.delete('maxPrice');
      setSearchParams(newParams);
    } else {
      updateParam(key, null);
    }
  };

  const clearAllFilters = () => setSearchParams({});

  const handleQuickFilter = (type: string) => {
    if (type === 'verified') updateParam('verified', 'true');
    if (type === 'free_shipping') toast({ title: "Filter applied: Free Shipping" });
    if (type === 'new_arrivals') updateParam('sort', 'newest');
    if (type === 'on_sale') toast({ title: "Filter applied: On Sale" });
    if (type === 'trending') toast({ title: "Filter applied: Trending" });
  };

  const toggleFavorite = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/auth');
      return;
    }

    const isFavorite = favorites.has(productId);

    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId);
      setFavorites(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      toast({ title: 'Removed from favorites' });
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, product_id: productId });
      setFavorites(prev => new Set([...prev, productId]));
      toast({ title: 'Added to favorites' });
    }
  };

  const handleAddToInquiry = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const profile = profiles.get(product.seller_id);

    addItem({
      product_id: product.id,
      title: product.title,
      image: product.images?.[0] || '/placeholder.svg',
      price: product.price_min || product.price_max || 0,
      quantity: product.moq || 1,
      moq: product.moq || 1,
      unit: product.unit || 'piece',
      seller_id: product.seller_id,
      seller_name: profile?.company_name || profile?.full_name || 'Seller',
    });

    toast({ title: 'Added to inquiry basket' });
  };

  const currentCategory = categories.find(c => c.slug === categorySlug);

  // FilterSidebar moved to external component

  const ProductCard = ({ product }: { product: Product }) => {
    const supplier = suppliers.get(product.seller_id);
    const profile = profiles.get(product.seller_id);

    return (
      <Link to={`/product/${product.slug}`} className="block group">
        <div className="bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.images?.[0] || '/placeholder.svg'}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Favorite Button */}
            <button
              onClick={(e) => toggleFavorite(product.id, e)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${favorites.has(product.id)
                  ? 'fill-red-500 text-red-500'
                  : 'text-muted-foreground'
                  }`}
              />
            </button>

            {/* Verified Badge */}
            {product.verified && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                <Shield className="h-3 w-3" />
                <span className="hidden sm:inline">Verified</span>
              </div>
            )}

            {/* Price Badge */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
              <div className="text-white font-bold text-sm sm:text-base">
                {product.price_min && product.price_max
                  ? `${formatPriceOnly(product.price_min)} - ${formatPriceOnly(product.price_max)}`
                  : product.price_min
                    ? `From ${formatPriceOnly(product.price_min)}`
                    : 'Contact for price'
                }
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            {/* Title */}
            <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {product.title}
            </h3>

            {/* MOQ */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                MOQ: {product.moq || 1} {product.unit || 'piece'}
              </span>
            </div>

            {/* Supplier Info */}
            {profile && (
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {profile.company_name || profile.full_name || 'Seller'}
                    </p>
                    {supplier && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {supplier.year_established && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {new Date().getFullYear() - supplier.year_established}yrs
                          </span>
                        )}
                        {supplier.response_rate && (
                          <span>{supplier.response_rate}% response</span>
                        )}
                        {profile.country && <span>{profile.country}</span>}
                      </div>
                    )}
                  </div>
                  {supplier?.verified && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border-0">
                      <Shield className="h-2.5 w-2.5 mr-0.5" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={(e) => handleAddToInquiry(product, e)}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add to Inquiry
              </Button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
        <AlibabaHeader />
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <AlibabaHeader />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          {currentCategory && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0" />
              <span className="text-foreground font-medium">{currentCategory.name}</span>
            </>
          )}
        </nav>

        {/* Category Pills - Mobile */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-3 px-3 sm:hidden">
          <button
            onClick={() => updateFilter('category', '')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!categorySlug
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border text-muted-foreground'
              }`}
          >
            All
          </button>
          {categories.slice(0, 10).map(cat => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.slug)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${categorySlug === cat.slug
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {query ? `Results for "${query}"` : currentCategory?.name || 'All Products'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {products.length} products found
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={(v) => updateFilter('sort', v)}>
              <SelectTrigger className="w-[140px] sm:w-[180px] h-9 sm:h-10 bg-card">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best-match">Best Match</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle - Desktop */}
            <div className="hidden sm:flex items-center border rounded-lg bg-card">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 sm:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Filter your product search
                  </SheetDescription>
                </SheetHeader>
                <div className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
                  <FilterSidebar
                    categories={categories}
                    currentCategorySlug={categorySlug}
                    onCategoryChange={(slug) => updateParam('category', slug)}
                    verifiedOnly={verifiedOnly}
                    onVerifiedChange={(checked) => updateParam('verified', checked ? 'true' : null)}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onPriceChange={(min, max) => { updateParam('minPrice', min); updateParam('maxPrice', max); }}
                    rating={ratings}
                    onRatingChange={handleRatingChange}
                    locations={locations}
                    onLocationsChange={handleLocationChange}
                    moqRange={moqRange}
                    onMoqChange={(range) => updateParam('moq', range)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        <ActiveFilters
          filters={{
            category: categorySlug,
            minPrice,
            maxPrice,
            verified: verifiedOnly,
            rating: ratings,
            locations,
            query
          }}
          onRemove={handleRemoveFilter}
          onClearAll={clearAllFilters}
          categories={categories}
        />

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-4 bg-card rounded-xl p-4 border border-border/50">
              <FilterSidebar
                categories={categories}
                currentCategorySlug={categorySlug}
                onCategoryChange={(slug) => updateParam('category', slug)}
                verifiedOnly={verifiedOnly}
                onVerifiedChange={(checked) => updateParam('verified', checked ? 'true' : null)}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={(min, max) => { updateParam('minPrice', min); updateParam('maxPrice', max); }}
                rating={ratings}
                onRatingChange={handleRatingChange}
                locations={locations}
                onLocationsChange={handleLocationChange}
                moqRange={moqRange}
                onMoqChange={(range) => updateParam('moq', range)}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={() => setSearchParams({})}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className={`grid gap-3 md:gap-4 ${viewMode === 'grid'
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1'
                  }`}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      variant="outline"
                      size="lg"
                    >
                      {loadingMore ? 'Loading...' : 'Load More Products'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
