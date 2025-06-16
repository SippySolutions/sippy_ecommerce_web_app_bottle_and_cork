// Default CMS Data - fallback values
const defaultCmsData = {
  theme: {
    primary: '#1E1E1E',
    secondary: '#373737',
    accent: '#FF5722',
    muted: '#F2F2F2',
    background: '#121212',
    headingText: '#FFFFFF',
    bodyText: '#CCCCCC',
    linkText: '#FF5722',
  },
  storeInfo: {
    name: 'Universal Liquors',
    email: 'universalliquors@gmail.com',
    phone: '(201) 863-96544',
    address: '2117 Bergenline Ave #1, Union City, NJ 07087',
    storeHours: {
      monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '23:00' },
      saturday: { open: '09:00', close: '23:00' },
      sunday: { open: '12:00', close: '20:00' },
    },
    tax: { rate: 6.6 }
  },
  heroSection: {
    leftBanner: {
      title: 'Exclusive Wine Collections',
      subtitle: 'Up to 20% Off',
      buttonText: 'SHOP NOW',
      image: 'https://qualityliquorstore.com/cdn/shop/files/elijah-pga-trophy.jpg?v=1744229403&width=537'
    },
    rightBanners: []
  },
  banner: {
    title: 'UP TO 50% OFF',
    subtitle: 'BIG SALE OFF ALL ITEMS',
    buttonText: 'SHOP NOW',
    description: 'Coming soon on October.',
    image: 'https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/offerBanner/offerbanner.png'
  },
  brandBanner: [],
  logo: 'https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/Logo.png',
  bestSellers: [],
  categories: [],
  promo_banner: {
    promo_1: "https://cityhive-prod-cdn.cityhive.net/media_gallery/payments/city_hive/5a04398ee779890ec4deae24/image/6849eddcf75f645186377c4f.png?1749675484",
    promo_2: "https://cityhive-prod-cdn.cityhive.net/media_gallery/supplier/5ea05dc0e99c8d493991bb48/image/682de834ddba3c2962da685e.png?1747839028",
    promo_3: "https://cityhive-prod-cdn.cityhive.net/media_gallery/supplier/5ea9a30bddd8f112bbb0d0dc/image/681ccd01d943472782d987d9.png?1746717953"
  }
};

export default defaultCmsData;
