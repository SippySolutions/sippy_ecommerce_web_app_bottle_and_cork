import { motion } from "framer-motion";

function BrandBanner({ brands }) {
  const marqueeVariants = {
    animate: {
      x: ["0%", "-100%"], // Slide from 0% to -100%
      transition: {
        x: {
          repeat: Infinity, // Infinite loop
          repeatType: "loop",
          duration: 15, // Duration of the animation
          ease: "linear", // Smooth linear animation
        },
      },
    },
  };

  return (
    <section className="bg-[var(--color-background)] py-8 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="flex justify-center items-center gap-8"
          variants={marqueeVariants}
          animate="animate"
        >
          {brands.map((brand, index) => (
            <div key={index} className="flex items-center flex-shrink-0">
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-36 w-36 object-contain grayscale hover:grayscale-0 transition duration-300"
                style={{ minWidth: "9rem", minHeight: "9rem" }} // Explicitly set min width and height
              />
            </div>
          ))}
          {/* Duplicate the brands for seamless looping */}
          {brands.map((brand, index) => (
            <div key={`duplicate-${index}`} className="flex items-center flex-shrink-0">
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-36 w-36 object-contain grayscale hover:grayscale-0 transition duration-300"
                style={{ minWidth: "9rem", minHeight: "9rem" }} // Explicitly set min width and height
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default BrandBanner;