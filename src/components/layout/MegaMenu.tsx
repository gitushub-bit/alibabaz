import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
}
interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}
export const MegaMenu = ({
  isOpen,
  onClose
}: MegaMenuProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const {
        data
      } = await supabase.from("categories").select("id, name, slug, parent_id, image_url").order("name");
      if (data) setCategories(data);
    })();
  }, []);
  const parentCategories = categories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent_id === parentId);
  if (!isOpen) return null;
  return <div className="absolute left-0 right-0 top-full bg-background border-b border-border shadow-lg z-50" onMouseLeave={onClose}>
      <div className="container py-6 border-primary-foreground">
        <div className="grid grid-cols-12 gap-6">
          {/* Parent Categories */}
          <div className="col-span-3 border-r border-border pr-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
              Browse
            </h3>

            <ul className="space-y-1">
              {/* Worldwide / All Products */}
              <li>
                <Link to="/products" onClick={onClose} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted">
                  <Globe className="h-4 w-4" />
                  Worldwide products
                </Link>
              </li>

              <li className="my-2 border-t" />

              {parentCategories.map(category => <li key={category.id}>
                  <button className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${activeCategory === category.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onMouseEnter={() => setActiveCategory(category.id)} onClick={() => {
                onClose();
              }}>
                    <span>{category.name}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </li>)}
            </ul>
          </div>

          {/* Subcategories */}
          <div className="col-span-9">
            {activeCategory ? <div>
                <h3 className="text-lg font-semibold mb-4">
                  {parentCategories.find(c => c.id === activeCategory)?.name}
                </h3>

                <div className="grid grid-cols-4 gap-4">
                  {getSubcategories(activeCategory).map(sub => <Link key={sub.id} to={`/products?category=${encodeURIComponent(sub.slug)}`} onClick={onClose} className="group p-3 rounded-lg hover:bg-muted transition-colors">
                      {sub.image_url && <div className="w-12 h-12 mb-2 rounded-md overflow-hidden bg-muted">
                          <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover" />
                        </div>}
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {sub.name}
                      </span>
                    </Link>)}

                  {/* If no subcategories exist, show a fallback */}
                  {getSubcategories(activeCategory).length === 0 && <Link to={`/products?category=${parentCategories.find(c => c.id === activeCategory)?.slug}`} onClick={onClose} className="col-span-4 text-sm text-muted-foreground hover:underline">
                      Browse all products in this category →
                    </Link>}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Link to={`/products?category=${parentCategories.find(c => c.id === activeCategory)?.slug}`} onClick={onClose} className="text-sm text-primary hover:underline">
                    View all in{" "}
                    {parentCategories.find(c => c.id === activeCategory)?.name} →
                  </Link>
                </div>
              </div> : <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Hover over a category to see subcategories</p>
              </div>}
          </div>
        </div>
      </div>
    </div>;
};