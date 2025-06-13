import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams
import { fetchProducts, fetchDepartments } from "../services/api"; // Import the fetchDepartments API
import ProductCard from "../components/ProductCard"; // Import the ProductCard component
import Categories from "../components/Categories"; // Import the Categories component

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [departments, setDepartments] = useState([]); // State for departments
  const [selectedFilters, setSelectedFilters] = useState({
    departments: [],
    categories: [],
    subcategories: [],
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortOption, setSortOption] = useState("default");
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams(); // Initialize useSearchParams
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Fetch products and departments
    async function fetchData() {
      setLoading(true); // Start loading
      try {
        const productList = await fetchProducts();
        setProducts(productList);
        setFilteredProducts(productList);

        const departmentList = await fetchDepartments();
        setDepartments(departmentList.departments || []); // Ensure departments are set
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    }
    fetchData();
  }, []);

  // Handle filtering
  useEffect(() => {
    let filtered = products;

    // Filter by departments
    if (selectedFilters.departments.length > 0) {
      filtered = filtered.filter((product) =>
        selectedFilters.departments.includes(product.department)
      );
    }

    // Filter by categories
    if (selectedFilters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedFilters.categories.includes(product.category)
      );
    }

    // Filter by subcategories
    if (selectedFilters.subcategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedFilters.subcategories.includes(product.subcategory)
      );
    }

    // Apply sorting
    if (sortOption === "price-asc") {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === "name-asc") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "name-desc") {
      filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to the first page after filtering
  }, [products, selectedFilters, sortOption]);

  // Handle pagination
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (type, value) => {
    let filtered = products;

    if (type === "departments") {
      filtered = products.filter((product) => product.department === value);
      setSelectedCategory(value); // Update the title to the selected department
    } else if (type === "categories") {
      filtered = products.filter((product) => product.category === value);
      setSelectedCategory(value); // Update the title to the selected category
    } else if (type === "subcategories") {
      filtered = products.filter((product) => product.subcategory === value);
      setSelectedCategory(value); // Update the title to the selected subcategory
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to the first page
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to the first page
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSelectedFilters({
      departments: [],
      categories: [],
      subcategories: [],
    });
    setSelectedCategory(null);
    setFilteredProducts(products);
    setCurrentPage(1); // Reset to the first page
  };

  useEffect(() => {
    // Apply department filter from query parameter
    const department = searchParams.get("department");
    if (department) {
      const filtered = products.filter((product) => product.department === department);
      setFilteredProducts(filtered);
      setSelectedCategory(department); // Set the title to the selected department
    }
  }, [searchParams, products]);

  return (
    <div className="bg-white text-black">
      {/* Header Section */}
      <Categories />
      <div className="container mx-auto flex mt-8 ">
        <span className="text-[var(--color-muted-foreground)]">Home</span>
        <span className="mx-2 text-[var(--color-muted-foreground)]">→</span>
        <span className="text-[var(--color-muted-foreground)]">Shop</span>
      </div>
      <div className="container mx-auto flex mt-8 ">
        {/* Sidebar Filters */}
        <aside className="w-1/4 p-6 bg-[var(--color-muted)] mr-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold mb-4">Filter</h2>
          {/* Reset Filter Button */}
          <div className="mb-6">
            <button
              className="w-full px-4 py-2 bg-[var(--color-accent)] text-white  hover:bg-[var(--color-primary)] rounded-md"
              onClick={() => handleResetFilters()}
            >
              Reset Filters
            </button>
          </div>
</div>
          {/* Departments Filter */}
          <div className="mb-6 border-b-1 border-gray-400 pb-6">
            <h3 className="font-semibold mb-2">Departments</h3>
            <ul className="h-40 overflow-y-auto">
              {departments.map((department) => {
                const count = products.filter(
                  (product) => product.department === department.department
                ).length; // Count products in this department
                const isActive = selectedCategory === department.department; // Check if this filter is active
                return (
                  <li key={department.department}>
                    <button
                      className={`flex items-center justify-between w-full px-2 py-1  ${
                        isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                      onClick={() => handleFilterChange("departments", department.department)}
                    >
                      <span className="uppercase">{department.department}</span>
                      <span className="text-sm">({count})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Categories Filter */}
          <div className="mb-6 border-b-1 border-gray-400 pb-6">
            <h3 className="font-semibold mb-2">Categories</h3>
            <ul className="h-80 overflow-y-auto">
              {departments
                .flatMap((dept) => dept.categories)
                .filter((category) => category.category && category.category !== "")
                .map((category, index) => {
                  const count = products.filter(
                    (product) => product.category === category.category
                  ).length; // Count products in this category
                  const isActive = selectedCategory === category.category; // Check if this filter is active
                  return (
                    <li key={index}>
                      <button
                        className={`flex items-center justify-between w-full px-2 py-1  ${
                          isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                        onClick={() => handleFilterChange("categories", category.category)}
                      >
                        <span className="uppercase">{category.category}</span>
                        <span className="text-sm">({count})</span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Subcategories Filter */}
          <div className="mb-6 border-b-1 border-gray-400 pb-6">
            <h3 className="font-semibold mb-2">Subcategories</h3>
            <ul className="h-80 overflow-y-auto">
              {departments
                .flatMap((dept) => dept.categories)
                .flatMap((category) => category.subcategories)
                .filter((subcategory) => subcategory && subcategory !== "")
                .map((subcategory, index) => {
                  const count = products.filter(
                    (product) => product.subcategory === subcategory
                  ).length; // Count products in this subcategory
                  const isActive = selectedCategory === subcategory; // Check if this filter is active
                  return (
                    <li key={index}>
                      <button
                        className={`flex items-center justify-between w-full px-2 py-1  ${
                          isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                        onClick={() => handleFilterChange("subcategories", subcategory)}
                      >
                        <span className="uppercase">{subcategory}</span>
                        <span className="text-sm">({count})</span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="w-3/4 mb-8">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 uppercase">
                  {selectedCategory || "All Products"}
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredProducts.length} products
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  onChange={handleItemsPerPageChange}
                >
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                </select>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  onChange={handleSortChange}
                >
                  <option value="default">Default sorting</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            {/* Previous Button */}
            <button
              className={`px-4 py-2 border rounded mx-1 ${
                currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "hover:bg-gray-100"
              }`}
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }, (_, index) => {
              const page = index + 1;
              const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

              // Show first page, last page, current page, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    className={`px-4 py-2 border rounded mx-1 ${
                      currentPage === page ? "bg-gray-300" : "hover:bg-gray-100"
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              }

              // Show ellipsis for skipped pages
              if (
                (page === currentPage - 2 && page > 1) ||
                (page === currentPage + 2 && page < totalPages)
              ) {
                return (
                  <span key={page} className="px-4 py-2 text-gray-500">
                    ...
                  </span>
                );
              }

              return null;
            })}

            {/* Next Button */}
            <button
              className={`px-4 py-2 border rounded mx-1 ${
                currentPage === Math.ceil(filteredProducts.length / itemsPerPage)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
              onClick={() =>
                currentPage < Math.ceil(filteredProducts.length / itemsPerPage) &&
                handlePageChange(currentPage + 1)
              }
              disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
            >
              &gt;
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

const SkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-gray-200 rounded-lg h-48 w-full"
        ></div>
      ))}
    </div>
  );
};

export default AllProducts;