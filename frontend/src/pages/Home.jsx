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
   
      
      <HeroSection data={getHeroSection()} />
     
      
      <Categories categories={getCategories()} />
      <BestSellers /> 
      <PromoBanner type="carousel" />
      <Exclusive  />
      <Banner data={getBanner()} />
      <StaffPick />
      <div className="container mx-auto px-4">
        </div>
      <BrandBanner brands={getBrandBanner()} />
    </div>
  );
}

export default Home;