import Banner from "../components/Banner";
import FeaturedSection from "../components/FeaturedSection";
import BrandBanner from "../components/BrandBanner";
import Categories from "../components/Categories";
import HeroSection from "../components/HeroSection";
import PromoBanner from "../components/PromoBanner";
import AndroidDownloadLink from "../components/AndroidDownloadLink";
import BrowseModeHeroCard from "../components/BrowseModeHeroCard";
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
      
      {/* Browse Mode Hero Card */}
      <div className="container mx-auto px-4 mt-6">
        <BrowseModeHeroCard />
      </div>
      
      <Categories categories={getCategories()} />
      
      {/* <FeaturedSection
        type="bestseller"
        title="Best Sellers"
        subtitle="The best selection of whiskey, vodka, and liquor"
        showSidebar={false}
        backgroundColor="bg-white"
      /> */}
      
      
      {/* <FeaturedSection
        type="exclusive"
        title={<>Our <span className="text-black">Exclusives</span></>}
        showSidebar={false}
        backgroundColor="bg-white"
      /> */}
      
      <Banner data={getBanner()} />
      
      {/* <FeaturedSection
        type="staffpick"
        title={<>Our <span className="text-black">Staff Pick</span></>}
        showSidebar={false}
        backgroundColor="bg-white"
      /> */}
      
      <div className="container mx-auto px-4">
        </div>
      <BrandBanner brands={getBrandBanner()} />
    </div>
  );
}

export default Home;