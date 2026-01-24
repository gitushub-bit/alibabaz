import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface RFQBanner {
  enabled: boolean;
  title: string;
  description: string;
}

export interface SiteContent {
  heroBanner: HeroBanner;
  topDeals: FeaturedSection;
  featuredCategories: FeaturedSection;
  featuredSuppliers: FeaturedSection;
  trendingProducts: FeaturedSection;
  rfqBanner: RFQBanner;
  actionCards: { enabled: boolean };
  browsingHistory: { enabled: boolean };
}

const defaultContent: SiteContent = {
  heroBanner: {
    title: 'The leading B2B ecommerce platform for global trade',
    subtitle: 'Connect with verified suppliers, discover millions of products',
    searchPlaceholder: 'Search for products, suppliers, or categories...',
    backgroundImage: '',
    enabled: true,
  },
  topDeals: { enabled: true, title: 'Top Deals', itemCount: 8 },
  featuredCategories: { enabled: true, title: 'Browse Categories', itemCount: 8 },
  featuredSuppliers: { enabled: true, title: 'Featured Suppliers', itemCount: 6 },
  trendingProducts: { enabled: true, title: 'Trending Now', itemCount: 8 },
  rfqBanner: {
    enabled: true,
    title: 'Post a Buying Request',
    description: 'Tell us what you need and get quotes from verified suppliers'
  },
  actionCards: { enabled: true },
  browsingHistory: { enabled: true },
};

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'site_content')
      .maybeSingle();

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

  return { content, loading, refetch: fetchContent };
}
