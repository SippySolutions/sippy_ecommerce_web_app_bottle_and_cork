function Banner({ data }) {
  return (
    <section
      className="text-white relative w-full"
      style={{
        backgroundImage: `url('${encodeURI(data.image)}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        aspectRatio: window.innerWidth < 768 ? '16/9' : '4/1', // Taller aspect ratio for mobile
        minHeight: window.innerWidth < 768 ? '300px' : '200px', // Taller minimum height for mobile
        maxHeight: window.innerWidth < 768 ? '500px' : '400px'
      }}
    >
      <div className="absolute inset-0" style={{
        background: "rgba(0,0,0,0.6)", // Slightly darker overlay for better text readability
        color: "var(--color-bodyText)",
      }}></div>
      <div className="container mx-auto px-3 sm:px-4 h-full flex items-center relative z-10 py-6 sm:py-8 lg:py-12">
        {/* Content - Left-aligned on all screen sizes */}
        <div className="w-full text-left sm:w-2/3 lg:w-2/3 xl:w-1/2 px-2 sm:pl-4 lg:pl-8">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-tight">
            {data.title}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl font-medium mb-3 sm:mb-4 lg:mb-6 text-white/90 max-w-xl">
            {data.subtitle}
          </p>
          <p className="text-sm sm:text-sm lg:text-base mb-4 sm:mb-6 lg:mb-8 text-white/80 max-w-lg sm:max-w-2xl leading-relaxed">
            {data.description}
          </p>
          <button className="bg-[var(--color-accent)] text-[var(--color-headText)] px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-lg font-bold hover:bg-[var(--color-primary)] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base">
            {data.buttonText}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Banner;