import Banner from "../components/Banner";
import BestSellers from "../components/BestSellers";
import BrandBanner from "../components/BrandBanner";
import Categories from "../components/Categories";
import Exclusive from "../components/Exclusive";
import HeroSection from "../components/HeroSection";
import StaffPick from "../components/StaffPick";

function Home({ cmsData }) {
  return (
    <>
      <HeroSection data={cmsData.cmsData.heroSection} />
      <BestSellers /> 
      <Categories categories={cmsData.cmsData.categories} />
      <Exclusive  />
      <Banner data={cmsData.cmsData.banner} />
      <StaffPick />
      <BrandBanner brands={cmsData.cmsData.brandBanner} />
    </>
  );
}

export default Home;