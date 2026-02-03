import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Shirt, Smartphone, Home, Tent, Sparkles, Box, Baby, Watch, Star } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  icon?: React.ElementType;
}

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const MegaMenu = ({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave
}: MegaMenuProps) => {
  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Hardcoded categories to match Real Alibaba Visuals
  const STATIC_CATEGORIES: Category[] = [
    { id: "0", name: "Categories for you", slug: "for-you", parent_id: null, image_url: null, icon: Star },
    { id: "1", name: "Apparel & Accessories", slug: "apparel-accessories", parent_id: null, image_url: null, icon: Shirt },
    { id: "2", name: "Consumer Electronics", slug: "consumer-electronics", parent_id: null, image_url: null, icon: Smartphone },
    { id: "3", name: "Home & Garden", slug: "home-garden", parent_id: null, image_url: null, icon: Home },
    { id: "4", name: "Sports & Entertainment", slug: "sports-entertainment", parent_id: null, image_url: null, icon: Tent },
    { id: "5", name: "Beauty", slug: "beauty", parent_id: null, image_url: null, icon: Sparkles },
    { id: "6", name: "Packaging & Printing", slug: "packaging-printing", parent_id: null, image_url: null, icon: Box },
    { id: "7", name: "Mother, Kids & Toys", slug: "mother-kids-toys", parent_id: null, image_url: null, icon: Baby },
    { id: "8", name: "Jewelry, Eyewear & Watches", slug: "jewelry-eyewear-watches", parent_id: null, image_url: null, icon: Watch },
    // Use fallback visuals for sub-items
    { id: "001", name: "Electric Motorcycles", slug: "electric-motorcycles", parent_id: "0", image_url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=200&q=80" },
    { id: "002", name: "Laptops", slug: "laptops", parent_id: "0", image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&q=80" },
    { id: "003", name: "Drones", slug: "drones", parent_id: "0", image_url: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=200&q=80" },
    { id: "004", name: "Smart Watches", slug: "smart-watches", parent_id: "0", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80" },
    { id: "005", name: "Wedding Dresses", slug: "wedding-dresses", parent_id: "0", image_url: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=200&q=80" },
    { id: "006", name: "Soocas", slug: "soocas", parent_id: "0", image_url: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&q=80" },
    { id: "101", name: "Men's Clothing", slug: "mens-clothing", parent_id: "1", image_url: "https://images.unsplash.com/photo-1617137968427-85924c809a10?w=200&q=80" },
    { id: "102", name: "Women's Clothing", slug: "womens-clothing", parent_id: "1", image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&q=80" },
    { id: "103", name: "Sportswear", slug: "sportswear", parent_id: "1", image_url: "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=200&q=80" },
    { id: "104", name: "Carnival Costumes", slug: "carnival-costumes", parent_id: "1", image_url: "https://images.unsplash.com/photo-1551506076-24e54e4df9d2?w=200&q=80" },
    { id: "201", name: "Mobile Phones", slug: "mobile-phones", parent_id: "2", image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80" },
    { id: "202", name: "Computer Hardware", slug: "computer-hardware", parent_id: "2", image_url: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=200&q=80" },
  ];

  const [categories, setCategories] = useState<Category[]>(STATIC_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string | null>("0");

  const parentCategories = categories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 top-[40px] z-[9999] bg-white animate-in fade-in duration-200"
      onMouseLeave={onMouseLeave || onClose}
      onMouseEnter={onMouseEnter}
    >
      <div className="max-w-[1440px] h-full mx-auto px-[60px] flex pt-4 relative">

        {/* LEFT SIDEBAR - Categories List */}
        <div className="w-[260px] h-full pb-20 overflow-y-auto shrink-0 border-r border-gray-100 pr-2 custom-scrollbar">
          <h3 className="text-[15px] font-bold text-[#111] mb-3 px-3 flex items-center gap-2">
            <Star size={16} className="text-[#333]" /> Categories for you
          </h3>
          <ul className="space-y-0.5">
            {parentCategories.map(category => (
              <li key={category.id}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-3 text-[14px] transition-all group border-l-[3px] ${activeCategory === category.id
                    ? "bg-[#f5f5f5] border-[#FF6600] font-bold text-[#111]"
                    : "bg-white border-transparent text-[#333] hover:bg-gray-50"
                    }`}
                  onMouseEnter={() => setActiveCategory(category.id)}
                >
                  {category.icon && <category.icon className={`h-[18px] w-[18px] shrink-0 ${activeCategory === category.id ? "text-[#FF6600]" : "text-gray-400 group-hover:text-[#FF6600]"}`} />}
                  <span className="flex-1 text-left leading-tight">{category.name}</span>
                  {activeCategory === category.id && <ChevronRight className="h-3.5 w-3.5 text-[#FF6600] shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT CONTENT - Subcategories Grid */}
        <div className="flex-1 pl-8 h-full overflow-y-auto pb-32 custom-scrollbar">
          {activeCategory && (
            <div className="animate-in fade-in slide-in-from-left-1 duration-200">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                {parentCategories.find(c => c.id === activeCategory)?.name}
                <Link to={`/products?cat=${activeCategory}`} className="ml-auto text-sm font-normal text-gray-500 hover:text-[#FF6600] flex items-center">
                  View all <ChevronRight size={14} />
                </Link>
              </h3>

              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-y-8 gap-x-2">
                {getSubcategories(activeCategory).length > 0 ? (
                  getSubcategories(activeCategory).map(sub => (
                    <Link
                      key={sub.id}
                      to={`/products?category=${encodeURIComponent(sub.slug)}`}
                      onClick={onClose}
                      className="group flex flex-col items-center text-center gap-3 p-2 rounded-xl transition-colors hover:shadow-sm"
                    >
                      <div className="relative w-[80px] h-[80px] rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden group-hover:border-[#FF6600] group-hover:ring-2 group-hover:ring-orange-100 transition-all">
                        {sub.image_url ? (
                          <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-xl font-bold text-gray-300">{sub.name.charAt(0)}</div>
                        )}
                      </div>
                      <span className="text-[12px] text-[#333] group-hover:text-[#FF6600] font-medium leading-tight px-1 h-[32px] overflow-hidden">
                        {sub.name}
                      </span>
                    </Link>
                  ))
                ) : (
                  // EMPTY STATE FALLBACK - Show generic featured items instead of nothing
                  STATIC_CATEGORIES.slice(0, 14).map(sub => (
                    <Link
                      key={`fallback-${sub.id}`}
                      to={`/products?category=${encodeURIComponent(sub.slug)}`}
                      onClick={onClose}
                      className="group flex flex-col items-center text-center gap-3 p-2 rounded-xl transition-colors hover:shadow-sm grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
                    >
                      <div className="relative w-[80px] h-[80px] rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden group-hover:border-[#FF6600] transition-all">
                        {sub.image_url ? (
                          <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-xl font-bold text-gray-300">{sub.name.charAt(0)}</div>
                        )}
                      </div>
                      <span className="text-[12px] text-[#333] group-hover:text-[#FF6600] font-medium leading-tight px-2">
                        {sub.name}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
