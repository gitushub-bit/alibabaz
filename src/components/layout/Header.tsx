import { Search, Camera, ShoppingCart, User, Menu, MessageSquare, Globe, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/hooks/useCurrency";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { LocalizationSelector } from "@/components/profile/LocalizationSelector";
import { DeliverToModal } from "@/components/DeliverToModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; }[]>([]);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeliver, setOpenDeliver] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageSearching, setImageSearching] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { itemCount } = useCart();
  const { user, signOut, isAdmin } = useAuth();
  const { countryCode, getCountryFlag } = useCurrency();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name, slug").is("parent_id", null).limit(8);
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setShowImageSearch(true);
  };

  const handleImageSearch = async () => {
    if (!previewImage) return;
    
    setImageSearching(true);
    
    try {
      // For demo purposes, extract keywords from image using AI
      // In production, this would use a proper image recognition API
      toast({ 
        title: 'Image Search', 
        description: 'Analyzing image to find similar products...' 
      });
      
      // Simulate image analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to products with image search indicator
      navigate('/products?imageSearch=true');
      setShowImageSearch(false);
      setPreviewImage(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process image', variant: 'destructive' });
    } finally {
      setImageSearching(false);
    }
  };

  const clearImageSearch = () => {
    setPreviewImage(null);
    setShowImageSearch(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        {/* ================= MAIN BAR ================= */}
        <div className="px-4 md:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileMenu(true)}>
              <Menu className="h-6 w-6" />
            </Button>

            {/* Logo */}
            <Link to="/" className="shrink-0 mx-auto md:mx-0">
              <img src={logo} alt="Logo" className="h-14 md:h-16 lg:h-20 w-auto" />
            </Link>

            {/* Compact Search (Non-Home Pages - Desktop) */}
            {!isHomePage && (
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className="flex items-center w-full bg-muted/50 border border-border rounded-lg overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button 
                    className="px-2 py-2 hover:bg-muted transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    title="Search by image"
                  >
                    <Camera className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <Button size="sm" variant="ghost" className="rounded-none h-full" onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Right Icons */}
            <div className="hidden md:flex items-center gap-4 text-xs">
              {/* Deliver To */}
              <div className="flex flex-col leading-tight cursor-pointer" onClick={() => setOpenDeliver(true)}>
                <span className="text-muted-foreground">{t("nav.deliverTo")}:</span>
                <span className="font-medium">{getCountryFlag(countryCode)} {countryCode}</span>
              </div>

              {/* Global */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button><Globe className="h-4 w-4" /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <LocalizationSelector />
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
                <MessageSquare className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/cart")}>
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    {itemCount > 99 ? "99+" : itemCount}
                  </Badge>
                )}
              </Button>

              {/* User */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>{t("common.profile")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/orders")}>{t("common.orders")}</DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/admin")}>Admin Dashboard</DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>{t("common.signOut")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                  {t("common.signIn")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ================= SUBTITLE ROW ================= */}
        <div className="mt-3 hidden md:flex items-center justify-between text-xs px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-4 whitespace-nowrap">
            <button onMouseEnter={() => setShowMegaMenu(true)} className="hover:text-primary transition-colors">
              All Categories
            </button>
            <Link to="/products?featured=true" className="hover:text-primary transition-colors">
              Featured Selections
            </Link>
            <Link to="/buyer/rfq/new" className="hover:text-primary transition-colors">
              Order Protections
            </Link>
          </div>

          <div className="flex items-center gap-4 whitespace-nowrap">
            <Link to="#" className="hover:text-primary transition-colors">Connect on WhatsApp</Link>
            <Link to="/help" className="hover:text-primary transition-colors">Help Center</Link>
            <Link to="#" className="hover:text-primary transition-colors">App & Extension</Link>
            <Link to="/seller" className="hover:text-primary transition-colors">Sell on our platform</Link>
          </div>
        </div>

        <MegaMenu isOpen={showMegaMenu} onClose={() => setShowMegaMenu(false)} />

        {/* ================= FULL SEARCH (HOME ONLY) ================= */}
        {isHomePage && (
          <>
            {/* Desktop */}
            <div className="hidden md:block bg-white py-px border border-secondary">
              <div className="max-w-4xl border rounded-2xl bg-primary-foreground border-secondary-foreground py-[25px] px-[24px] mx-[100px] my-[10px]">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden flex items-center">
                  <input
                    type="text"
                    placeholder={t("hero.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 px-4 py-3 text-sm outline-none"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button 
                    className="px-4 py-2 border-l hover:bg-muted transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    title="Search by image"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <Button className="rounded-none px-8 h-full" onClick={handleSearch}>
                    <Search className="h-5 w-5 mr-2" />
                    {t("common.search")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div className="px-4 py-3 md:hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border bg-muted/50 border-primary">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("hero.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button onClick={() => fileInputRef.current?.click()}>
                  <Camera className="w-4 h-4 text-muted-foreground" />
                </button>
                <Button size="sm" onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Compact Mobile Search (Non-Home) */}
        {!isHomePage && (
          <div className="px-4 py-2 md:hidden">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/50 border-border">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 bg-transparent outline-none text-sm min-w-0"
              />
              <button onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </header>

      <MobileMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
      <DeliverToModal open={openDeliver} setOpen={setOpenDeliver} />

      {/* Image Search Dialog */}
      <Dialog open={showImageSearch} onOpenChange={setShowImageSearch}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Search by Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewImage && (
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="Search preview" 
                  className="w-full h-48 object-contain rounded-lg border bg-muted"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-background/80"
                  onClick={clearImageSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              We'll analyze this image to find similar products in our catalog.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={clearImageSearch}>
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleImageSearch}
                disabled={imageSearching}
              >
                {imageSearching ? 'Searching...' : 'Find Similar Products'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};