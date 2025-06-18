import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchProducts, fetchProducts, fetchDepartments } from '../services/api';
import ProductCard from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';
import { useCMS } from '../Context/CMSContext';
import Categories from "../components/Categories";
import { toast } from 'react-toastify';

const AllProducts = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getTheme, getStoreInfo, loading: cmsLoading ,getCategories,} = useCMS();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);  const [sortOption, setSortOption] = useState('default');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Advanced filter states
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState('all'); // all, inStock, lowStock
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
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
  }, [query, department, category, subcategory, sortOption, priceRange, stockFilter, quickSearchQuery]);
  const loadAllProducts = async (page = 1) => {
    try {
      setLoading(true);
      const productList = await fetchProducts();
      
      // Apply advanced filters first
      let filteredProducts = applyAdvancedFilters(productList);
      
      // Apply sorting
      applySorting(filteredProducts);
      
      // Manual pagination for all products
      const limit = 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      setProducts(paginatedProducts);
      setPagination({
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit)
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
      case 'popularity':
        productList.sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
        break;
      case 'rating':
        productList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Keep original order
        break;
    }
  };

  // Advanced filtering function
  const applyAdvancedFilters = (productList) => {
    let filtered = [...productList];

    // Price range filter
    if (priceRange.min !== '' || priceRange.max !== '') {
      filtered = filtered.filter(product => {
        const price = product.price;
        const min = priceRange.min !== '' ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max !== '' ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(product => {
        const stock = product.stock || 0;
        switch (stockFilter) {
          case 'inStock':
            return stock > 0;
          case 'lowStock':
            return stock > 0 && stock <= 10;
          case 'outOfStock':
            return stock === 0;
          default:
            return true;
        }
      });
    }

    // Quick search within results
    if (quickSearchQuery) {
      const searchTerm = quickSearchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
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
  };  // Helper function to get subcategories for the selected category
  const getSubcategoriesForSelectedCategory = () => {
    if (!category) return [];
    
    const subcategories = new Set();
    departmentsData.forEach(dept => {
      dept.categories?.forEach(catData => {
        if (catData.category === category && catData.subcategories) {
          catData.subcategories.forEach(subcat => {
            if (subcat && subcat !== null) {
              subcategories.add(subcat);
            }
          });
        }
      });
    });
    return Array.from(subcategories);
  };

  // Helper function to get subcategories for sidebar based on selection
  const getSubcategoriesForSidebar = () => {
    // If category is selected, show only its subcategories
    if (category) {
      return getSubcategoriesForSelectedCategory();
    }
    
    // If department is selected but no category, show subcategories from that department
    if (department && !category) {
      const subcategories = new Set();
      const selectedDept = departmentsData.find(dept => dept.department === department);
      if (selectedDept?.categories) {
        selectedDept.categories.forEach(catData => {
          catData.subcategories?.forEach(subcat => {
            if (subcat && subcat !== null) {
              subcategories.add(subcat);
            }
          });
        });
      }
      return Array.from(subcategories);
    }
    
    // If no department or category selected, show all subcategories
    return getAllSubcategories();
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
  };  // Enhanced Loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* Minimalistic Loading Screen */}
          <div className="flex flex-col justify-center items-center py-20">
            {/* Simple spinner */}
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-gray-800"></div>
            </div>
            
            {/* Clean loading text */}
            <div className="text-center space-y-2">
              <h2 className="text-gray-800 text-lg font-medium">
                {isSearchMode ? 'Searching products...' : 'Loading products...'}
              </h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {query ? `Finding "${query}"` : 'Getting the latest products ready for you'}
              </p>
              
              {/* Simple dots */}
              <div className="flex justify-center space-x-1 mt-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto px-4 py-8">
<Categories categories={getCategories()} />        {( category || subcategory) && (
          <div className="mb-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="text-sm font-medium flex items-center text-gray-700"
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full mr-2"
                    style={{ backgroundColor: theme.accent }}
                  ></div>
                  Filters:
                </span>
                {department && (
                  <span 
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white shadow-sm transition-all duration-200"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {department}
                    <button
                      onClick={() => clearFilter('department')}
                      className="ml-2 text-white hover:text-red-300 transition-colors text-sm"
                    >
                      ×
                    </button>
                  </span>
                )}
                {category && (
                  <span 
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white shadow-sm transition-all duration-200"
                    style={{ backgroundColor: theme.secondary }}
                  >
                    {category}
                    <button
                      onClick={() => clearFilter('category')}
                      className="ml-2 text-white hover:text-red-300 transition-colors text-sm"
                    >
                      ×
                    </button>
                  </span>
                )}
                {subcategory && (
                  <span 
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white shadow-sm transition-all duration-200"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {subcategory}
                    <button
                      onClick={() => clearFilter('subcategory')}
                      className="ml-2 text-white hover:text-red-300 transition-colors text-sm"
                    >
                      ×
                    </button>
                  </span>
                )}
                {(department || category || subcategory) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-medium underline transition-colors px-2 py-1 text-gray-600 hover:text-red-600"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        )}{/* Sort and view controls - Minimal bar */}
        <div className="mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center justify-between w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                  style={{ 
                    backgroundColor: theme.primary,
                    color: 'white'
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  Filters
                  {(department || category || subcategory) && (
                    <span className="ml-2 bg-white/20 rounded-full px-1.5 py-0.5 text-xs">
                      {[department, category, subcategory].filter(Boolean).length}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown - Compact */}
                <div className="flex items-center space-x-3">
                  <label 
                    className="text-sm font-medium hidden sm:block text-gray-700"
                  >
                    Sort:
                  </label>                  <select
                    value={sortOption}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 bg-white shadow-sm transition-all duration-200 min-w-[160px]"
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
                    <option value="popularity">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border"
                  style={{ 
                    backgroundColor: showAdvancedFilters ? theme.accent : 'white',
                    color: showAdvancedFilters ? 'white' : theme.accent,
                    borderColor: theme.accent
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Advanced Filters
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Quick Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quick Search
                    </label>
                    <input
                      type="text"
                      value={quickSearchQuery}
                      onChange={(e) => setQuickSearchQuery(e.target.value)}
                      placeholder="Search in results..."
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: theme.muted,
                        focusRingColor: `${theme.accent}40`
                      }}
                    />
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                        placeholder="Min"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                        style={{ 
                          borderColor: theme.muted,
                          focusRingColor: `${theme.accent}40`
                        }}
                      />
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                        placeholder="Max"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                        style={{ 
                          borderColor: theme.muted,
                          focusRingColor: `${theme.accent}40`
                        }}
                      />
                    </div>
                  </div>

                  {/* Stock Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Status
                    </label>
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ 
                        borderColor: theme.muted,
                        focusRingColor: `${theme.accent}40`
                      }}
                    >
                      <option value="all">All Products</option>
                      <option value="inStock">In Stock</option>
                      <option value="lowStock">Low Stock</option>
                      <option value="outOfStock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {products.length} products found
                  </div>
                  <div className="flex space-x-2">                    <button
                      onClick={() => {
                        setPriceRange({ min: '', max: '' });
                        setStockFilter('all');
                        setQuickSearchQuery('');
                      }}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">{/* Mobile Filter Overlay */}
          {isMobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setIsMobileFiltersOpen(false)}>
              <div 
                className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-black">Filter Products</h3>
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Active Filters - Mobile */}
                  {(department || category || subcategory) && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm font-semibold text-gray-700 mb-3">Active Filters:</div>
                      <div className="flex flex-wrap gap-2">
                        {department && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {department}
                            <button onClick={() => clearFilter('department')} className="ml-2 text-blue-600">×</button>
                          </span>
                        )}
                        {category && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {category}
                            <button onClick={() => clearFilter('category')} className="ml-2 text-green-600">×</button>
                          </span>
                        )}
                        {subcategory && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {subcategory}
                            <button onClick={() => clearFilter('subcategory')} className="ml-2 text-purple-600">×</button>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={clearAllFilters}
                        className="mt-3 text-sm text-red-600 font-medium underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}                  {/* Filter Content - Mobile - Only Subcategories */}
                  <div className="space-y-6">
                    {/* Subcategories only - responsive to current selection */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-black">
                        {category ? `Subcategories in ${category}` : 
                         department ? `Subcategories in ${department}` : 
                         'All Subcategories'}
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">                        {suggestions?.subcategories && suggestions.subcategories.length > 0 ? (
                          suggestions.subcategories.map((subcat, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                handleFilterClick('subcategory', subcat);
                                setIsMobileFiltersOpen(false);
                              }}
                              className={`block w-full text-left text-sm py-2 px-3 rounded-lg font-medium transition-colors ${
                                subcategory === subcat 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-gray-100 text-black hover:bg-gray-200'
                              }`}
                            >
                              {subcat}
                            </button>
                          ))                        ) : (
                          getSubcategoriesForSidebar().map((subcat, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                handleFilterClick('subcategory', subcat);
                                setIsMobileFiltersOpen(false);
                              }}
                              className={`block w-full text-left text-sm py-2 px-3 rounded-lg font-medium transition-colors ${
                                subcategory === subcat 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-gray-100 text-black hover:bg-gray-200'
                              }`}
                            >
                              {subcat}
                            </button>
                          ))
                        )}                        {getSubcategoriesForSidebar().length === 0 && (
                          <div className="text-center text-gray-500 py-4">
                            No subcategories available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-black">Price Range</h4>
                      <div className="space-y-2">
                        {[
                          { range: '0-25', label: 'Under $25' },
                          { range: '25-50', label: '$25 - $50' },
                          { range: '50-100', label: '$50 - $100' },
                          { range: '100+', label: '$100+' }
                        ].map((priceRange, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              handleFilterClick('priceRange', priceRange.range);
                              setIsMobileFiltersOpen(false);
                            }}
                            className="block w-full text-left text-sm py-2 px-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            💰 {priceRange.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-white/20 p-8 sticky top-4">
              <h3 
                className="font-bold text-2xl mb-8 flex items-center"
                style={{ color: theme.headingText }}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-4"
                  style={{ backgroundColor: theme.accent }}
                ></div>
             <div className='text-black'>Filter by Subcategory</div>   
              </h3>              {/* Subcategories only - responsive to current selection */}
              <div className="mb-8">
                <h4 
                  className="font-bold text-lg mb-4 flex items-center"
                  style={{ color: theme.headingText }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: theme.accent }}
                  ></div>
                  <div className='text-black'>
                    {category ? `Subcategories in ${category}` : 
                     department ? `Subcategories in ${department}` : 
                     'All Subcategories'}
                  </div>
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">                  {suggestions?.subcategories && suggestions.subcategories.length > 0 ? (
                    suggestions.subcategories.map((subcat, index) => (
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
                          color: 'black'
                        }}
                      >
                        {subcat}
                      </button>
                    ))                  ) : (
                    getSubcategoriesForSidebar().map((subcat, index) => (
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
                          color: 'black'
                        }}
                      >
                        {subcat}
                      </button>
                    ))
                  )}
                  {getSubcategoriesForSidebar().length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No subcategories available
                    </div>
                  )}                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 
                  className="font-bold text-lg mb-4 flex items-center"
                  style={{ color: theme.headingText }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: '#FFB000' }}
                  ></div>
                  <div className='text-black'>Price Range</div>
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
          <div className="flex-1">            {products.length > 0 ? (
              <>                {/* Products grid with enhanced styling and promotional banners */}
                <div className="space-y-8">
                  {/* First promotional banner after 4 products */}
                  <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                    {products.slice(0, 8).map((product) => (
                      <div key={product._id} className="transform hover:scale-105 transition-transform duration-200">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                  
                  {/* First promotional banner */}
                  {products.length > 8 && <PromoBanner type="single" />}
                  
                  {/* Remaining products with promotional banners every 12 products */}
                  {products.length > 8 && (
                    <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                      {products.slice(8, 20).map((product) => (
                        <div key={product._id} className="transform hover:scale-105 transition-transform duration-200">
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Second promotional banner */}
                  {products.length > 20 && <PromoBanner type="single" />}
                  
                  {/* Continue with remaining products */}
                  {products.length > 20 && (
                    <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                      {products.slice(20).map((product) => (
                        <div key={product._id} className="transform hover:scale-105 transition-transform duration-200">
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  )}</div>
                  {/* Modern Responsive Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8 sm:mt-12">
                    <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-1 sm:p-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: pagination.page <= 1 ? 'transparent' : theme.primary + '10',
                          color: pagination.page <= 1 ? theme.bodyText + '60' : theme.primary
                        }}
                        title="Previous page"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {/* Mobile: Show only current page info */}
                      <div className="sm:hidden flex items-center px-3 py-2 text-sm font-medium text-gray-600">
                        <span style={{ color: theme.primary }}>{pagination.page}</span>
                        <span className="mx-1">/</span>
                        <span>{pagination.totalPages}</span>
                      </div>
                      
                      {/* Desktop: Show page numbers */}
                      <div className="hidden sm:flex items-center gap-1">
                        {/* First page (if not in range) */}
                        {pagination.page > 3 && (
                          <>
                            <button
                              onClick={() => handlePageChange(1)}
                              className="flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                              style={{
                                backgroundColor: theme.primary + '10',
                                color: theme.primary
                              }}
                            >
                              1
                            </button>
                            {pagination.page > 4 && (
                              <span className="flex items-center justify-center w-10 h-10 text-gray-400">...</span>
                            )}
                          </>
                        )}
                        
                        {/* Page numbers around current page */}
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const pageNumber = Math.max(1, pagination.page - 2) + i;
                          if (pageNumber > pagination.totalPages) return null;
                          
                          const isActive = pageNumber === pagination.page;
                          
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className="flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                              style={{
                                backgroundColor: isActive ? theme.accent : 'transparent',
                                color: isActive ? 'white' : theme.bodyText
                              }}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                        
                        {/* Last page (if not in range) */}
                        {pagination.page < pagination.totalPages - 2 && (
                          <>
                            {pagination.page < pagination.totalPages - 3 && (
                              <span className="flex items-center justify-center w-10 h-10 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(pagination.totalPages)}
                              className="flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                              style={{
                                backgroundColor: theme.primary + '10',
                                color: theme.primary
                              }}
                            >
                              {pagination.totalPages}
                            </button>
                          </>
                        )}
                      </div>
                      
                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: pagination.page >= pagination.totalPages ? 'transparent' : theme.primary + '10',
                          color: pagination.page >= pagination.totalPages ? theme.bodyText + '60' : theme.primary
                        }}
                        title="Next page"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        {/* Floating Filter Button for Mobile */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="bg-white shadow-2xl rounded-full p-4 border-2 transition-all duration-200 hover:scale-110"
            style={{ 
              borderColor: theme.primary,
              color: theme.primary 
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            {(department || category || subcategory) && (
              <span 
                className="absolute -top-2 -right-2 rounded-full text-xs font-bold text-white px-2 py-0.5 min-w-[20px] text-center"
                style={{ backgroundColor: theme.accent }}
              >
                {[department, category, subcategory].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
