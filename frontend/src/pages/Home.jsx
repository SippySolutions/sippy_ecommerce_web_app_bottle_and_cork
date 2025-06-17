import Banner from "../components/Banner";
import BestSellers from "../components/BestSellers";
import BrandBanner from "../components/BrandBanner";
import Categories from "../components/Categories";
import Exclusive from "../components/Exclusive";
import HeroSection from "../components/HeroSection";
import StaffPick from "../components/StaffPick";
import PromoBanner from "../components/PromoBanner";
import { useCMS } from "../Context/CMSContext";

function Home() {
  const { 
    getHeroSection, 
    getBanner, 
    getBrandBanner, 
    getCategories,
    loading 
  } = useCMS();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }  return (
    <>
      {/* Mobile-optimized promo banner */}
      <div className="block md:hidden">
        <PromoBanner type="carousel" />
      </div>
      
      {/* Desktop promo banner */}
      <div className="hidden md:block container mx-auto px-4">
        <PromoBanner type="horizontal" />
      </div>
      
      <HeroSection data={getHeroSection()} />
    <Categories categories={getCategories()} />
      <BestSellers /> 
      <Banner data={getBanner()} />
      
      <Exclusive  />
       <PromoBanner type="carousel" />
      <StaffPick />
      <div className="container mx-auto px-4">
      
      </div>
      <BrandBanner brands={getBrandBanner()} />
    </>
  );
}

export default Home;