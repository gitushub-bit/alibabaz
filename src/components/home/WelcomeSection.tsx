import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
    Shirt, Smartphone, Trophy, Sparkles, Briefcase, Home, Truck, Wrench, Watch, ChevronRight,
    FileText, Award, Zap, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrendingProduct {
    id: string;
    title: string;
    slug: string;
    img: string;
    label: string;
}

export const WelcomeSection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [realTrendingProducts, setRealTrendingProducts] = useState<TrendingProduct[]>([]);
    const [loadingTrending, setLoadingTrending] = useState(true);

    const subCategories: Record<string, { name: string, img: string }[]> = {
        "Categories for you": [
            { name: "Electric Cars", img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=100&q=80" },
            { name: "Electric Motorcycles", img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=100&q=80" },
            { name: "Laptops", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=100&q=80" },
            { name: "Drones", img: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=100&q=80" },
            { name: "Smart Watches", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80" },
            { name: "Wedding Dresses", img: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=100&q=80" },
            { name: "Electric Scooters", img: "https://images.unsplash.com/photo-1557406201-13c5457f5c53?auto=format&fit=crop&w=100&q=80" },
            { name: "Used Cars", img: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=100&q=80" },
            { name: "Cars", img: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=100&q=80" },
            { name: "Motorcycle", img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=100&q=80" },
            { name: "Car Accessories", img: "https://images.unsplash.com/photo-1635799738092-2fe26f7c6310?auto=format&fit=crop&w=100&q=80" },
        ],
        "Apparel & Accessories": [
            { name: "Carnival Costume", img: "https://images.unsplash.com/photo-1549488344-c7054236e767?auto=format&fit=crop&w=100&q=80" },
            { name: "Ice Hockey", img: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=100&q=80" },
            { name: "Hunting Vest", img: "https://images.unsplash.com/photo-1598971031358-1f19f187498c?auto=format&fit=crop&w=100&q=80" },
            { name: "Garment Accessories", img: "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&w=100&q=80" },
            { name: "Mexican Hat", img: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=100&q=80" },
            { name: "Trimmings", img: "https://images.unsplash.com/photo-1590736939943-4dc975a1336c?auto=format&fit=crop&w=100&q=80" },
            { name: "Polyester Ties", img: "https://images.unsplash.com/photo-1596704017327-0fa8d7a1262d?auto=format&fit=crop&w=100&q=80" },
            { name: "Women's Sets", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=100&q=80" },
            { name: "Evening Dresses", img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=100&q=80" },
        ]
    };

    const getSubCategories = (catLabel: string) => {
        return subCategories[catLabel] || subCategories["Categories for you"]; // Fallback to main list for demo
    };


    const categories = [
        { icon: <Shirt size={18} />, label: "Apparel & Accessories" },
        { icon: <Smartphone size={18} />, label: "Consumer Electronics" },
        { icon: <Trophy size={18} />, label: "Sports & Entertainment" },
        { icon: <Sparkles size={18} />, label: "Beauty" },
        { icon: <Briefcase size={18} />, label: "Luggage, Bags & Cases" },
        { icon: <Home size={18} />, label: "Home & Garden" },
        { icon: <Shirt size={18} />, label: "Sportswear & Outdoor Apparel" },
        { icon: <Watch size={18} />, label: "Jewelry, Eyewear & Watches" },
        { icon: <Shirt size={18} />, label: "Shoes & Accessories" },
        { icon: <Briefcase size={18} />, label: "Packaging & Printing" },
        { icon: <Sparkles size={18} />, label: "Parents, Kids & Toys" },
        { icon: <Home size={18} />, label: "Personal Care & Home Care" },
        { icon: <Sparkles size={18} />, label: "Health & Medical" },
        { icon: <Sparkles size={18} />, label: "Gifts & Crafts" },
        { icon: <Sparkles size={18} />, label: "Pet Supplies" },
        { icon: <Briefcase size={18} />, label: "School & Office Supplies" },
        { icon: <Wrench size={18} />, label: "Industrial Machinery" },
        { icon: <Wrench size={18} />, label: "Commercial Equipment & Machinery" },
        { icon: <Wrench size={18} />, label: "Construction & Building Machinery" },
        { icon: <Home size={18} />, label: "Construction & Real Estate" },
        { icon: <Home size={18} />, label: "Furniture" },
        { icon: <Sparkles size={18} />, label: "Lights & Lighting" },
        { icon: <Home size={18} />, label: "Home Appliances" },
        { icon: <Truck size={18} />, label: "Automotive Supplies & Tools" },
        { icon: <Truck size={18} />, label: "Vehicle Parts & Accessories" },
        { icon: <Wrench size={18} />, label: "Tools & Hardware" },
        { icon: <Sparkles size={18} />, label: "Renewable Energy" },
        { icon: <Wrench size={18} />, label: "Electrical Equipment & Supplies" },
        { icon: <Wrench size={18} />, label: "Safety & Security" },
        { icon: <Wrench size={18} />, label: "Material Handling" },
        { icon: <Wrench size={18} />, label: "Testing Instrument & Equipment" },
        { icon: <Wrench size={18} />, label: "Power Transmission" },
        { icon: <Smartphone size={18} />, label: "Electronic Components" },
        { icon: <Truck size={18} />, label: "Vehicles & Transportation" },
        { icon: <Home size={18} />, label: "Agriculture, Food & Beverage" },
        { icon: <Briefcase size={18} />, label: "Raw Materials" },
        { icon: <Wrench size={18} />, label: "Fabrication Services" },
        { icon: <Briefcase size={18} />, label: "Service" },
    ];

    const trendingProducts = [
        {
            label: "TRENDING",
            title: "LED Lighting",
            img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
        },
        {
            label: "TRENDING",
            title: "Industrial Tools",
            img: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop"
        },
        {
            label: "TRENDING",
            title: "Consumer Electronics",
            img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop"
        },
    ];

    const promoSlides = [
        {
            title: "Discover the latest trends",
            subtitle: "Explore trending products from verified suppliers worldwide.",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
            cta: "View more",
            link: "/products"
        },
        {
            title: "Custom Manufacturing & OEM",
            subtitle: "Request custom orders and production directly from factories.",
            image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop",
            cta: "Request Quote",
            link: "/buyer/rfqs/new"
        },
        {
            title: "Top Deals for Global Buyers",
            subtitle: "Discover bulk discounts on high-demand products.",
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
            cta: "Shop Now",
            link: "/products?sort=best-match"
        },
    ];

    // Fetch real products for Trending section
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('id, title, slug, images')
                    .eq('published', true)
                    .limit(3);

                if (error) throw error;

                if (data) {
                    const formatted = data.map((p: any) => ({
                        id: p.id,
                        title: p.title,
                        slug: p.slug,
                        img: (p.images && p.images.length > 0) ? p.images[0] : "https://via.placeholder.com/400x300",
                        label: "TRENDING"
                    }));
                    setRealTrendingProducts(formatted);
                }
            } catch (err) {
                console.error("Error fetching trending products:", err);
            } finally {
                setLoadingTrending(false);
            }
        };

        fetchTrending();
    }, []);

    // Auto-rotate carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [promoSlides.length]);

    return (
        <section className="bg-white py-6">
            <div className="max-w-[1440px] mx-auto px-4 md:px-[60px]">

                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <h2 className="text-[20px] font-bold text-[#333] mb-2 md:mb-0">
                        Welcome to Alibaba.com
                    </h2>
                    <div className="flex items-center gap-6 text-[13px] text-[#333] font-medium">
                        <div
                            onClick={() => navigate('/products')}
                            className="flex items-center gap-1.5 cursor-pointer hover:text-[#FF6600]"
                        >
                            <FileText size={16} />
                            <span className="hidden md:inline">Browse Products</span>
                        </div>
                        <div
                            onClick={() => navigate('/products?sort=best-match')}
                            className="flex items-center gap-1.5 cursor-pointer hover:text-[#FF6600]"
                        >
                            <Award size={16} />
                            <span className="hidden md:inline">Top Selling</span>
                        </div>
                        <div
                            onClick={() => navigate('/products?sort=newest')}
                            className="flex items-center gap-1.5 cursor-pointer hover:text-[#FF6600]"
                        >
                            <Zap size={16} />
                            <span className="hidden md:inline">New Arrivals</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-4 xl:h-[380px]">
                    {/* Left Sidebar - Categories (Desktop Only) */}
                    <div className="w-[220px] hidden lg:block shrink-0 h-full relative" onMouseLeave={() => setHoveredCategory(null)}>
                        <div className="bg-gray-50 rounded-2xl p-2 h-full flex flex-col relative z-20">
                            {/* 'Categories for you' Header */}
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm mb-2 cursor-pointer flex-shrink-0">
                                <div className="flex items-center gap-2 font-bold text-[#111]">
                                    <Sparkles size={16} className="text-[#333]" />
                                    <span className="text-[14px]">Categories for you</span>
                                </div>
                                <ChevronRight size={14} className="text-gray-400" />
                            </div>

                            {/* List - Shows 6 items, rest are scrollable */}
                            <div className="space-y-1 flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#999 transparent' }}>
                                {categories.map((cat, i) => (
                                    <Link
                                        key={i}
                                        to={`/products?category=${encodeURIComponent(cat.label.toLowerCase().replace(/ /g, '-'))}`}
                                        className={`flex items-center justify-between p-2.5 hover:bg-white hover:shadow-sm rounded-xl cursor-pointer transition-all group ${hoveredCategory === cat.label ? 'bg-white shadow-sm' : ''}`}
                                        onMouseEnter={() => setHoveredCategory(cat.label)}
                                    >
                                        <div className="flex items-center gap-2 text-[#333] group-hover:text-[#FF6600]">
                                            <span className="text-gray-500 group-hover:text-[#FF6600]">{cat.icon}</span>
                                            <span className="text-[13px]">{cat.label}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-[#FF6600] opacity-0 group-hover:opacity-100" />
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-2 text-center flex-shrink-0">
                                <Button variant="outline" className="rounded-full px-5 text-[12px] h-7 border-gray-300 hover:bg-white w-full">
                                    View all <ChevronRight size={12} className="ml-1" />
                                </Button>
                            </div>
                        </div>

                        {/* Mega Menu Flyout */}
                        {hoveredCategory && (
                            <div className="absolute top-[-1px] left-[220px] w-[900px] min-h-[calc(100%+2px)] bg-white shadow-2xl z-[100] p-6 overflow-y-auto border-l border-gray-100 animate-in fade-in duration-200 rounded-r-2xl">
                                <h3 className="text-lg font-bold text-[#111] mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                                    {hoveredCategory}
                                    <span className="text-gray-400 text-sm font-normal ml-auto cursor-pointer hover:text-[#FF6600] flex items-center gap-1">
                                        View all <ChevronRight size={14} />
                                    </span>
                                </h3>

                                <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                                    {getSubCategories(hoveredCategory).map((sub, idx) => (
                                        <Link key={idx} to={`/products?category=${encodeURIComponent(sub.name.toLowerCase().replace(/ /g, '-'))}`} className="flex flex-col items-center text-center group cursor-pointer">
                                            <div className="w-16 h-16 rounded-full bg-gray-50 overflow-hidden mb-2 relative group-hover:ring-2 ring-[#FF6600] ring-offset-2 transition-all">
                                                <img src={sub.img} alt={sub.name} className="w-full h-full object-cover" />
                                                <div className="absolute top-0 right-0 w-3 h-3 bg-[#FF6600] rounded-full border-2 border-white">
                                                    <span className="sr-only">Hot</span>
                                                </div>
                                            </div>
                                            <span className="text-[12px] text-gray-600 group-hover:text-[#FF6600] font-medium leading-tight max-w-[100px]">{sub.name}</span>
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                        <span>Can't find what you're looking for?</span>
                                        <Button variant="link" className="text-[#FF6600] p-0 h-auto font-semibold">Browse all categories &rarr;</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Content - Trending Products + Carousel */}
                    <div className="flex-1 flex flex-col-reverse xl:flex-row gap-4 w-full xl:w-auto h-auto xl:h-full">

                        {/* Trending Products Section */}
                        <div className="w-full xl:flex-1 min-w-0">
                            <div className="flex gap-3 overflow-x-auto pb-4 xl:pb-0 snap-x scrollbar-hide h-[200px] xl:h-full">
                                {realTrendingProducts.length > 0 ? (
                                    realTrendingProducts.map((product, i) => (
                                        <Link
                                            key={i}
                                            to={`/product/${product.slug}`}
                                            className="bg-white border border-gray-200 rounded-2xl overflow-hidden w-[160px] sm:w-[220px] flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow group h-full flex flex-col snap-start"
                                        >
                                            <div className="p-3 pb-2 flex-shrink-0">
                                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{product.label}</span>
                                                <h3 className="text-[13px] sm:text-[14px] font-bold text-[#111] mt-0.5 line-clamp-2">{product.title}</h3>
                                            </div>
                                            <div className="flex-1 bg-gray-50 relative">
                                                <img
                                                    src={product.img}
                                                    alt={product.title}
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    // Skeleton loaders
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="bg-gray-100 animate-pulse rounded-2xl w-[160px] sm:w-[220px] flex-shrink-0 h-full" />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Promotional Carousel */}
                        <div className="w-full xl:w-[300px] shrink-0 h-[200px] sm:h-[280px] xl:h-full mb-4 xl:mb-0">
                            <div className="relative h-full rounded-2xl overflow-hidden shadow-sm border border-gray-100/50">
                                {promoSlides.map((slide, index) => (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                                            }`}
                                    >
                                        {/* Background Image */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url(${slide.image})` }}
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                        {/* Content */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-between p-6 text-white text-center">
                                            <div className="flex-1 flex items-center justify-center">
                                                <div>
                                                    <h3 className="text-[18px] sm:text-[22px] font-bold leading-tight mb-2 drop-shadow-md">
                                                        {slide.title}
                                                    </h3>
                                                    <p className="text-[12px] sm:text-[13px] text-white/90 leading-relaxed drop-shadow-sm max-w-[240px] mx-auto">
                                                        {slide.subtitle}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Centered Button */}
                                            <button
                                                onClick={() => navigate(slide.link)}
                                                className="bg-white/95 text-[#111] text-[13px] font-bold px-8 py-2.5 rounded-full hover:bg-white transition-colors mb-2 md:mb-8 shadow-lg transform active:scale-95"
                                            >
                                                {slide.cta}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Navigation Arrows - Hidden on mobile for cleaner look */}
                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length)}
                                    className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 z-10 transition-colors"
                                >
                                    <ChevronLeft size={20} className="text-white" />
                                </button>
                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev + 1) % promoSlides.length)}
                                    className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 z-10 transition-colors"
                                >
                                    <ChevronRight size={20} className="text-white" />
                                </button>

                                {/* Indicator Dots */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                    {promoSlides.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`h-1.5 rounded-full transition-all shadow-sm ${index === currentSlide ? "bg-white w-6" : "bg-white/50 w-1.5"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};
