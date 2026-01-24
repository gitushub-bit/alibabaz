import { useState, useEffect } from "react";
import { ChevronRight, Globe, RefreshCw } from "lucide-react";
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
          image: product.image || "https://via.placeholder.com/300",
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
            image: product.images?.[0] || "https://via.placeholder.com/300",
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
    <section className="py-8 md:py-12 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="section-header mb-6">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            <h2 className="section-title text-lg md:text-xl lg:text-2xl">
              Global Industry Hubs
            </h2>
          </div>

          <button
            onClick={() => navigate("/industry-hubs")}
            className="text-sm md:text-base text-primary font-medium flex items-center gap-1 hover:underline"
          >
            Explore all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4">
          {countryHubs.map((hub) => (
            <button
              key={hub.country}
              onClick={() =>
                setSelectedCountry(selectedCountry === hub.country ? null : hub.country)
              }
              className={`shrink-0 flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl transition-all duration-200 min-w-[80px] md:min-w-[100px] lg:min-w-[120px] ${
                selectedCountry === hub.country
                  ? "bg-primary text-primary-foreground shadow-xl border border-primary"
                  : "bg-card hover:bg-muted border border-border hover:border-primary/50"
              }`}
            >
              <span className="text-3xl md:text-4xl lg:text-5xl">{hub.flag}</span>
              <span className="text-xs md:text-sm font-medium text-center line-clamp-1">
                {hub.country}
              </span>
            </button>
          ))}
        </div>

        {selectedCountry && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setSelectedCountry(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>

            {countryHubs
              .filter((hub) => hub.country === selectedCountry)
              .map((hub) => (
                <div key={hub.country} className="bg-card rounded-xl p-4 md:p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <span className="text-4xl md:text-5xl lg:text-6xl">{hub.flag}</span>
                    <div>
                      <h3 className="font-bold text-lg md:text-xl lg:text-2xl">{hub.country}</h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {hub.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {hub.products.map((product) => (
                      <Link 
                        key={product.id} 
                        to={`/product-insights/${product.id}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group cursor-pointer"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <p className="text-xs md:text-sm font-medium line-clamp-1">
                          {product.title}
                        </p>
                        <p className="text-xs md:text-sm text-primary font-semibold">
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
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {countryHubs.slice(0, 5).map((hub) => (
              <button
                key={hub.country}
                onClick={() => setSelectedCountry(hub.country)}
                className="bg-card rounded-xl p-4 md:p-5 border border-border hover:border-primary/50 transition-all text-left group"
              >
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <span className="text-2xl md:text-3xl lg:text-4xl">{hub.flag}</span>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm md:text-base truncate">{hub.country}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                      {hub.specialty}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 md:gap-2">
                  {hub.products.slice(0, 3).map((product, idx) => (
                    <div key={idx} className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
