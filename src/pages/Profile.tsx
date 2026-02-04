import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from '@/hooks/useCurrency';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { LocalizationSelector } from '@/components/profile/LocalizationSelector';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { countries, getCountryByName } from '@/data/countries';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Package,
  MessageCircle,
  ShoppingCart,
  Heart,
  Ticket,
  Store,
  HelpCircle,
  Settings,
  LogOut,
  Edit2,
  Shield,
  MapPin,
  Phone,
  Mail,
  Building,
  Download,
} from 'lucide-react';
import logo from '@/assets/logo.png';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  address_line1: string | null;
}

interface Supplier {
  verified: boolean;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: string | number;
  showBadge?: boolean;
  rightContent?: React.ReactNode;
  authRequired?: boolean;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin, role, signOut } = useAuth();
  const { itemCount } = useCart();
  const { countryCode, setCountryCode, getCountryFlag, currency } = useCurrency();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordersCount, setOrdersCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);

  useEffect(() => {
    if (!authLoading) {
      if (isAdmin) {
        navigate('/admin');
        return;
      }

      if (user) {
        fetchProfileData();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, isAdmin, navigate]);

  const fetchProfileData = async () => {
    if (!user) return;

    setLoading(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      // Sync country from profile to currency context
      if (profileData.country) {
        const country = getCountryByName(profileData.country);
        if (country) {
          setCountryCode(country.code);
        }
      }
    }

    // Fetch supplier info if seller
    if (role === 'seller') {
      const { data: supplierData } = await supabase
        .from('suppliers')
        .select('verified')
        .eq('user_id', user.id)
        .single();

      if (supplierData) {
        setSupplier(supplierData);
      }
    }

    // Fetch counts
    const [ordersRes, favoritesRes, messagesRes] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('buyer_id', user.id),
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('sender_id', user.id).eq('read', false),
    ]);

    setOrdersCount(ordersRes.count || 0);
    setFavoritesCount(favoritesRes.count || 0);
    setMessagesCount(messagesRes.count || 0);

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({ title: 'Signed out successfully' });
  };

  const handleCountryChange = async (country: { code: string; name: string }) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ country: country.name })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error updating country', variant: 'destructive' });
    } else {
      setProfile(prev => prev ? { ...prev, country: country.name } : null);
      toast({ title: 'Country updated successfully' });
    }
  };

  const selectedCountry = countries.find(c => c.code === countryCode);

  const mainMenuItems: MenuItem[] = [
    {
      icon: <Package className="h-5 w-5 text-muted-foreground" />,
      label: 'Manage Orders',
      onClick: () => navigate('/orders'),
      badge: ordersCount > 0 ? ordersCount : undefined,
      authRequired: true,
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-muted-foreground" />,
      label: 'Messenger',
      onClick: () => navigate('/messages'),
      badge: messagesCount > 0 ? messagesCount : undefined,
      authRequired: true,
    },
    {
      icon: <ShoppingCart className="h-5 w-5 text-muted-foreground" />,
      label: 'Shopping Cart',
      onClick: () => navigate('/cart'),
      badge: itemCount > 0 ? itemCount : undefined,
      showBadge: true,
    },
    {
      icon: <Heart className="h-5 w-5 text-muted-foreground" />,
      label: 'My Favorites',
      onClick: () => user ? navigate('/buyer/favorites') : navigate('/auth?redirect=/buyer/favorites'),
      badge: favoritesCount > 0 ? favoritesCount : undefined,
      authRequired: true,
    },
    {
      icon: <Ticket className="h-5 w-5 text-muted-foreground" />,
      label: 'My Coupons',
      onClick: () => toast({ title: 'Coming Soon', description: 'Coupons feature will be available soon' }),
      authRequired: true,
    },
    {
      icon: <Store className="h-5 w-5 text-muted-foreground" />,
      label: role === 'seller' ? 'Seller Dashboard' : 'How to sell on the platform',
      onClick: () => role === 'seller' ? navigate('/seller') : navigate('/auth?mode=signup&role=seller'),
    },
    {
      icon: <HelpCircle className="h-5 w-5 text-muted-foreground" />,
      label: 'Help Center',
      onClick: () => navigate('/help'),
    },
  ];

  const secondaryMenuItems: MenuItem[] = [
    {
      icon: <Settings className="h-5 w-5 text-muted-foreground" />,
      label: 'Settings',
      onClick: () => navigate('/buyer'),
      authRequired: true,
    },
    {
      icon: <Download className="h-5 w-5 text-muted-foreground" />,
      label: 'Download App',
      onClick: () => toast({ title: 'App Download', description: 'Mobile app coming soon!' }),
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main className="container mx-auto max-w-lg">
          <div className="p-4 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background border-b md:hidden">
        <div className="flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="flex-1 text-center font-semibold">My Account</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      <main className="container mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl">
        {/* Profile Section */}
        <div className="bg-background p-4 md:p-6 md:mt-6 md:rounded-lg md:shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
                )}
              </div>
              {/* Seller verified badge */}
              {role === 'seller' && supplier?.verified && (
                <div className="absolute -bottom-1 -right-1">
                  <VerifiedBadge size="sm" />
                </div>
              )}
            </div>

            {user ? (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-lg truncate">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </h2>
                  {role === 'seller' && (
                    <Badge variant="secondary" className="text-xs">
                      <Store className="h-3 w-3 mr-1" />
                      Seller
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/buyer')}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                {profile?.company_name && (
                  <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {profile.company_name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </p>
                {profile?.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {profile.phone}
                  </p>
                )}
                {(profile?.city || profile?.country) && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[profile.city, profile.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-2">
                <p className="text-muted-foreground text-sm">Sign in to access your account</p>
                <div className="flex gap-2">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/auth?mode=signup')}
                  >
                    Register
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {user && (
          <div className="grid grid-cols-3 gap-2 p-4 md:p-0 md:mt-4">
            <button
              onClick={() => navigate('/orders')}
              className="bg-background p-4 rounded-lg text-center hover:bg-muted/50 transition-colors md:shadow-sm"
            >
              <p className="text-2xl font-bold text-primary">{ordersCount}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </button>
            <button
              onClick={() => navigate('/buyer/favorites')}
              className="bg-background p-4 rounded-lg text-center hover:bg-muted/50 transition-colors md:shadow-sm"
            >
              <p className="text-2xl font-bold text-primary">{favoritesCount}</p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="bg-background p-4 rounded-lg text-center hover:bg-muted/50 transition-colors md:shadow-sm"
            >
              <p className="text-2xl font-bold text-primary">{messagesCount}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </button>
          </div>
        )}

        {/* Main Menu */}
        <div className="bg-background mt-2 md:mt-4 md:rounded-lg md:shadow-sm">
          {mainMenuItems.map((item, index) => {
            // Skip auth-required items for non-logged users (except show differently)
            const handleClick = () => {
              if (item.authRequired && !user) {
                navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname));
                return;
              }
              item.onClick();
            };

            return (
              <div key={index}>
                <button
                  onClick={handleClick}
                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {item.icon}
                    <span className="text-sm md:text-base">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge !== undefined && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </button>
                {index < mainMenuItems.length - 1 && <Separator className="ml-14" />}
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-2 bg-muted/50" />

        {/* Localization Settings - Single Unified Button */}
        <div className="bg-background md:mt-4 md:rounded-lg md:shadow-sm">
          <LocalizationSelector onCountryChange={handleCountryChange} />
        </div>

        {/* Divider */}
        <div className="h-2 bg-muted/50" />

        {/* Secondary Menu */}
        <div className="bg-background md:mt-4 md:rounded-lg md:shadow-sm">
          {secondaryMenuItems.map((item, index) => {
            const handleClick = () => {
              if (item.authRequired && !user) {
                navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname));
                return;
              }
              item.onClick();
            };

            return (
              <div key={index}>
                <button
                  onClick={handleClick}
                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {item.icon}
                    <span className="text-sm md:text-base">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
                {index < secondaryMenuItems.length - 1 && <Separator className="ml-14" />}
              </div>
            );
          })}
        </div>

        {/* Sign Out (only if logged in) */}
        {user && (
          <div className="bg-background mt-2 md:mt-4 md:rounded-lg md:shadow-sm">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors text-destructive"
            >
              <div className="flex items-center gap-4">
                <LogOut className="h-5 w-5" />
                <span className="text-sm md:text-base">Sign Out</span>
              </div>
            </button>
          </div>
        )}

        {/* Trade Assurance Banner */}
        <div className="bg-background mt-2 md:mt-4 md:rounded-lg md:shadow-sm p-4 mb-4">
          <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Shop with confidence</p>
              <p className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Trade Assurance
              </p>
              <p className="text-xs text-muted-foreground">protects your orders</p>
            </div>
            <img
              src={logo}
              alt="Trade Assurance"
              className="h-12 w-12 object-contain"
            />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
