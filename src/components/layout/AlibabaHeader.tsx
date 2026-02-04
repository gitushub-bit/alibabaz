
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ShoppingCart, User, Globe, MessageSquare, ClipboardList,
    ToggleLeft as Toggle, Search, X, Check, ChevronDown,
    Camera, Sparkles, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/hooks/useCurrency";
import { LocalizationSelector } from "@/components/profile/LocalizationSelector";
import { LocationForm } from "@/components/home/LocationPopup";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import logo from "@/assets/logo.png";
import { toast } from "@/hooks/use-toast";
import { countries } from "@/data/countries";
import { SearchAutocomplete } from "@/components/product/SearchAutocomplete";
import { cn } from "@/lib/utils";

/* ─── STYLES & CONSTANTS ─── */
const C = {
    orange: "#FF6600",
    orangeHover: "#E65C00",
    bg: "#FAFAFA",
    white: "#FFFFFF",
    border: "#E8E8E8",
    textPrimary: "#222222",
    textSecondary: "#666666",
    textMuted: "#767676",
};

export default function AlibabaHeader() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const isHomePage = location.pathname === "/";

    // Hooks
    const { user, signOut, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const { countryCode, setCountry, getCountryFlag } = useCurrency(); // Added setCountry

    // State
    const [activeTab, setActiveTab] = useState("Products");
    const [searchQuery, setSearchQuery] = useState("");
    const [locationSearchQuery, setLocationSearchQuery] = useState(""); // Added
    const [deepSearchOn, setDeepSearchOn] = useState(false);


    const [showMegaMenu, setShowMegaMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [locationView, setLocationView] = useState<'form' | 'search'>('form');
    const [zipCode, setZipCode] = useState("");

    // Image Search State
    const [showImageSearch, setShowImageSearch] = useState(false);
    const [imageSearching, setImageSearching] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Nav Items
    const leftNav = ["All categories", "Featured selections", "Order protections"];
    const rightNav = ["Connect on WhatsApp", "Help Center", "App & extension", "Sell on Alibaba.com"];

    // ─── HANDLERS ───
    const handleSearch = (term?: string) => {
        const queryToUse = typeof term === 'string' ? term : searchQuery;
        if (!queryToUse.trim()) return;

        if (typeof term === 'string') {
            setSearchQuery(term);
        }

        navigate(`/products?q=${encodeURIComponent(queryToUse)}`);
    };

    const handleMegaMenuEnter = () => {
        if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
        megaMenuTimeoutRef.current = setTimeout(() => setShowMegaMenu(true), 150);
    };

    const handleMegaMenuLeave = () => {
        if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
        megaMenuTimeoutRef.current = setTimeout(() => setShowMegaMenu(false), 300);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
        reader.readAsDataURL(file);
        setShowImageSearch(true);
    };

    const handleImageSearchRequest = async () => {
        if (!previewImage) return;
        setImageSearching(true);
        try {
            toast({ title: 'Image Search', description: 'Analyzing image...' });
            await new Promise(r => setTimeout(r, 1500));
            navigate('/products?imageSearch=true');
            setShowImageSearch(false);
            setPreviewImage(null);
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to process image', variant: 'destructive' });
        } finally {
            setImageSearching(false);
        }
    };

    const clearImageSearch = () => {
        setPreviewImage(null);
        setShowImageSearch(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full relative z-50 font-sans overflow-x-hidden">

            {/* 1. PROMO BANNER - Optimized for Mobile */}
            <div className="w-full bg-[#FFE8D6] py-[6px] md:py-[10px] px-2 md:px-4 flex justify-center items-center border-b border-[#ffd7b5] overflow-hidden">
                <div className="flex items-center space-x-1 md:space-x-2 w-full justify-center text-center">
                    <p className="text-[#111] text-[11px] sm:text-[15px] font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                        Research smarter • Better — All-in-one with <span className="font-extrabold text-[#FF6600]">AI Mode</span>
                    </p>
                    <div className="hidden md:block relative">
                        <span className="text-[#FF6600] text-xl ml-1">✨</span>
                        <span className="absolute -top-1 -right-3 text-[#FF6600] text-[8px] font-black uppercase tracking-tighter">AI</span>
                    </div>
                    <button
                        onClick={() => navigate('/ai-mode')}
                        className="hidden md:block bg-[#FF6600] text-white px-6 py-[8px] rounded-full text-[14px] font-extrabold hover:bg-[#E65C00] transition-colors ml-8"
                    >
                        Try it now →
                    </button>
                </div>
            </div>

            {/* 2. MAIN HEADER BAR */}
            <div className="bg-white border-b border-[#E8E8E8] sticky top-0 z-[50]">
                <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] min-h-[72px] py-2 flex items-center justify-between">

                    {/* LEFT: Mobile Menu & Logo - Sharper Mobile Presence */}
                    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="md:hidden w-8 h-8 p-0" onClick={() => setShowMobileMenu(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Link to="/" className="flex items-center group cursor-pointer shrink-0">
                            <img
                                src={logo}
                                alt="Alibaba.com"
                                className="h-[40px] sm:h-[60px] md:h-[100px] object-contain saturate-200 contrast-125 drop-shadow-sm"
                            />
                        </Link>
                    </div>

                    {/* MIDDLE: Compact Search (Non-Home Only) */}
                    {!isHomePage && location.pathname !== "/worldwide" && (
                        <div className="hidden md:flex flex-1 max-w-xl mx-8">
                            <div className="flex items-center w-full bg-white border-2 border-[#FF6600] rounded-full overflow-hidden h-[40px]">
                                <SearchAutocomplete
                                    placeholder="Search products..."
                                    className="flex-1 px-4 text-sm outline-none w-full bg-transparent h-full"
                                    containerClassName="flex-1 h-full flex items-center"
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    onSearch={handleSearch}
                                />
                                <button className="px-3 text-gray-400 hover:text-[#FF6600]" onClick={() => fileInputRef.current?.click()}>
                                    <Camera size={18} />
                                </button>
                                <button
                                    onClick={() => handleSearch()}
                                    className="bg-[#FF6600] text-white px-6 h-full font-bold text-sm hover:bg-[#E65C00]"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    )}

                    {/* RIGHT: Utilities - More compact on mobile */}
                    <div className="flex items-center gap-3 md:gap-[24px] pr-1 md:pr-0">

                        {/* Extra Links for One-Header Layout */}
                        <div className="hidden xl:flex items-center gap-5 text-[13px] font-bold text-[#555]">
                            <Link to="/help" className="hover:text-[#FF6600] transition-colors">Help</Link>
                            <div className="w-[1px] h-3 bg-gray-300"></div>
                            <Link to="/seller" className="hover:text-[#FF6600] transition-colors">Sell</Link>
                        </div>




                        {/* Deliver To */}
                        <Popover open={isLocationOpen} onOpenChange={(open) => {
                            setIsLocationOpen(open);
                            if (!open) setLocationView('form'); // Reset view on close
                        }}>
                            <PopoverTrigger asChild>
                                <div className="hidden md:flex flex-row items-center gap-2 cursor-pointer group hover:opacity-80 transition-all leading-none">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Deliver to:</span>
                                    <div className="flex items-center gap-1.5">
                                        <img
                                            src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
                                            className="w-[18px] h-3 rounded-[1px] shadow-sm border border-gray-100 object-cover"
                                            alt={countryCode}
                                        />
                                        <span className="text-[13px] font-bold text-[#111] uppercase tracking-tighter">{countryCode}</span>
                                        <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-transform duration-200" />
                                    </div>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[360px] p-6 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border-gray-100" align="end">
                                {locationView === 'form' ? (
                                    /* ─── FORM VIEW ─── */
                                    <div className="flex flex-col">
                                        <h3 className="text-[18px] font-bold text-[#111] mb-1">Specify your location</h3>
                                        <p className="text-[13px] text-[#666] leading-snug mb-5">
                                            Shipping options and fees vary based on your location
                                        </p>

                                        <button
                                            className="w-full bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-full py-2.5 text-[15px] mb-5 transition-colors"


                                            onClick={() => {
                                                setIsLocationOpen(false);
                                                navigate(user ? "/address-book?action=add" : "/auth?redirect=/address-book?action=add");
                                            }}
                                        >
                                            Add address
                                        </button>

                                        <div className="relative flex items-center justify-center mb-5">
                                            <div className="absolute w-full h-[1px] bg-gray-200"></div>
                                            <span className="relative bg-white px-3 text-[#999] text-[13px] font-medium">Or</span>
                                        </div>

                                        {/* Country Trigger */}
                                        <div
                                            className="flex items-center justify-between border border-gray-300 rounded-[8px] px-3 py-2.5 cursor-pointer hover:border-[#FF6600] transition-colors mb-3 group"
                                            onClick={() => setLocationView('search')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
                                                    className="w-6 h-4 object-cover rounded shadow-sm border border-gray-100"
                                                    alt={countryCode}
                                                />
                                                <span className="text-[14px] text-[#111] font-medium">
                                                    {countries.find(c => c.code === countryCode)?.name || countryCode}
                                                </span>
                                            </div>
                                            <div className="pl-3 border-l border-gray-300 h-4 flex items-center">
                                                <ChevronDown size={16} className="text-gray-400 group-hover:text-[#666]" />
                                            </div>
                                        </div>


                                        {/* Zip Code Input */}
                                        <input
                                            type="text"
                                            value={zipCode}
                                            onChange={(e) => setZipCode(e.target.value)}
                                            placeholder="Enter ZIP or postal code"
                                            className="w-full border border-gray-300 rounded-[8px] px-3 py-2.5 text-[14px] outline-none focus:border-[#FF6600] transition-colors mb-5 placeholder:text-gray-400"
                                        />

                                        <button
                                            className="w-full bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-full py-2.5 text-[15px] transition-colors"
                                            onClick={() => {
                                                if (!zipCode.trim()) {
                                                    toast({ title: "Validation Error", description: "Please enter a zip codes", variant: "destructive" });
                                                    return;
                                                }

                                                toast({
                                                    title: "Location Saved",
                                                    description: `Zip/Postal code ${zipCode} has been updated.`,
                                                    className: "border-l-4 border-l-[#FF6600]"
                                                });

                                                setIsLocationOpen(false);

                                                if (!user) {
                                                    // Give user a moment to see the toast, or just redirect
                                                    navigate("/auth");
                                                }
                                            }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    /* ─── SEARCH VIEW ─── */
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                                            <div className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-[#FF6600]" onClick={() => setLocationView('form')}>
                                                <ChevronDown className="rotate-90" size={16} />
                                                <span className="text-[14px] font-medium">Back</span>
                                            </div>
                                            <h3 className="text-[15px] font-bold text-[#111]">Select Country</h3>
                                            <div className="w-8"></div> {/* Spacer for centering */}
                                        </div>

                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search country..."
                                                value={locationSearchQuery}
                                                onChange={(e) => setLocationSearchQuery(e.target.value)}
                                                autoFocus
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#FF6600] transition-all"
                                            />
                                        </div>

                                        <div className="max-h-[300px] overflow-y-auto pr-1 -mr-1 custom-scrollbar">
                                            {countries.filter(c =>
                                                c.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
                                                c.code.toLowerCase().includes(locationSearchQuery.toLowerCase())
                                            ).map((c) => (
                                                <div
                                                    key={c.code}
                                                    onClick={() => {
                                                        setCountry(c.code);
                                                        setLocationView('form'); // Go back to form
                                                        setLocationSearchQuery("");
                                                    }}
                                                    className={`flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer group transition-all mb-1 ${countryCode === c.code ? 'bg-orange-50' : ''}`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <img
                                                            src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                                                            className="w-6 h-4 object-cover rounded shadow-sm border border-gray-100"
                                                            alt={c.name}
                                                        />
                                                        <span className={`text-[14px] ${countryCode === c.code ? 'font-bold text-[#FF6600]' : 'font-medium text-gray-700'}`}>
                                                            {c.name}
                                                        </span>
                                                    </div>
                                                    {countryCode === c.code && <Check size={16} className="text-[#FF6600]" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                        {/* Language */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="hidden md:flex items-center gap-[4px] cursor-pointer hover:text-[#FF6600] transition-colors">
                                    <Globe size={18} color={C.textMuted} strokeWidth={1.8} />
                                    <span style={{ fontSize: 13, color: C.textPrimary }}>English-USD</span>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <LocalizationSelector />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Cart */}
                        <div className="relative cursor-pointer hover:text-[#FF6600] transition-colors" onClick={() => navigate("/cart")}>
                            <ShoppingCart size={22} color={C.textPrimary} strokeWidth={1.6} />
                            {itemCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-3.5 w-3.5 p-0 text-[9px] flex items-center justify-center bg-[#FF6600]">{itemCount}</Badge>
                            )}
                        </div>

                        {/* Sign In / User */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-[#FF6600]">
                                        <User size={18} color={C.textMuted} strokeWidth={1.6} />
                                        <span className="hidden md:inline text-[13px] text-[#222]">My Account</span>
                                    </div>
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
                            <div className="hidden md:flex items-center gap-3">
                                <div className="flex items-center gap-[4px] cursor-pointer hover:text-[#FF6600] transition-colors" onClick={() => navigate("/auth")}>
                                    <User size={18} color={C.textMuted} strokeWidth={1.6} />
                                    <span style={{ fontSize: 13, color: C.textPrimary }}>Sign in</span>
                                </div>
                                <button
                                    onClick={() => navigate("/auth?tab=register")}
                                    className="text-white font-semibold rounded-full transition-colors duration-150 bg-[#FF6600] hover:bg-[#E65C00] text-[14px] px-[22px] py-[9px]"
                                >
                                    Create account
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* MOBILE SEARCH (Non-Home Only) */}
                {!isHomePage && location.pathname !== "/worldwide" && (
                    <div className="md:hidden px-3 pb-3 -mt-1 bg-white border-b border-[#E8E8E8]">
                        <div className="flex items-center w-full bg-white border border-[#FF6600] rounded-full overflow-hidden h-[36px]">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="flex-1 px-4 text-sm outline-none w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <button className="px-3 text-gray-400 hover:text-[#FF6600]" onClick={() => fileInputRef.current?.click()}>
                                <Camera size={18} />
                            </button>
                            <button
                                onClick={() => handleSearch()}
                                className="bg-[#FF6600] text-white px-4 h-full font-bold text-sm"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. SECONDARY NAV ROW */}
                {/* 3. SECONDARY NAV ROW - REMOVED (Merged into Main Header) */}
            </div>

            <MegaMenu
                isOpen={showMegaMenu}
                onClose={() => setShowMegaMenu(false)}
                onMouseEnter={handleMegaMenuEnter}
                onMouseLeave={handleMegaMenuLeave}
            />
            <MobileMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} />

            {/* 4. HERO SECTION (HOME ONLY) */}
            {isHomePage && (
                <div className="w-full bg-white pt-8 pb-10 flex flex-col items-center">
                    <div className="max-w-[1000px] mx-auto flex flex-col items-center w-full px-4">

                        {/* Tabs */}
                        <div className="flex items-center justify-between w-full md:w-auto md:justify-center gap-2 md:gap-12 mb-4 md:mb-8 h-[40px] md:h-[48px] overflow-x-auto scrollbar-hide px-2">
                            {[
                                { id: "AI Mode", label: "AI Intelligence" },
                                { id: "Products", label: "Products" },
                                { id: "Worldwide", label: "Worldwide" }
                            ].map((tab) => (
                                <div key={tab.id} className="flex-shrink-0 flex items-center">
                                    <div
                                        onClick={() => {
                                            if (tab.id === "AI Mode") {
                                                navigate('/ai-mode');
                                            } else if (tab.id === "Worldwide") {
                                                navigate('/worldwide');
                                            } else {
                                                setActiveTab(tab.id);
                                            }
                                        }}
                                        className={cn(
                                            "cursor-pointer whitespace-nowrap px-1 text-[15px] sm:text-[18px] md:text-[22px] lg:text-[28px] font-bold transition-all pb-1 flex items-center group",
                                            tab.id === "Products" ? "text-[#FF6600] border-b-[3px] md:border-b-[4px] border-[#FF6600]" :
                                                tab.id === "Worldwide" ? "text-slate-900 border-b-[3px] md:border-b-[4px] border-transparent" :
                                                    "text-black border-b-[3px] md:border-b-[4px] border-transparent"
                                        )}
                                    >
                                        {tab.id === "AI Mode" ? (
                                            <div className="flex items-center relative gap-1.5">
                                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-[#FF6600]">
                                                    {tab.label}
                                                </span>
                                                <div className="relative -top-1.5">
                                                    <div className="absolute inset-0 bg-orange-400 blur-[8px] opacity-40 animate-pulse rounded-full" />
                                                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-orange-500 relative z-10" />
                                                </div>
                                            </div>
                                        ) : (
                                            tab.label
                                        )}
                                    </div>
                                    {tab.id === "AI Mode" && <div className="hidden md:block text-gray-200 text-3xl font-light opacity-40 select-none ml-6 md:ml-12">|</div>}
                                </div>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="w-full max-w-[860px] relative">
                            <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(255,102,0,0.08)] border-[1.5px] border-[#FF6600] p-4 md:p-5 flex flex-col h-[140px] md:h-[160px]">
                                {/* Input */}
                                <SearchAutocomplete
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    onSearch={handleSearch}
                                    placeholder={activeTab === "AI Mode" ? "Ask anything..." : "Search products..."}
                                    className="w-full text-[16px] md:text-[18px] outline-none text-gray-800 placeholder-gray-400 font-medium bg-transparent pt-1 px-1"
                                />

                                {/* Hidden File Input */}
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

                                {/* Bottom Actions */}
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center space-x-4 md:space-x-6">
                                        {/* Deep Search Toggle */}
                                        <div className="hidden md:flex items-center bg-[#FFF8F4] border border-[#FFE0CC] rounded-[14px] px-3.5 py-[6px] space-x-3">
                                            <div className="flex items-center space-x-1">
                                                <div className="relative">
                                                    <span className="text-[#FF6600] text-sm">✨</span>
                                                    <span className="absolute -top-1.5 -right-2 text-[#FF6600] text-[6px] font-black">AI</span>
                                                </div>
                                                <span className="text-[13px] font-bold text-[#FF6600]">Deep Search</span>
                                                <span className="text-[10px] text-gray-800 border border-gray-300 px-1 rounded font-bold bg-white">Free</span>
                                            </div>
                                            <div
                                                className={`w-[36px] h-[18px] rounded-full relative cursor-pointer transition-colors ${deepSearchOn ? 'bg-[#FF6600]' : 'bg-gray-200'}`}
                                                onClick={() => setDeepSearchOn(!deepSearchOn)}
                                            >
                                                <div className={`absolute top-[2px] left-[2px] bg-white w-3.5 h-3.5 rounded-full transition-transform ${deepSearchOn ? 'translate-x-[18px]' : ''}`} />
                                            </div>
                                        </div>

                                        {/* Image Search */}
                                        <div
                                            className="flex items-center space-x-2 cursor-pointer text-gray-800 hover:text-[#FF6600] transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="bg-[#f0f2f5] p-1.5 rounded-lg group-hover:bg-orange-50">
                                                <Camera size={18} strokeWidth={2.5} />
                                            </div>
                                            <span className="text-[13px] md:text-[14px] font-bold hidden sm:inline">Image Search</span>
                                        </div>
                                    </div>

                                    {/* Search Button */}
                                    <button
                                        onClick={() => handleSearch()}
                                        className="bg-gradient-to-r from-[#FF9800] to-[#FF5722] text-white flex items-center space-x-2 px-6 md:px-10 h-[48px] md:h-[54px] rounded-full hover:shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98] shadow-md ml-auto"
                                    >
                                        <div className="relative">
                                            <Search size={18} strokeWidth={3} />
                                            <div className="absolute -top-1.5 -right-1.5 text-[8px] font-black">✨</div>
                                        </div>
                                        <span className="font-black text-[16px] md:text-[17px]">Search</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Search Dialog */}
            <Dialog open={showImageSearch} onOpenChange={setShowImageSearch}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Search by Image</DialogTitle>
                    </DialogHeader>
                    {previewImage && (
                        <div className="space-y-4">
                            <div className="relative">
                                <img src={previewImage} alt="Preview" className="w-full h-48 object-contain rounded-lg border bg-muted" />
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 bg-white/80" onClick={clearImageSearch}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={clearImageSearch}>Cancel</Button>
                                <Button className="flex-1 bg-[#FF6600] hover:bg-[#E65C00]" onClick={handleImageSearchRequest} disabled={imageSearching}>
                                    {imageSearching ? 'Searching...' : 'Find Similar Products'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
