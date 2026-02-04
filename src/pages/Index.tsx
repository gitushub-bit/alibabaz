
import AlibabaHeader from "@/components/layout/AlibabaHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { WelcomeSection } from "@/components/home/WelcomeSection";
import { FlashSale } from "@/components/home/FlashSale";
import { BestSellers } from "@/components/home/BestSellers";
import { UpcomingDeals } from "@/components/home/UpcomingDeals";
import { CustomerFavorites } from "@/components/home/CustomerFavorites";
import { TopDeals } from "@/components/home/TopDeals";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { GlobalIndustryHubs } from "@/components/home/GlobalIndustryHubs";
import { RFQBanner } from "@/components/home/RFQBanner";
import { FeaturedSuppliers } from "@/components/home/FeaturedSuppliers";
import { SignInBanner } from "@/components/home/SignInBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AlibabaHeader />

      <main>
        {/* Hero Section */}
        <WelcomeSection />

        {/* Flash Sale - High Priority */}
        <FlashSale />

        {/* Best Sellers - Social Proof */}
        <BestSellers />

        {/* Customer Favorites - Community Picks */}
        <CustomerFavorites />

        {/* Upcoming Deals - Build Anticipation */}
        <UpcomingDeals />

        {/* Top Deals - Existing Component */}
        <TopDeals />

        {/* Trending Products - Discovery */}
        <TrendingProducts />

        {/* Featured Categories - Simplified */}
        <FeaturedCategories />

        {/* Global Industry Hubs */}
        <GlobalIndustryHubs />

        {/* RFQ Banner */}
        <RFQBanner />

        {/* Featured Suppliers */}
        <FeaturedSuppliers />
      </main>

      <SignInBanner />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
