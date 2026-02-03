import { useState, useEffect } from "react";
import { ChevronRight, Globe, RefreshCw, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useCurrency } from "@/hooks/useCurrency";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface IndustryHubProduct {
  id: string;
  country: string;
  country_flag: string;
  specialty: string;
  title: string;
  image: string | null;
  price: string;
  product_id: string | null;
}

interface CountryHub {
  country: string;
  flag: string;
  specialty: string;
  products: {
    id: string;
    image: string;
    title: string;
    price: number;
    product_id: string | null;
  }[];
}

// Country mappings for dynamic generation
const countryMappings: Record<string, { flag: string; specialty: string }> = {
  China: { flag: "🇨🇳", specialty: "Electronics & Manufacturing" },
  India: { flag: "🇮🇳", specialty: "Textiles & IT Services" },
  USA: { flag: "🇺🇸", specialty: "Technology & Innovation" },
  Germany: { flag: "🇩🇪", specialty: "Engineering & Automotive" },
  Japan: { flag: "🇯🇵", specialty: "Electronics & Robotics" },
  Brazil: { flag: "🇧🇷", specialty: "Agriculture & Mining" },
  UK: { flag: "🇬🇧", specialty: "Finance & Pharmaceuticals" },
  France: { flag: "🇫🇷", specialty: "Luxury & Aerospace" },
  Italy: { flag: "🇮🇹", specialty: "Fashion & Machinery" },
  Canada: { flag: "🇨🇦", specialty: "Natural Resources" },
};

export const GlobalIndustryHubs = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryHubs, setCountryHubs] = useState<CountryHub[]>([]);
  const [loading, setLoading] = useState(true);
  const { content } = useSiteContent();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    fetchIndustryHubProducts();
  }, []);

  const fetchIndustryHubProducts = async () => {
    // First try to get from industry_hub_products table
    const { data: hubData, error: hubError } = await supabase
      .from("industry_hub_products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (hubData && hubData.length > 0 && !hubError) {
      const grouped = hubData.reduce((acc: Record<string, CountryHub>, product: IndustryHubProduct) => {
        if (!acc[product.country]) {
          acc[product.country] = {
            country: product.country,
            flag: product.country_flag,
            specialty: product.specialty,
            products: []
          };
        }

        // Parse price from string (e.g., "$25" -> 25)
        const priceValue = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;

        acc[product.country].products.push({
          id: product.id,
          image: product.image || "",
          title: product.title,
          price: priceValue,
          product_id: product.product_id
        });

        return acc;
      }, {});

      setCountryHubs(Object.values(grouped));
      setLoading(false);
      return;
    }

    // Fallback: Load random products from database and group by countries
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, title, images, price_min")
      .eq("published", true)
      .limit(60);

    if (products && products.length > 0 && !prodError) {
      const shuffled = products.sort(() => Math.random() - 0.5);
      const countries = Object.keys(countryMappings);
      const grouped: Record<string, CountryHub> = {};

      shuffled.forEach((product, index) => {
        const countryName = countries[index % countries.length];
        const countryInfo = countryMappings[countryName];

        if (!grouped[countryName]) {
          grouped[countryName] = {
            country: countryName,
            flag: countryInfo.flag,
            specialty: countryInfo.specialty,
            products: []
          };
        }

        if (grouped[countryName].products.length < 6) {
          grouped[countryName].products.push({
            id: product.id,
            image: product.images?.[0] || "",
            title: product.title,
            price: product.price_min || 0,
            product_id: product.id
          });
        }
      });

      setCountryHubs(Object.values(grouped));
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="py-8 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="section-header mb-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="shrink-0 w-20 h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (countryHubs.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-[#f4f4f4]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-[#333]">
              Global Industry Hubs
            </h2>
          </div>

          <button
            onClick={() => navigate("/industry-hubs")}
            className="text-sm font-medium text-[#666] hover:text-[#ff6a00] flex items-center gap-1 transition-colors"
          >
            Explore all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {countryHubs.map((hub) => (
            <button
              key={hub.country}
              onClick={() =>
                setSelectedCountry(selectedCountry === hub.country ? null : hub.country)
              }
              className={`shrink-0 flex flex-col items-center justify-center gap-3 p-4 rounded-lg border transition-all duration-300 w-[140px] md:w-[160px] h-[120px] md:h-[140px] bg-white
                ${selectedCountry === hub.country
                  ? "border-[#ff6a00] shadow-md ring-1 ring-[#ff6a00]"
                  : "border-gray-200 hover:border-[#ff6a00] hover:shadow-lg"
                }`}
            >
              <div className="text-5xl md:text-6xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                {hub.flag}
              </div>
              <span className={`text-sm font-medium ${selectedCountry === hub.country ? "text-[#ff6a00]" : "text-[#333]"}`}>
                {hub.country}
              </span>
            </button>
          ))}
        </div>

        {selectedCountry && (
          <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setSelectedCountry(null)}
                className="text-sm text-[#666] hover:text-[#333] flex items-center gap-1"
              >
                Close view <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>

            {countryHubs
              .filter((hub) => hub.country === selectedCountry)
              .map((hub) => (
                <div key={hub.country} className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                    <span className="text-6xl md:text-7xl">{hub.flag}</span>
                    <div>
                      <h3 className="font-bold text-2xl md:text-3xl text-[#333]">{hub.country}</h3>
                      <p className="text-base text-[#666] mt-1">
                        {hub.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                    {hub.products.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product-insights/${product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 mb-3 border border-gray-100 group-hover:border-[#ff6a00] transition-colors relative">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={28} />
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-[#333] line-clamp-2 mb-1 group-hover:text-[#ff6a00] transition-colors">
                          {product.title}
                        </p>
                        <p className="text-sm font-bold text-[#333]">
                          {formatPrice(product.price)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {!selectedCountry && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Show expanded details for first few countries as preview if needed, or keeping it clean with just the flags above */}
            {/* Currently hiding this section to keep it clean as per "professional" design, allowing user to click flags to explore */}
          </div>
        )}
      </div>
    </section>
  );
};
