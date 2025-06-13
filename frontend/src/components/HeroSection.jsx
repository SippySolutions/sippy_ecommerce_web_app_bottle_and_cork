import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function HeroSection(data) {
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2  min-h-[75vh]"
      style={{ backgroundColor: "var(--color-background)" }}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Left Section */}
      <motion.div
        className="relative h-64 sm:h-80 lg:h-full bg-cover bg-center  shadow-lg"
        style={{
          backgroundImage: `url('${encodeURI(data.data.leftBanner.image)}')`,
        }}
        variants={fadeIn}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center  p-4 sm:p-6 bg-[var(--color-background)]/50 "
         
        >
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4"
            style={{ color: "var(--color-headingText)" }}
          >
            {data.data.leftBanner.title}
          </h2>
          <p
            className="text-sm sm:text-lg mb-4 sm:mb-6"
            style={{ color: "var(--color-headingText)" }}
          >
            {data.data.leftBanner.subtitle}
          </p>
          <button
            className="px-6 sm:px-8 py-2 sm:py-3 font-bold rounded-lg shadow-md transition duration-300 text-[var(--color-headingText)] hover:bg-[var(--color-background)] bg-[var(--color-accent)]"
           
            onClick={() => navigate("/products")}
          >
            {data.data.leftBanner.buttonText}
          </button>
        </div>
      </motion.div>

      {/* Right Section */}
      <motion.div
        className="grid grid-rows-2 "
        variants={staggerContainer}
      >
        {data.data.rightBanners.map((banner, index) => (
          <motion.div
            key={index}
            className="relative h-40 sm:h-48 lg:h-full bg-cover bg-center rounded-lg shadow-lg"
            style={{
              backgroundImage: `url('${banner.image}')`,
            }}
            variants={fadeIn}
          >
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-lg p-3 sm:p-4 bg-[var(--color-background)]/50"
            >
              <h2
                className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2"
                style={{ color: "var(--color-headingText)" }}
              >
                {banner.title}
              </h2>
              <p
                className="text-xs sm:text-sm mb-2 sm:mb-4"
                style={{ color: "var(--color-headingText)" }}
              >
                {banner.subtitle}
              </p>
              <button
                className="px-4 sm:px-6 py-1 sm:py-2 font-bold rounded-lg shadow-md transition duration-300 hover:bg-[var(--color-background)] bg-[var(--color-accent)] text-[var(--color-headingText)]"
                
                onClick={() => navigate("/products")}
              >
                {banner.buttonText}
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default HeroSection;