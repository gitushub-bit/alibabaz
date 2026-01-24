import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ActionCards } from "@/components/home/ActionCards";
import { BrowsingHistory } from "@/components/home/BrowsingHistory";
import { TopDeals } from "@/components/home/TopDeals";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedSuppliers } from "@/components/home/FeaturedSuppliers";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { RFQBanner } from "@/components/home/RFQBanner";
import { SignInBanner } from "@/components/home/SignInBanner";
import { GlobalIndustryHubs } from "@/components/home/GlobalIndustryHubs";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <main>
        <HeroBanner />
        <ActionCards />
        <BrowsingHistory />
        <TopDeals />
        <FeaturedCategories />
        <GlobalIndustryHubs />
        <RFQBanner />
        <FeaturedSuppliers />
        <TrendingProducts />
      </main>

      <SignInBanner />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
