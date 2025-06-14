import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchProducts, fetchProducts, fetchDepartments } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCMS } from '../Context/CMSContext';
import { toast } from 'react-toastify';

const AllProducts = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getTheme, getStoreInfo, loading: cmsLoading } = useCMS();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('default');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [departmentsData, setDepartmentsData] = useState([]);
  const query = searchParams.get('q') || '';
  const department = searchParams.get('department') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';

  // Get theme colors
  const theme = getTheme();
  const storeInfo = getStoreInfo();

  // Load departments data on component mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await fetchDepartments();
        setDepartmentsData(data.departments || []);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };
    loadDepartments();
  }, []);

  useEffect(() => {
    // Determine if we're in search mode or showing all products
    const hasSearchParams = query || department || category || subcategory;
    setIsSearchMode(hasSearchParams);
    
    if (hasSearchParams) {
      performSearch();
    } else {
      loadAllProducts();
    }
    // Reset page when search parameters change
    setCurrentPage(1);
  }, [query, department, category, subcategory, sortOption]);

  const loadAllProducts = async (page = 1) => {
    try {
      setLoading(true);
      const productList = await fetchProducts();
      
      // Apply sorting
      let sortedProducts = [...productList];
      applySorting(sortedProducts);
      
      // Manual pagination for all products
      const limit = 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
      
      setProducts(paginatedProducts);
      setPagination({
        page,
        limit,
        total: sortedProducts.length,
        totalPages: Math.ceil(sortedProducts.length / limit)
      });
      setSuggestions(null);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (page = 1) => {
    try {
      setLoading(true);
      
      const searchFilters = {};
      if (department) searchFilters.department = department;
      if (category) searchFilters.category = category;
      if (subcategory) searchFilters.subcategory = subcategory;

      const response = await searchProducts(query, searchFilters, page, 20);
      
      if (response.success) {
        let sortedProducts = [...response.products];
        applySorting(sortedProducts);
        
        setProducts(sortedProducts);
        setPagination({
          ...response.pagination,
          page
        });
        setSuggestions(response.suggestions);
      } else {
        toast.error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const applySorting = (productList) => {
    switch (sortOption) {
      case 'price-asc':
        productList.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        productList.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        productList.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        productList.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        productList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // Keep original order
        break;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (isSearchMode) {
      performSearch(page);
    } else {
      loadAllProducts(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSortOption) => {
    setSortOption(newSortOption);
  };

  const handleFilterClick = (filterType, value) => {
    const params = new URLSearchParams(searchParams);
    params.set(filterType, value);
    navigate(`/products?${params.toString()}`);
  };

  const clearFilter = (filterType) => {
    const params = new URLSearchParams(searchParams);
    params.delete(filterType);
    navigate(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    navigate(`/products?${params.toString()}`);
  };
  const getPageTitle = () => {
    if (query) return `Search Results for "${query}"`;
    if (department) return department;
    if (category) return category;
    if (subcategory) return subcategory;
    return 'All Products';
  };

  // Helper function to get all unique categories from departments data
  const getAllCategories = () => {
    const categories = new Set();
    departmentsData.forEach(dept => {
      dept.categories?.forEach(catData => {
        if (catData.category && catData.category !== null) {
          categories.add(catData.category);
        }
      });
    });
    return Array.from(categories);
  };

  // Helper function to get all unique subcategories from departments data
  const getAllSubcategories = () => {
    const subcategories = new Set();
    departmentsData.forEach(dept => {
      dept.categories?.forEach(catData => {
        catData.subcategories?.forEach(subcat => {
          if (subcat && subcat !== null) {
            subcategories.add(subcat);
          }
        });
      });
    });
    return Array.from(subcategories);
  };
  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Loading */}
          <div className="flex flex-col justify-center items-center py-20">
            <div 
              className="animate-spin rounded-full h-16 w-16 border-b-4 mb-6"
              style={{ borderColor: theme.accent }}
            ></div>
            <p className="text-heading-text text-xl font-medium">Loading products...</p>
            <p className="text-body-text text-sm mt-2">Please wait while we fetch the latest inventory</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Hero Section */}
        <div className="mb-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent rounded-3xl"></div>
          <div className="relative max-w-5xl mx-auto py-12 px-6">
            <div className="mb-6">
              <h1 
                className="text-5xl md:text-7xl font-bold mb-4 leading-tight bg-gradient-to-r from-heading-text to-body-text bg-clip-text text-transparent"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, ${theme.headingText} 0%, ${theme.accent} 100%)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                {getPageTitle()}
              </h1>
              <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: theme.accent }}></div>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              {pagination && (
                <div className="flex items-center space-x-4">
                  {pagination.total > 0 ? (
                    <>
                      <div 
                        className="px-6 py-3 rounded-full text-lg font-bold text-white shadow-lg"
                        style={{ backgroundColor: theme.accent }}
                      >
                        {pagination.total} Products
                      </div>
                      {isSearchMode && (
                        <p className="text-body-text text-lg">
                          matching your search criteria
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="px-6 py-3 rounded-full text-lg font-medium text-body-text bg-muted/20">
                      No products found
                    </div>
                  )}
                </div>
              )}
              
              {pagination && pagination.totalPages > 1 && (
                <p className="text-body-text">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
              )}
              
              <p className="text-body-text text-lg max-w-2xl leading-relaxed">
                {isSearchMode ? 
                  `Discover premium products from ${storeInfo.name}` : 
                  `Browse our complete collection of premium beverages and spirits`
                }
              </p>
            </div>
          </div>
        </div>        {/* Active filters with CMS theme styling */}
        {(department || category || subcategory) && (
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-white/20 p-8 ">
              <div className="flex flex-wrap items-center gap-4">
                <span 
                  className="text-lg font-bold flex items-center"
                  style={{ color: theme.headingText }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-3 "
                    style={{ backgroundColor: theme.accent }}
                  ></div>
                  <div className='text-black'>Active Filters:</div>
                </span>
                {department && (
                  <span 
                    className="inline-flex items-center px-6 py-3 rounded-full text-sm font-bold text-white shadow-lg transform transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: theme.primary }}
                  >
                    Department: {department}
                    <button
                      onClick={() => clearFilter('department')}
                      className="ml-3 text-white hover:text-red-300 transition-colors text-lg"
                    >
                      ×
                    </button>
                  </span>
                )}
                {category && (
                  <span 
                    className="inline-flex items-center px-6 py-3 rounded-full text-sm font-bold text-white shadow-lg transform transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: theme.secondary }}
                  >
                    Category: {category}
                    <button
                      onClick={() => clearFilter('category')}
                      className="ml-3 text-white hover:text-red-300 transition-colors text-lg"
                    >
                      ×
                    </button>
                  </span>
                )}
                {subcategory && (
                  <span 
                    className="inline-flex items-center px-6 py-3 rounded-full text-sm font-bold text-white shadow-lg transform transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: theme.accent }}
                  >
                    Subcategory: {subcategory}
                    <button
                      onClick={() => clearFilter('subcategory')}
                      className="ml-3 text-white hover:text-red-300 transition-colors text-lg"
                    >
                      ×
                    </button>
                  </span>
                )}
                {(department || category || subcategory) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm font-bold underline transition-colors px-4 py-2"
                    style={{ color: theme.accent }}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}        {/* Sort and view controls with CMS theme */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-white/20 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center space-x-6">
                <label 
                  className="text-lg font-bold flex items-center"
                  style={{ color: theme.headingText }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: theme.accent }}
                  ></div>
                  <div className='text-black'>Sort by:</div>
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border-2 rounded-xl px-6 py-3 text-sm font-medium focus:outline-none focus:ring-4 bg-white shadow-lg transition-all duration-200"
                  style={{ 
                    borderColor: theme.muted,
                    focusRingColor: `${theme.accent}40`
                  }}
                >
                  <option value="default">Default</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
              
              {/* Results summary with theme colors */}
              {pagination && (
                <div 
                  className="text-sm font-medium px-6 py-3 rounded-xl"
                  style={{ 
                    backgroundColor: theme.muted + '40',
                    color: theme.bodyText
                  }}
                >
                  Showing {Math.min(20, pagination.total)} of {pagination.total} products
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">          {/* Enhanced Sidebar with CMS theme */}
          <div className="lg:w-1/4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-white/20 p-8 sticky top-4">
              <h3 
                className="font-bold text-2xl mb-8 flex items-center"
                style={{ color: theme.headingText }}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-4"
                  style={{ backgroundColor: theme.accent }}
                ></div>
             <div className='text-black'>Filter Products</div>   
              </h3>

              {/* Departments with theme colors */}
              <div className="mb-8">
                <h4 
                  className="font-bold text-lg mb-4 flex items-center"
                  style={{ color: theme.headingText }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: theme.primary }}
                  ></div>
                 <div className='text-black'>Departments</div> 
                </h4>
                <div className="space-y-3">
                  {suggestions?.departments && suggestions.departments.length > 0 ? (
                    suggestions.departments.slice(0, 8).map((dept, index) => (
                      <button
                        key={index}
                        onClick={() => handleFilterClick('department', dept)}
                        className={`block w-full text-left text-sm py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                          department === dept 
                            ? 'text-white shadow-lg' 
                            : 'hover:shadow-md'
                        }`}
                        style={department === dept ? {
                          backgroundColor: theme.primary,
                          color: 'white'
                        } : {
                          backgroundColor: theme.muted + '20',
                          color: theme.bodyText
                        }}
                      >
                        {dept}
                      </button>
                    ))
                  ) : (
                    departmentsData.slice(0, 8).map((deptData, index) => (
                      <button
                        key={index}
                        onClick={() => handleFilterClick('department', deptData.department)}
                        className={`block w-full text-left text-sm py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                          department === deptData.department 
                            ? 'text-white shadow-lg' 
                            : 'hover:shadow-md'
                        }`}
                        style={department === deptData.department ? {
                          backgroundColor: theme.primary,
                          color: 'white'
                        } : {
                          backgroundColor: theme.muted + '20',
                          color: theme.bodyText
                        }}
                      >
                        {deptData.department}
                      </button>
                    ))
                  )}
                </div>
              </div>              {/* Categories with theme colors */}
              {(suggestions?.categories?.length > 0 || getAllCategories().length > 0) && (
                <div className="mb-8">
                  <h4 
                    className="font-bold text-lg mb-4 flex items-center"
                    style={{ color: theme.headingText }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-3"
                      style={{ backgroundColor: theme.secondary }}
                    ></div>
                    <div className='text-black'>Categories</div>
                  </h4>
                  <div className="space-y-3">
                    {suggestions?.categories && suggestions.categories.length > 0 ? (
                      suggestions.categories.slice(0, 8).map((cat, index) => (
                        <button
                          key={index}
                          onClick={() => handleFilterClick('category', cat)}
                          className={`block w-full text-left text-sm py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                            category === cat 
                              ? 'text-white shadow-lg' 
                              : 'hover:shadow-md'
                          }`}
                          style={category === cat ? {
                            backgroundColor: theme.secondary,
                            color: 'white'
                          } : {
                            backgroundColor: theme.muted + '20',
                            color: theme.bodyText
                          }}
                        >
                          {cat}
                        </button>
                      ))
                    ) : (
                      getAllCategories().slice(0, 8).map((cat, index) => (
                        <button
                          key={index}
                          onClick={() => handleFilterClick('category', cat)}
                          className={`block w-full text-left text-sm py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                            category === cat 
                              ? 'text-white shadow-lg' 
                              : 'hover:shadow-md'
                          }`}
                          style={category === cat ? {
                            backgroundColor: theme.secondary,
                            color: 'white'
                          } : {
                            backgroundColor: theme.muted + '20',
                            color: theme.bodyText
                          }}
                        >
                          {cat}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}              {/* Subcategories with theme colors */}
              {(suggestions?.subcategories?.length > 0 || getAllSubcategories().length > 0) && (
                <div className="mb-8">
                  <h4 
                    className="font-bold text-lg mb-4 flex items-center"
                    style={{ color: theme.headingText }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-3"
                      style={{ backgroundColor: theme.accent }}
                    ></div>
                    Subcategories
                  </h4>
                  <div className="space-y-3">
                    {suggestions?.subcategories && suggestions.subcategories.length > 0 ? (
                      suggestions.subcategories.slice(0, 8).map((subcat, index) => (
                        <button
                          key={index}
                          onClick={() => handleFilterClick('subcategory', subcat)}
                          className={`block w-full text-left text-sm py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                            subcategory === subcat 
                              ? 'text-white shadow-lg' 
                              : 'hover:shadow-md'
                          }`}
                          style={subcategory === subcat ? {
                            backgroundColor: theme.accent,
                            color: 'white'
                          } : {
                            backgroundColor: theme.muted + '20',
                            color: theme.bodyText
                          }}
                        >
                          {subcat}
                        </button>
                      ))
                    ) : (
                      getAllSubcategories().slice(0, 8).map((subcat, index) => (
                        <button
                          key={index}
                          onClick={() => handleFilterClick('subcategory', subcat)}
                          className={`block w-full text-left text-sm py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                            subcategory === subcat 
                              ? 'text-white shadow-lg' 
                              : 'hover:shadow-md'
                          }`}
                          style={subcategory === subcat ? {
                            backgroundColor: theme.accent,
                            color: 'white'
                          } : {
                            backgroundColor: theme.muted + '20',
                            color: theme.bodyText
                          }}
                        >
                          {subcat}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Price Range Filter with theme colors */}
              <div className="mb-6">
                <h4 
                  className="font-bold text-lg mb-4 flex items-center"
                  style={{ color: theme.headingText }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: '#FFB000' }}
                  ></div>
                  Price Range
                </h4>
                <div className="space-y-3">
                  {[
                    { range: '0-25', label: '💰 Under $25' },
                    { range: '25-50', label: '💰 $25 - $50' },
                    { range: '50-100', label: '💰 $50 - $100' },
                    { range: '100+', label: '💰 $100+' }
                  ].map((priceRange, index) => (
                    <button
                      key={index}
                      onClick={() => handleFilterClick('priceRange', priceRange.range)}
                      className="block w-full text-left text-sm py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                      style={{
                        backgroundColor: theme.muted + '20',
                        color: theme.bodyText
                      }}
                    >
                      {priceRange.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {products.length > 0 ? (
              <>
                {/* Products grid with enhanced styling */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {products.map((product) => (
                    <div key={product._id} className="transform hover:scale-105 transition-transform duration-200">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>                {/* Enhanced Pagination with CMS theme */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-white/20 p-8">
                    <div className="flex justify-center items-center space-x-4">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="flex items-center px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                        style={{
                          backgroundColor: pagination.page <= 1 ? theme.muted + '40' : theme.secondary,
                          color: pagination.page <= 1 ? theme.bodyText : 'white'
                        }}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                      
                      {/* Page numbers with theme colors */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, pagination.page - 2) + i;
                        if (pageNumber > pagination.totalPages) return null;
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className="px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 transform hover:scale-110 shadow-lg"
                            style={{
                              backgroundColor: pageNumber === pagination.page ? theme.accent : theme.muted + '40',
                              color: pageNumber === pagination.page ? 'white' : theme.bodyText
                            }}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="flex items-center px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                        style={{
                          backgroundColor: pagination.page >= pagination.totalPages ? theme.muted + '40' : theme.secondary,
                          color: pagination.page >= pagination.totalPages ? theme.bodyText : 'white'
                        }}
                      >
                        Next
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>            ) : (
              // Enhanced No results section with CMS theme
              <div className="text-center py-24">
                <div className="max-w-lg mx-auto">
                  <div 
                    className="mb-8 opacity-40"
                    style={{ color: theme.bodyText }}
                  >
                    <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 
                    className="text-4xl font-bold mb-4"
                    style={{ color: theme.headingText }}
                  >
                    {isSearchMode ? 'No products found' : 'No products available'}
                  </h3>
                  <div className="w-16 h-1 mx-auto mb-6" style={{ backgroundColor: theme.accent }}></div>
                  <p 
                    className="text-lg mb-8 leading-relaxed"
                    style={{ color: theme.bodyText }}
                  >
                    {isSearchMode 
                      ? 'We couldn\'t find any products matching your search criteria. Try adjusting your filters or search terms.'
                      : 'We\'re currently updating our inventory. Please check back soon for new products.'
                    }
                  </p>
                  {isSearchMode && (
                    <div className="space-y-4">
                      <button
                        onClick={() => navigate('/products')}
                        className="text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl"
                        style={{ backgroundColor: theme.accent }}
                      >
                        Browse All Products
                      </button>
                      <p 
                        className="text-sm"
                        style={{ color: theme.bodyText + '80' }}
                      >
                        or try a different search term
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
