import { useState, useEffect } from "react";
import {
  ChevronRight,
  Package,
  Home,
  FlaskConical,
  Shirt,
  Watch,
  CircleDot,
  TestTube,
  Building2,
  Sparkles,
  Baby,
  Gift,
  Stethoscope,
  UtensilsCrossed,
  Smartphone,
  Leaf,
  BookOpen,
  Factory,
  Wrench,
  Tv,
  Heart,
  Dumbbell,
  Layers,
  Settings,
  Laptop,
  Sofa,
  Car,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryProductsModal } from "./CategoryProductsModal";
import { useIsMobile } from "@/hooks/use-mobile";

const iconMap: Record<string, LucideIcon> = {
  "Packaging & Printing": Package,
  "Home & Garden": Home,
  Chemicals: FlaskConical,
  "Apparel & Accessories": Shirt,
  "Jewelry, Eyewear, Watches & Accessories": Watch,
  "Rubber & Plastics": CircleDot,
  "Testing Instrument & Equipment": TestTube,
  "Construction & Real Estate": Building2,
  "Personal Care & Household Cleaning": Sparkles,
  "Mother, Kids & Toys": Baby,
  "Gifts & Crafts": Gift,
  "Medical Devices & Supplies": Stethoscope,
  "Food & Beverage": UtensilsCrossed,
  "Consumer Electronics": Smartphone,
  Beauty: Sparkles,
  Agriculture: Leaf,
  "School & Office Supplies": BookOpen,
  "Commercial Equipment & Machinery": Factory,
  "Industrial Machinery": Wrench,
  "Home Appliances": Tv,
  "Health Care": Heart,
  "Sports & Entertainment": Dumbbell,
  "Metals & Alloys": Layers,
  "Fabrication Services": Settings,
  Electronics: Laptop,
  Furniture: Sofa,
  "Vehicles & Transportation": Car,
  Machinery: Factory,
};

const colorMap: Record<string, string> = {
  "Packaging & Printing": "bg-amber-100 text-amber-600",
  "Home & Garden": "bg-green-100 text-green-600",
  Chemicals: "bg-purple-100 text-purple-600",
  "Apparel & Accessories": "bg-pink-100 text-pink-600",
  "Jewelry, Eyewear, Watches & Accessories": "bg-yellow-100 text-yellow-600",
  "Rubber & Plastics": "bg-gray-100 text-gray-600",
  "Testing Instrument & Equipment": "bg-blue-100 text-blue-600",
  "Construction & Real Estate": "bg-orange-100 text-orange-600",
  "Personal Care & Household Cleaning": "bg-cyan-100 text-cyan-600",
  "Mother, Kids & Toys": "bg-rose-100 text-rose-600",
  "Gifts & Crafts": "bg-fuchsia-100 text-fuchsia-600",
  "Medical Devices & Supplies": "bg-red-100 text-red-600",
  "Food & Beverage": "bg-lime-100 text-lime-600",
  "Consumer Electronics": "bg-indigo-100 text-indigo-600",
  Beauty: "bg-pink-100 text-pink-600",
  Agriculture: "bg-emerald-100 text-emerald-600",
  "School & Office Supplies": "bg-sky-100 text-sky-600",
  "Commercial Equipment & Machinery": "bg-slate-100 text-slate-600",
  "Industrial Machinery": "bg-zinc-100 text-zinc-600",
  "Home Appliances": "bg-teal-100 text-teal-600",
  "Health Care": "bg-rose-100 text-rose-600",
  "Sports & Entertainment": "bg-violet-100 text-violet-600",
  "Metals & Alloys": "bg-neutral-100 text-neutral-600",
  "Fabrication Services": "bg-stone-100 text-stone-600",
  Electronics: "bg-blue-100 text-blue-600",
  Furniture: "bg-amber-100 text-amber-600",
  "Vehicles & Transportation": "bg-cyan-100 text-cyan-600",
  Machinery: "bg-gray-100 text-gray-600",
};

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

export const FeaturedCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const { content } = useSiteContent();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, image_url")
      .is("parent_id", null)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error loading categories:", error);
      setLoading(false);
      return;
    }

    if (data) setCategories(data);
    setLoading(false);
  };

  if (!content.featuredCategories?.enabled) return null;

  if (loading) {
    return (
      <section className="py-6 px-4">
        <div className="section-header">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-2xl" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const displayedCategories = showAll ? categories : categories.slice(0, 16);

  const handleCategoryClick = (category: Category) => {
    if (isMobile) {
      // On mobile, navigate directly
      navigate(`/products?category=${category.slug}`);
    } else {
      // On desktop, show modal
      setSelectedCategory(category);
      setIsModalOpen(true);
    }
  };

  return (
    <section className="py-6 px-4">
      <div className="section-header">
        <h2 className="section-title">
          {content.featuredCategories?.title || "Browse Categories"}
        </h2>

        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
        >
          {showAll ? "Show less" : "View all"} <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
        {displayedCategories.map((category) => {
          const IconComponent = iconMap[category.name] || Package;
          const colorClass = colorMap[category.name] || "bg-primary/10 text-primary";

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="flex flex-col items-center gap-1.5 md:gap-2 group"
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center ${colorClass} transition-transform group-hover:scale-110`}
              >
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>

              <span className="text-[10px] md:text-xs font-medium text-foreground text-center line-clamp-2 leading-tight">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Products Modal (Desktop only) */}
      {selectedCategory && (
        <CategoryProductsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCategory(null);
          }}
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
        />
      )}
    </section>
  );
};
