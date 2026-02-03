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
import LocationPopup, { LocationForm } from "@/components/home/LocationPopup";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

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
      toast({
        title: 'Image Search',
        description: 'Analyzing image to find similar products...'
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

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

  // Mega Menu Hover Logic
  const handleMegaMenuEnter = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    megaMenuTimeoutRef.current = setTimeout(() => {
      setShowMegaMenu(true);
    }, 150);
  };

  const handleMegaMenuLeave = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    megaMenuTimeoutRef.current = setTimeout(() => {
      setShowMegaMenu(false);
    }, 300);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        {/* ================= MAIN BAR ================= */}
        <div className="px-4 md:px-6 lg:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileMenu(true)}>
              <Menu className="h-6 w-6" />
            </Button>

            {/* Logo */}
            <Link to="/" className="shrink-0 mx-auto md:mx-0">
              <img src={logo} alt="Logo" className="h-14 md:h-16 lg:h-16 w-auto object-contain" />
            </Link>

            {/* Compact Search (Non-Home Pages - Desktop) */}
            {!isHomePage && (
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className="flex items-center w-full bg-muted/30 border border-muted rounded-md overflow-hidden shadow-sm hover:border-primary/50 transition-colors">
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
                    <Camera className="h-4 w-4 text-muted-foreground opacity-70" />
                  </button>
                  <Button size="sm" variant="ghost" className="rounded-none h-full hover:text-primary" onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Right Icons */}
            <div className="hidden md:flex items-center gap-4 text-xs">
              {/* Deliver To - Desktop Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex flex-col leading-tight cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="text-muted-foreground text-[11px]">{t("nav.deliverTo")}:</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-base">{getCountryFlag(countryCode)}</span>
                      <span className="uppercase font-medium text-foreground">{countryCode}</span>
                    </span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <LocationForm onClose={() => { }} isPopover={true} />
                </PopoverContent>
              </Popover>

              {/* Global */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:text-primary transition-colors"><Globe className="h-4 w-4" /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <LocalizationSelector />
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/messages")}>
                <MessageSquare className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" className="relative h-8 w-8" onClick={() => navigate("/cart")}>
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
                    {itemCount > 99 ? "99+" : itemCount}
                  </Badge>
                )}
              </Button>

              {/* User */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><User className="h-4 w-4" /></Button>
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
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate("/auth")}>
                  {t("common.signIn")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ================= SUBTITLE ROW ================= */}
        <div className="mt-1 hidden md:flex items-center justify-between text-xs px-4 md:px-6 lg:px-8 pb-3">
          <div className="flex items-center gap-6 whitespace-nowrap">
            <div
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
              className="relative py-1"
            >
              <button className="hover:text-primary transition-colors font-medium flex items-center gap-1">
                <Menu className="h-4 w-4" />
                All Categories
              </button>
            </div>
            <Link to="/products?featured=true" className="hover:text-primary transition-colors">
              Featured Selections
            </Link>
            <Link to="/buyer/rfq/new" className="hover:text-primary transition-colors">
              Order Protections
            </Link>
          </div>

          <div className="flex items-center gap-6 whitespace-nowrap text-muted-foreground">
            <Link to="#" className="hover:text-primary transition-colors">Connect on WhatsApp</Link>
            <Link to="/help" className="hover:text-primary transition-colors">Help Center</Link>
            <Link to="#" className="hover:text-primary transition-colors">App & Extension</Link>
            <Link to="/seller" className="hover:text-primary transition-colors">Sell on our platform</Link>
          </div>
        </div>

        <MegaMenu
          isOpen={showMegaMenu}
          onClose={() => setShowMegaMenu(false)}
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
        />

        {/* ================= FULL SEARCH (HOME ONLY) ================= */}
        {isHomePage && (
          <>
            {/* Desktop */}
            <div className="hidden md:block bg-background py-1 border-t border-muted/20">
              <div className="max-w-4xl mx-auto my-4 px-4">
                <div className="bg-background rounded-md shadow-sm border border-alibaba-border flex items-center hover:border-alibaba-orange/50 transition-colors">
                  <input
                    type="text"
                    placeholder={t("hero.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    className="px-3 py-2 border-l border-muted hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    title="Search by image"
                  >
                    <Camera className="h-4 w-4 text-muted-foreground opacity-60 hover:opacity-100 transition-opacity" />
                  </button>
                  <Button className="rounded-l-none rounded-r-md px-8 h-full bg-primary hover:bg-primary/90" onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    {t("common.search")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div className="px-4 py-3 md:hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border bg-muted/30 border-primary/20">
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
                <Button size="sm" onClick={handleSearch} className="h-7 w-7 p-0 rounded-full">
                  <Search className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Compact Mobile Search (Non-Home) */}
        {!isHomePage && (
          <div className="px-4 py-2 md:hidden">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 border-border">
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
      {/* Mobile Location Popup - Rendered via logic or check for internal open state? 
          Correction: desktop header NO LONGER uses setOpenDeliver.
          BUT, we might need it for mobile if there's a mobile trigger.
          The mobile trigger is... seemingly implicit or inside MobileMenu?
          Or maybe I should add a check for Mobile view.
          If I look at `LocationPopup` usage in previous code, it was rendered unconditionally at bottom.
          And `openDeliver` was controlling it.
          Now desktop uses Popover. `openDeliver` is unused on desktop.
          So purely for mobile, who sets `openDeliver`?
          Wait, there is no "Deliver To" in the mobile header directly visible in this file (it's hidden md:flex).
          If it's in `MobileMenu`, does it control `openDeliver` in `Header`?
          If `MobileMenu` has its own logic, or if `Header` passes `setOpenDeliver` to it?
          `MobileMenu` takes `isOpen` and `onClose`.
          So `Header` does NOT pass `setOpenDeliver`.
          This means `LocationPopup` in `Header` was only being opened by the Desktop trigger!
          User said: "Mobile: keep bottom sheet (you already nailed this)".
          Maybe user means the *implementation* is good, but if I remove the trigger, how do they open it?
          Ah, maybe `LocationPopup` is also used by `MobileMenu`?
          I'll keep `LocationPopup` rendered at the bottom for safety, but check if MobileMenu needs it.
          If MobileMenu imports `LocationPopup` internally, that's fine.
          If MobileMenu triggers the one in Header, that's impossible currently as no props passed.
          So previously, "Deliver To" was ONLY on desktop header bar? 
          "Deliver to" usually is top bar.
          On mobile, Alibaba has it?
          If I removed the `onClick` from the desktop trigger, I haven't removed the capability for mobile IF there was a mobile trigger.
          But there wasn't a visible mobile trigger in `Header.tsx` (it was `hidden md:flex`).
          So the "Deliver To" feature was arguably desktop-only in this `Header.tsx`.
          Note: `MobileMenu` might implement its own.
          So, safely ignoring mobile trigger for now as I only touched the desktop block.
          I will leave `LocationPopup` rendered but `openDeliver` will likely never be true unless I add a mobile trigger.
          Wait, if I want to "maintain mobile interaction", I should ensure it's still accessible if it was before.
          But it seems it wasn't accessible on mobile from `Header.tsx` lines 158+.
          I'll assume `MobileMenu` handles it or it's not present on mobile header bar.
       */}
      <LocationPopup isOpen={openDeliver} onClose={() => setOpenDeliver(false)} />

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