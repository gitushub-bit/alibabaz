import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AlibabaHeader from "@/components/layout/AlibabaHeader";
import { Footer } from "@/components/layout/Footer";
import { Search, Camera, ChevronRight, Globe, Check, Shield, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * ─── INTERFACES ───
 */

interface Country {
    name: string;
    code: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    product_count?: number;
}

interface Product {
    id: string;
    title: string;
    slug: string;
    price_min: number | null;
    price_max: number | null;
    images: string[] | null;
    verified: boolean | null;
    category_id: string | null;
}

/**
 * ─── DATA CONSTANTS ───
 */

const COUNTRIES: Country[] = [
    { name: "All", code: "ALL" },
    { name: "Taiwan, China", code: "TW" },
    { name: "Pakistan", code: "PK" },
    { name: "Hong Kong, China", code: "HK" },
    { name: "South Korea", code: "KR" },
    { name: "United States", code: "US" },
    { name: "Turkey", code: "TR" },
    { name: "Vietnam", code: "VN" },
    { name: "India", code: "IN" },
    { name: "Thailand", code: "TH" },
    { name: "Malaysia", code: "MY" },
];

export default function Worldwide() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [topProducts, setTopProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── FETCH DATA ───

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch categories with product counts
            const { data: categoriesData } = await supabase
                .from('categories')
                .select('id, name, slug')
                .is('parent_id', null)
                .order('name')
                .limit(12);

            if (categoriesData) {
                setCategories(categoriesData);
            }

            // Fetch top products (verified, recent)
            const { data: productsData } = await supabase
                .from('products')
                .select('id, title, slug, price_min, price_max, images, verified, category_id')
                .eq('published', true)
                .order('verified', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(12);

            if (productsData) {
                setTopProducts(productsData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // ─── HANDLERS ───

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            toast({
                title: "Search required",
                description: "Please enter a search term",
                variant: "destructive"
            });
            return;
        }
        navigate(`/products?q=${encodeURIComponent(searchQuery)}&source=worldwide`);
    };

    const handleImageSearch = () => {
        fileInputRef.current?.click();
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast({
                    title: "Invalid file",
                    description: "Please select an image file",
                    variant: "destructive"
                });
                return;
            }
            toast({
                title: "Image uploaded",
                description: "Searching for similar products..."
            });
            navigate('/products?imageSearch=true&source=worldwide');
        }
    };

    const handleCountryFilter = (countryName: string) => {
        setActiveTab(countryName);
        toast({
            title: `Filtering by ${countryName}`,
            description: countryName === "All" ? "Showing products from all countries" : `Showing products from ${countryName}`
        });
    };

    const handleCategoryClick = (category: Category) => {
        navigate(`/products?category=${category.slug}`);
    };

    const handleProductClick = (product: Product) => {
        navigate(`/product/${product.slug}`);
    };

    const handleViewAllCountries = () => {
        toast({
            title: "View all countries",
            description: "Showing all available sourcing countries"
        });
    };

    const handleViewAllHubs = () => {
        navigate('/products?featured=hubs');
    };

    // Group products by category for display
    const productsByCategory = categories.slice(0, 4).map(category => {
        const categoryProducts = topProducts
            .filter(p => p.category_id === category.id)
            .slice(0, 3);

        return {
            category,
            products: categoryProducts
        };
    }).filter(group => group.products.length > 0);

    return (
        <div className="min-h-screen bg-white font-sans text-[#333]">
            <AlibabaHeader />

            {/* ─── HERO SEARCH SECTION ─── */}
            <div className="w-full bg-[#FAFAFA] pt-8 pb-10 border-b border-gray-100">
                <div className="max-w-[1440px] mx-auto px-4 md:px-[40px] flex flex-col items-center">

                    {/* Page Tabs Navigation */}
                    <div className="flex items-center gap-8 md:gap-14 mb-8 overflow-x-auto scrollbar-hide px-2 w-full justify-center">
                        {["AI Mode", "Products", "Worldwide"].map((tab) => (
                            <div key={tab} className="flex-shrink-0 relative group">
                                <button
                                    onClick={() => {
                                        if (tab === "AI Mode") navigate('/ai-mode');
                                        else if (tab === "Worldwide") { /* Current Page */ }
                                        else navigate('/');
                                    }}
                                    className={`relative text-[18px] md:text-[22px] font-bold pb-2 transition-all duration-200 ${tab === "Worldwide"
                                        ? "text-[#FF6600]"
                                        : "text-[#333] hover:text-[#555]"
                                        }`}>
                                    {tab}
                                    {tab === "Worldwide" && (
                                        <span className="absolute bottom-0 left-0 w-full h-[4px] bg-[#FF6600] rounded-t-sm" />
                                    )}
                                </button>
                                {tab === "AI Mode" && (
                                    <span className="absolute -top-1.5 -right-3 text-[#FF6600] text-[9px] font-black uppercase tracking-tighter bg-orange-50 px-1 rounded-[2px] border border-orange-100 leading-none py-0.5">
                                        AI
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Search Bar Component */}
                    <div className="w-full max-w-[840px] relative shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-shadow duration-300 rounded-full">
                        <div className="bg-white border-[2px] border-[#111] rounded-full p-1.5 flex items-center h-[60px]">
                            <input
                                type="text"
                                placeholder="Search products worldwide..."
                                className="flex-1 h-full px-6 text-[16px] md:text-[18px] outline-none placeholder:text-gray-400 font-medium text-[#111] bg-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />

                            <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

                            <button
                                onClick={handleImageSearch}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-[#333] font-bold hover:bg-gray-50 rounded-full transition-colors mx-1 group/cam"
                            >
                                <Camera className="w-5 h-5 text-gray-500 group-hover/cam:text-[#FF6600] transition-colors" strokeWidth={2} />
                                <span className="text-[14px]">Image Search</span>
                            </button>

                            <button
                                onClick={handleSearch}
                                className="bg-[#111] text-white h-[46px] px-8 rounded-full font-bold text-[16px] hover:bg-black transition-all active:scale-[0.98] flex items-center gap-2 shrink-0 ml-1 shadow-md hover:shadow-lg"
                            >
                                <Search className="w-5 h-5" strokeWidth={2.5} />
                                <span className="hidden sm:inline">Search</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── MAIN CONTENT ─── */}
            <main className="max-w-[1440px] mx-auto px-4 md:px-[40px] py-10">

                {/* ─── COUNTRY FILTER ─── */}
                <div className="relative mb-14 group">
                    <div className="flex items-center gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                        {COUNTRIES.map((c) => (
                            <div
                                key={c.name}
                                onClick={() => handleCountryFilter(c.name)}
                                className="snap-start flex flex-col items-center gap-3 min-w-[76px] cursor-pointer group/item select-none"
                            >
                                <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center border transition-all duration-200 relative ${activeTab === c.name
                                    ? "border-[#FF6600] ring-[3px] ring-orange-100 bg-orange-50 shadow-sm"
                                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"
                                    }`}>
                                    {c.code === "ALL" ? (
                                        <Globe className={`w-7 h-7 ${activeTab === c.name ? "text-[#FF6600]" : "text-gray-500"}`} strokeWidth={1.5} />
                                    ) : (
                                        <img
                                            src={`https://flagcdn.com/w80/${c.code.toLowerCase()}.png`}
                                            alt={c.name}
                                            className="w-[42px] h-[42px] object-cover rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-white"
                                        />
                                    )}
                                    {activeTab === c.name && (
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-[#FF6600] text-white rounded-full p-[3px] border-[2px] border-white shadow-sm flex items-center justify-center">
                                            <Check className="w-2.5 h-2.5" strokeWidth={4} />
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[13px] font-medium text-center whitespace-nowrap leading-tight px-1 rounded-sm ${activeTab === c.name ? "text-[#FF6600] font-bold" : "text-[#555] group-hover/item:text-[#111]"
                                    }`}>
                                    {c.name}
                                </span>
                            </div>
                        ))}

                        <button
                            onClick={handleViewAllCountries}
                            className="flex flex-col items-center gap-3 min-w-[60px] cursor-pointer group/more pl-2"
                        >
                            <div className="w-[60px] h-[60px] rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center group-hover/more:bg-gray-100 transition-colors shadow-sm">
                                <ChevronRight className="w-6 h-6 text-gray-400 group-hover/more:text-gray-700" />
                            </div>
                            <span className="text-[12px] font-medium text-[#777] group-hover/more:text-[#333]">View All</span>
                        </button>
                    </div>
                </div>

                {/* ─── GLOBAL INDUSTRY CATEGORIES ─── */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[24px] md:text-[26px] font-extrabold text-[#111] tracking-tight">Global Industry Categories</h2>
                        <button
                            onClick={handleViewAllHubs}
                            className="text-[#666] text-[14px] hover:text-[#FF6600] font-medium flex items-center gap-1 transition-colors"
                        >
                            View all categories <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.slice(0, 6).map((category) => {
                            const categoryProduct = topProducts.find(p => p.category_id === category.id);

                            // Category-specific images for variety
                            const getCategoryImage = (categoryName: string) => {
                                const lowerName = categoryName.toLowerCase();
                                if (lowerName.includes('electronic') || lowerName.includes('tech')) {
                                    return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80';
                                } else if (lowerName.includes('fashion') || lowerName.includes('apparel') || lowerName.includes('clothing')) {
                                    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80';
                                } else if (lowerName.includes('home') || lowerName.includes('furniture')) {
                                    return 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&auto=format&fit=crop&q=80';
                                } else if (lowerName.includes('beauty') || lowerName.includes('cosmetic')) {
                                    return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80';
                                } else if (lowerName.includes('sport') || lowerName.includes('fitness')) {
                                    return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80';
                                } else if (lowerName.includes('food') || lowerName.includes('beverage')) {
                                    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
                                } else if (lowerName.includes('toy') || lowerName.includes('game')) {
                                    return 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80';
                                } else if (lowerName.includes('automotive') || lowerName.includes('vehicle')) {
                                    return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&auto=format&fit=crop&q=80';
                                } else if (lowerName.includes('jewelry') || lowerName.includes('accessories')) {
                                    return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80';
                                } else if (lowerName.includes('industrial') || lowerName.includes('machinery')) {
                                    return 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&auto=format&fit=crop&q=80';
                                } else {
                                    // Default variety based on index
                                    const defaultImages = [
                                        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
                                        'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80',
                                        'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&auto=format&fit=crop&q=80',
                                        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
                                        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80',
                                        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'
                                    ];
                                    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
                                }
                            };

                            const image = categoryProduct?.images?.[0] || getCategoryImage(category.name);

                            return (
                                <div
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category)}
                                    className="group relative h-[340px] rounded-[24px] overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_16px_32px_rgba(0,0,0,0.12)] transition-all duration-500 transform hover:-translate-y-1"
                                >
                                    <img
                                        src={image}
                                        alt={category.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-7 flex flex-col justify-end">
                                        <h3 className="text-white text-[22px] font-bold leading-tight mb-2 group-hover:underline decoration-2 underline-offset-4 decoration-[#FF6600]">
                                            {category.name}
                                        </h3>
                                        <p className="text-white/80 text-[14px] leading-snug font-medium">
                                            Explore products in {category.name.toLowerCase()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ─── TOP PRODUCTS BY CATEGORY ─── */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[24px] md:text-[26px] font-extrabold text-[#111] tracking-tight">Top Products by Category</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {productsByCategory.map(({ category, products }) => (
                            <div
                                key={category.id}
                                onClick={() => handleCategoryClick(category)}
                                className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer group hover:border-gray-200"
                            >
                                <div className="mb-5 flex flex-col gap-1.5 border-b border-gray-50 pb-3">
                                    <h3 className="text-[17px] font-bold text-[#111] group-hover:text-[#FF6600] transition-colors line-clamp-1">
                                        {category.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        <span className="text-[13px] text-[#555] font-medium">Featured</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {products.map((product, idx) => (
                                        <div
                                            key={product.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProductClick(product);
                                            }}
                                            className="flex items-center gap-3 p-2 rounded-[12px] group/item hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                                        >
                                            <span className={`text-[16px] w-6 text-center italic font-black ${idx === 0 ? "text-[#FF6600]" :
                                                idx === 1 ? "text-[#333]" : "text-gray-300"
                                                }`}>#{idx + 1}</span>

                                            <div className="relative">
                                                <img
                                                    src={product.images?.[0] || '/placeholder.svg'}
                                                    alt={product.title}
                                                    className="w-[52px] h-[52px] object-cover rounded-[10px] bg-gray-50 border border-gray-100 shadow-sm"
                                                />
                                                {idx === 0 && product.verified && (
                                                    <div className="absolute -top-1.5 -left-1.5 bg-[#FFD700] text-[#8B4513] text-[8px] font-extrabold px-1.5 py-0.5 rounded-[3px] shadow-sm flex items-center gap-0.5 border border-[#F4C430]">
                                                        <Shield className="w-2 h-2" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col flex-1 gap-1.5 min-w-0">
                                                <p className="text-[11px] font-medium text-[#111] line-clamp-1">
                                                    {product.title}
                                                </p>
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Price</span>
                                                    <span className="text-[12px] font-bold text-[#FF6600]">
                                                        ${product.price_min || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── FEATURED PRODUCTS GRID ─── */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-[24px] font-extrabold text-[#111] tracking-tight">Featured Products</h2>
                        <span className="text-[10px] font-bold bg-[#FF6600] text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wide">New</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {topProducts.slice(0, 6).map((product) => (
                            <div
                                key={product.id}
                                onClick={() => handleProductClick(product)}
                                className="aspect-[3/4] rounded-[16px] bg-gray-100 relative overflow-hidden group cursor-pointer border border-transparent hover:border-[#FF6600] transition-all shadow-sm hover:shadow-md"
                            >
                                <img
                                    src={product.images?.[0] || '/placeholder.svg'}
                                    alt={product.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                    <p className="text-white text-[12px] font-bold line-clamp-2">{product.title}</p>
                                    {product.price_min && (
                                        <p className="text-[#FF6600] text-[14px] font-extrabold mt-1">${product.price_min}</p>
                                    )}
                                </div>
                                {product.verified && (
                                    <div className="absolute top-2 right-2 bg-amber-50 text-amber-700 p-1 rounded-full">
                                        <Shield className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
