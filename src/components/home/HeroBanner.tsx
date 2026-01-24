import { ChevronLeft, ChevronRight, ChevronRight as ArrowRight, Target, Sparkles, Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
interface Category {
  id: string;
  name: string;
  slug: string;
}
export const HeroBanner = () => {
  const {
    t
  } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [frequentlySearched, setFrequentlySearched] = useState([{
    title: "LED Lighting",
    slug: "led-lighting",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
  }, {
    title: "Industrial Tools",
    slug: "industrial-tools",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400"
  }, {
    title: "Consumer Electronics",
    slug: "consumer-electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400"
  }]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  const navigate = useNavigate();
  const {
    content
  } = useSiteContent();
  const carouselRef = useRef<HTMLDivElement>(null);
  const promoSlides = [{
    title: "Top Deals for Global Buyers",
    subtitle: "Discover verified suppliers and bulk discounts on high-demand products.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    cta: "Shop Now",
    categorySlug: "top-deals"
  }, {
    title: "New Arrivals - Fast Shipping",
    subtitle: "Explore the latest products from trusted manufacturers worldwide.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    cta: "Explore",
    categorySlug: "new-arrivals"
  }, {
    title: "Custom Manufacturing & OEM",
    subtitle: "Request custom orders and production directly from factories.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    cta: "Request Quote",
    categorySlug: "custom-manufacturing"
  }];
  useEffect(() => {
    const fetchCategories = async () => {
      const {
        data
      } = await supabase.from("categories").select("id, name, slug").is("parent_id", null).limit(10);
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % promoSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promoSlides.length]);
  const handleCategoryClick = (slug: string) => {
    navigate(`/products?category=${slug}`);
  };
  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = 240;
    carouselRef.current.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };
  if (!content.heroBanner?.enabled) return null;
  return <section className="bg-background py-4 md:py-6 border-primary-foreground">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Floating Category Button (Tablet + Desktop) */}
          <div className="hidden md:flex">
            <button onClick={() => setShowCategories(true)} className="fixed left-4 bottom-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg border border-border hover:bg-muted transition">
              <Menu className="w-4 h-4" />
              <span className="text-sm font-medium">All Categories</span>
            </button>
          </div>

          {/* Category Modal */}
          {showCategories && <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowCategories(false)} />
              <div className="relative w-[90%] max-w-md bg-background rounded-xl shadow-lg border border-border">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-bold">All Categories</h3>
                  <button onClick={() => setShowCategories(false)} className="p-2 rounded-full hover:bg-muted">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  {categories.map(cat => <button key={cat.id} onClick={() => {
                setShowCategories(false);
                handleCategoryClick(cat.slug);
              }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition">
                      {cat.name}
                    </button>)}
                </div>
              </div>
            </div>}

          {/* Center: Frequently Searched */}
          <div className="lg:col-span-6">
            <div className="bg-muted/30 rounded-xl p-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <span className="text-lg font-semibold">Welcome to Alibaba.com</span>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <button onClick={() => navigate("/products")} className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Target className="h-4 w-4" />
                    Browse Products
                  </button>
                  <span className="text-muted-foreground hidden md:inline">|</span>
                  <button onClick={() => navigate("/products?category=top-selling")} className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Sparkles className="h-4 w-4" />
                    Top Selling
                  </button>
                  <span className="text-muted-foreground hidden md:inline">|</span>
                  <button onClick={() => navigate("/products?category=new-arrivals")} className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Zap className="h-4 w-4" />
                    New Arrivals
                  </button>
                </div>
              </div>
            </div>

            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background shadow-lg border border-border hover:bg-muted" onClick={() => scrollCarousel("left")}>
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div ref={carouselRef} className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-2 md:px-8">
                {frequentlySearched.map((item, index) => <div key={index} onClick={() => navigate(`/products?category=${item.slug}`)} className="shrink-0 w-[220px] sm:w-[240px] md:w-[260px] bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground">Trending</p>
                      <p className="font-semibold">{item.title}</p>
                    </div>
                    <div className="aspect-[4/3] bg-muted">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  </div>)}
              </div>

              <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background shadow-lg border border-border hover:bg-muted" onClick={() => scrollCarousel("right")}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Promo Carousel */}
          <div className="lg:col-span-3">
            <div className="relative h-full min-h-[220px] rounded-xl overflow-hidden">
              {promoSlides.map((slide, index) => <div key={index} className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                  <div className="absolute inset-0 bg-cover bg-center" style={{
                backgroundImage: `url(${slide.image})`
              }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-bold">{slide.title}</h3>
                    <p className="text-sm text-white/80 mb-3">{slide.subtitle}</p>
                    <Button size="sm" variant="secondary" className="rounded-full" onClick={() => navigate(`/products?category=${slide.categorySlug}`)}>
                      {slide.cta}
                    </Button>
                  </div>
                </div>)}

              <div className="absolute bottom-2 right-4 flex gap-1.5">
                {promoSlides.map((_, index) => <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"}`} />)}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>;
};