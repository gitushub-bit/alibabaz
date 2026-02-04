
import AlibabaHeader from "@/components/layout/AlibabaHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { WelcomeSection } from "@/components/home/WelcomeSection";
import { FlashSale } from "@/components/home/FlashSale";
import { UpcomingDeals } from "@/components/home/UpcomingDeals";
import { BestSellers } from "@/components/home/BestSellers";
import { CustomerFavorites } from "@/components/home/CustomerFavorites";
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

        {/* Flash Sale - Time-Sensitive Offers */}
        <FlashSale />

        {/* Upcoming Deals - Build Anticipation */}
        <UpcomingDeals />

        {/* Top Performing Products */}
        <BestSellers />

        {/* Trending Globally */}
        <CustomerFavorites />

        {/* Trending Products - Latest Additions */}
        <TrendingProducts />

        {/* Featured Categories - Browse by Industry */}
        <FeaturedCategories />

        {/* Global Industry Hubs - International Sourcing */}
        <GlobalIndustryHubs />

        {/* RFQ Banner - Request for Quotation */}
        <RFQBanner />

        {/* Featured Suppliers - Verified Partners */}
        <FeaturedSuppliers />
      </main>

      <SignInBanner />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
