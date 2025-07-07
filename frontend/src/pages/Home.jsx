import Banner from "../components/Banner";
import BestSellers from "../components/BestSellers";
import BrandBanner from "../components/BrandBanner";
import Categories from "../components/Categories";
import Exclusive from "../components/Exclusive";
import HeroSection from "../components/HeroSection";
import StaffPick from "../components/StaffPick";
import PromoBanner from "../components/PromoBanner";
import AndroidDownloadLink from "../components/AndroidDownloadLink";
import { useCMS } from "../Context/CMSContext";

function Home() {  const { 
    getHeroSection, 
    getBanner, 
    getBrandBanner, 
    getCategories,
    getTheme,
    loading 
  } = useCMS();
    const theme = getTheme();

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: theme.muted || '#F5F5F5' }}>
      {/* Mobile-optimized promo banner */}
      <div className="block md:hidden relative z-0">
        <PromoBanner type="carousel" />
      </div>
      
      {/* Desktop promo banner */}
      <div className="hidden md:block container mx-auto px-4 relative z-0">
        <PromoBanner type="horizontal" />
      </div>
      
      <HeroSection data={getHeroSection()} />
      
      {/* App Download Banner - Only show in web browsers */}
      <div className="container mx-auto px-4 py-4">
        <AndroidDownloadLink 
          variant="banner"
          className="mb-6"
        />
      </div>
      
      <Categories categories={getCategories()} />
      <BestSellers /> 
      <Banner data={getBanner()} />
      
      <Exclusive  />
       <PromoBanner type="carousel" />
      <StaffPick />
      <div className="container mx-auto px-4">
        </div>
      <BrandBanner brands={getBrandBanner()} />
    </div>
  );
}

export default Home;