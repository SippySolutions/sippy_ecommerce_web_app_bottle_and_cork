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
  }
  return (
    <>      <HeroSection data={getHeroSection()} />
      <BestSellers /> 
      <div className="container mx-auto px-4">
        <PromoBanner type="horizontal" />
      </div>
      <Categories categories={getCategories()} />
      <Exclusive  />
      <Banner data={getBanner()} />
      <StaffPick />
      <div className="container mx-auto px-4">
        <PromoBanner type="grid" />
      </div>
      <BrandBanner brands={getBrandBanner()} />
    </>
  );
}

export default Home;