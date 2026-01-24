import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  Save,
  Layout,
  Image,
  Type,
  Star,
  TrendingUp,
  Users,
  Tag,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff
} from 'lucide-react';

interface HeroBanner {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  backgroundImage: string;
  enabled: boolean;
}

interface FeaturedSection {
  enabled: boolean;
  title: string;
  itemCount: number;
}

interface SiteContent {
  heroBanner: HeroBanner;
  topDeals: FeaturedSection;
  featuredCategories: FeaturedSection;
  featuredSuppliers: FeaturedSection;
  trendingProducts: FeaturedSection;
  rfqBanner: { enabled: boolean; title: string; description: string };
  actionCards: { enabled: boolean };
  browsingHistory: { enabled: boolean };
}

const defaultContent: SiteContent = {
  heroBanner: {
    title: 'The leading B2B ecommerce platform for global trade',
    subtitle: 'Find products and suppliers for your business',
    searchPlaceholder: 'Search products, suppliers, or categories',
    backgroundImage: '',
    enabled: true,
  },
  topDeals: { enabled: true, title: 'Top Deals', itemCount: 8 },
  featuredCategories: { enabled: true, title: 'Featured Categories', itemCount: 8 },
  featuredSuppliers: { enabled: true, title: 'Featured Suppliers', itemCount: 6 },
  trendingProducts: { enabled: true, title: 'Trending Now', itemCount: 8 },
  rfqBanner: { 
    enabled: true, 
    title: 'Request for Quotation', 
    description: 'Tell suppliers what you need and get quotes from verified sellers'
  },
  actionCards: { enabled: true },
  browsingHistory: { enabled: true },
};

export default function AdminSiteContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultContent);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('key', 'site_content')
      .single();

    if (data?.value) {
      try {
        const savedContent = typeof data.value === 'string' 
          ? JSON.parse(data.value) 
          : data.value;
        setContent({ ...defaultContent, ...savedContent });
      } catch {
        setContent(defaultContent);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'site_content', value: JSON.parse(JSON.stringify(content)) }], { onConflict: 'key' });
      toast({ title: 'Site content saved successfully' });
    } catch (error: any) {
      toast({ title: 'Error saving content', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateHeroBanner = (field: keyof HeroBanner, value: string | boolean) => {
    setContent({
      ...content,
      heroBanner: { ...content.heroBanner, [field]: value }
    });
  };

  const updateSection = (
    section: keyof SiteContent, 
    field: string, 
    value: string | boolean | number
  ) => {
    setContent({
      ...content,
      [section]: { ...(content[section] as object), [field]: value }
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Content</h1>
          <p className="text-muted-foreground">Manage homepage sections and content</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full">
          <TabsTrigger value="hero" className="gap-2">
            <Image className="h-4 w-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="deals" className="gap-2">
            <Tag className="h-4 w-4" />
            Deals
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Layout className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Users className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="other" className="gap-2">
            <Star className="h-4 w-4" />
            Other
          </TabsTrigger>
        </TabsList>

        {/* Hero Banner */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Hero Banner
                  </CardTitle>
                  <CardDescription>Configure the main hero section on the homepage</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="hero-enabled">Enabled</Label>
                  <Switch
                    id="hero-enabled"
                    checked={content.heroBanner.enabled}
                    onCheckedChange={(checked) => updateHeroBanner('enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Title</Label>
                <Input
                  id="hero-title"
                  value={content.heroBanner.title}
                  onChange={(e) => updateHeroBanner('title', e.target.value)}
                  placeholder="Main headline"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Input
                  id="hero-subtitle"
                  value={content.heroBanner.subtitle}
                  onChange={(e) => updateHeroBanner('subtitle', e.target.value)}
                  placeholder="Supporting text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-search">Search Placeholder</Label>
                <Input
                  id="hero-search"
                  value={content.heroBanner.searchPlaceholder}
                  onChange={(e) => updateHeroBanner('searchPlaceholder', e.target.value)}
                  placeholder="Search placeholder text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-bg">Background Image URL</Label>
                <Input
                  id="hero-bg"
                  value={content.heroBanner.backgroundImage}
                  onChange={(e) => updateHeroBanner('backgroundImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Deals */}
        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Top Deals Section
                  </CardTitle>
                  <CardDescription>Configure the deals section on the homepage</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Enabled</Label>
                  <Switch
                    checked={content.topDeals.enabled}
                    onCheckedChange={(checked) => updateSection('topDeals', 'enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={content.topDeals.title}
                  onChange={(e) => updateSection('topDeals', 'title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Number of Items to Display</Label>
                <Input
                  type="number"
                  min={4}
                  max={16}
                  value={content.topDeals.itemCount}
                  onChange={(e) => updateSection('topDeals', 'itemCount', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Categories */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    Featured Categories
                  </CardTitle>
                  <CardDescription>Configure the categories section on the homepage</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Enabled</Label>
                  <Switch
                    checked={content.featuredCategories.enabled}
                    onCheckedChange={(checked) => updateSection('featuredCategories', 'enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={content.featuredCategories.title}
                  onChange={(e) => updateSection('featuredCategories', 'title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Number of Categories to Display</Label>
                <Input
                  type="number"
                  min={4}
                  max={12}
                  value={content.featuredCategories.itemCount}
                  onChange={(e) => updateSection('featuredCategories', 'itemCount', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Suppliers */}
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Featured Suppliers
                  </CardTitle>
                  <CardDescription>Configure the suppliers section on the homepage</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Enabled</Label>
                  <Switch
                    checked={content.featuredSuppliers.enabled}
                    onCheckedChange={(checked) => updateSection('featuredSuppliers', 'enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={content.featuredSuppliers.title}
                  onChange={(e) => updateSection('featuredSuppliers', 'title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Number of Suppliers to Display</Label>
                <Input
                  type="number"
                  min={3}
                  max={12}
                  value={content.featuredSuppliers.itemCount}
                  onChange={(e) => updateSection('featuredSuppliers', 'itemCount', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trending Products */}
        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trending Products
                  </CardTitle>
                  <CardDescription>Configure the trending section on the homepage</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Enabled</Label>
                  <Switch
                    checked={content.trendingProducts.enabled}
                    onCheckedChange={(checked) => updateSection('trendingProducts', 'enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={content.trendingProducts.title}
                  onChange={(e) => updateSection('trendingProducts', 'title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Number of Products to Display</Label>
                <Input
                  type="number"
                  min={4}
                  max={16}
                  value={content.trendingProducts.itemCount}
                  onChange={(e) => updateSection('trendingProducts', 'itemCount', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Sections */}
        <TabsContent value="other" className="space-y-6">
          {/* RFQ Banner */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>RFQ Banner</CardTitle>
                  <CardDescription>Request for Quotation promotional section</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Enabled</Label>
                  <Switch
                    checked={content.rfqBanner.enabled}
                    onCheckedChange={(checked) => updateSection('rfqBanner', 'enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={content.rfqBanner.title}
                  onChange={(e) => updateSection('rfqBanner', 'title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={content.rfqBanner.description}
                  onChange={(e) => updateSection('rfqBanner', 'description', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Cards */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Action Cards</CardTitle>
                  <CardDescription>Quick action buttons section</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Enabled</Label>
                  <Switch
                    checked={content.actionCards.enabled}
                    onCheckedChange={(checked) => updateSection('actionCards', 'enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Browsing History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Browsing History</CardTitle>
                  <CardDescription>Show recently viewed products section</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Enabled</Label>
                  <Switch
                    checked={content.browsingHistory.enabled}
                    onCheckedChange={(checked) => updateSection('browsingHistory', 'enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
