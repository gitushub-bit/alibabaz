
import AlibabaHeader from "@/components/layout/AlibabaHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ActionCards } from "@/components/home/ActionCards";
import { FeaturedSelections } from "@/components/home/FeaturedSelections";
import { BrowsingHistory } from "@/components/home/BrowsingHistory";
import { TopDeals } from "@/components/home/TopDeals";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedSuppliers } from "@/components/home/FeaturedSuppliers";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { RFQBanner } from "@/components/home/RFQBanner";


import { SignInBanner } from "@/components/home/SignInBanner";
import { GlobalIndustryHubs } from "@/components/home/GlobalIndustryHubs";
import CategoriesSection from "@/components/home/CategoriesSection";
import { WelcomeSection } from "@/components/home/WelcomeSection";


const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AlibabaHeader />


      <main>
        <WelcomeSection />
        <FeaturedSelections />
        <ActionCards />
        <BrowsingHistory />
        <TopDeals />
        <CategoriesSection />
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
