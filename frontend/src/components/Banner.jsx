function Banner({ data }) {
  return (
    <section
      className="text-white py-12 relative"
      style={{
           backgroundImage: `url('${encodeURI(data.image)}')`, 
      }}
      
    >
      <div className="absolute inset-0 " style={{
            background: "rgba(0,0,0,0.5)",
            color: "var(--color-bodyText)",
          }}></div>
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center relative z-10">
        {/* Left Content */}
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl font-bold mb-4">
            {data.title}
          </h1>
          <p className="text-lg font-medium mb-6">{data.subtitle}</p>
          <p className="text-sm mb-6">{data.description}</p>
          <button className="bg-[var(--color-accent)] text-[var(--color-headText)] px-6 py-2 rounded font-bold hover:bg-[var(--color-primary)]">
            {data.buttonText}
          </button>
        </div>
        {/* Right Content removed */}
      </div>
    </section>
  );
}

export default Banner;