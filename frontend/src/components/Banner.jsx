function Banner({ data }) {
  return (
    <section
      className="text-white relative w-full"
      style={{
        backgroundImage: `url('${encodeURI(data.image)}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        aspectRatio: '4/1',
        minHeight: '200px',
        maxHeight: '400px'
      }}
    >
      <div className="absolute inset-0" style={{
        background: "rgba(0,0,0,0.5)",
        color: "var(--color-bodyText)",
      }}></div>
      <div className="container mx-auto px-4 h-full flex items-center relative z-10 py-8 lg:py-12">
        {/* Left Content */}
        <div className="w-full lg:w-2/3 xl:w-1/2 text-left pl-4 lg:pl-8">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4 lg:mb-6 leading-tight">
            {data.title}
          </h1>
          <p className="text-lg lg:text-xl font-medium mb-4 lg:mb-6 text-white/90 max-w-xl">{data.subtitle}</p>
          <p className="text-sm lg:text-base mb-6 lg:mb-8 text-white/80 max-w-2xl leading-relaxed">{data.description}</p>
          <button className="bg-[var(--color-accent)] text-[var(--color-headText)] px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-bold hover:bg-[var(--color-primary)] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
            {data.buttonText}
          </button>
        </div>
        {/* Right Content removed */}
      </div>
    </section>
  );
}

export default Banner;