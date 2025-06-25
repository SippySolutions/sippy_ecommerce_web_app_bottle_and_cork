import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchProducts, fetchProducts, fetchDepartments } from '../services/api';
import ProductCard from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';
import { useCMS } from '../Context/CMSContext';
import Categories from "../components/Categories";
import { toast } from 'react-toastify';
import { 
  useInfiniteScroll, 
  ProductGridSkeleton, 
  ProductCardSkeleton 
} from '../components/LazyLoadingUtils';

const PRODUCTS_PER_PAGE = 12; // Reduced for better performance

const AllProductsOptimized = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getTheme, getStoreInfo, loading: cmsLoading, getCategories } = useCMS();
  
  // Product state
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states
  const [sortOption, setSortOption] = useState('default');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState('all');
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  // URL parameters
  const query = searchParams.get('q') || '';
  const department = searchParams.get('department') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';

  const theme = getTheme();
  const storeInfo = getStoreInfo();

  // Memoized filtered and sorted products
  const processedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Apply advanced filters
    if (priceRange.min !== '' || priceRange.max !== '') {
      filtered = filtered.filter(product => {
        const price = product.price;
        const min = priceRange.min !== '' ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max !== '' ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

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

    if (quickSearchQuery) {
      const searchTerm = quickSearchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [allProducts, priceRange, stockFilter, quickSearchQuery, sortOption]);

  // Load more products for infinite scroll
  const loadMoreProducts = useCallback(async () => {
    if (!hasMore || initialLoading) return Promise.resolve();

    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    
    const newProducts = processedProducts.slice(startIndex, endIndex);
    
    if (newProducts.length > 0) {
      setDisplayedProducts(prev => [...prev, ...newProducts]);
      setCurrentPage(nextPage);
    }
    
    if (endIndex >= processedProducts.length) {
      setHasMore(false);
    }

    return Promise.resolve();
  }, [hasMore, initialLoading, currentPage, processedProducts]);

  // Infinite scroll hook
  const { targetRef, isFetching } = useInfiniteScroll({
    fetchMore: loadMoreProducts,
    hasMore,
    threshold: 0.1,
    rootMargin: '200px'
  });

  // Load departments data
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

  // Main data loading effect
  useEffect(() => {
    const hasSearchParams = query || department || category || subcategory;
    setIsSearchMode(hasSearchParams);
    
    if (hasSearchParams) {
      performSearch();
    } else {
      loadAllProducts();
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query, department, category, subcategory]);

  // Reset displayed products when filters change
  useEffect(() => {
    const firstPageProducts = processedProducts.slice(0, PRODUCTS_PER_PAGE);
    setDisplayedProducts(firstPageProducts);
    setCurrentPage(1);
    setHasMore(processedProducts.length > PRODUCTS_PER_PAGE);
  }, [processedProducts]);

  const loadAllProducts = async () => {
    try {
      setInitialLoading(true);
      const productList = await fetchProducts();
      setAllProducts(productList);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setInitialLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setInitialLoading(true);
      
      const searchFilters = {};
      if (department) searchFilters.department = department;
      if (category) searchFilters.category = category;
      if (subcategory) searchFilters.subcategory = subcategory;

      // Load all search results at once for client-side filtering
      const response = await searchProducts(query, searchFilters, 1, 1000);
      
      if (response.success) {
        setAllProducts(response.products);
      } else {
        toast.error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search products');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFilterClick = (filterType, value) => {
    const params = new URLSearchParams(searchParams);
    params.set(filterType, value);
    navigate(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (cmsLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            {getPageTitle()}
          </h1>
          
          {/* Results count */}
          <p className="text-gray-600">
            Showing {displayedProducts.length} of {processedProducts.length} products
            {hasMore && ' (scroll for more)'}
          </p>
        </div>

        {/* Categories */}
        <Categories />

        {/* Filters and Sort */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          {/* Sort dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="newest">Newest First</option>
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* Quick search */}
          <input
            type="text"
            placeholder="Search within results..."
            value={quickSearchQuery}
            onChange={(e) => setQuickSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />

          {/* Advanced filters toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded w-full"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded w-full"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded w-full"
                >
                  <option value="all">All Products</option>
                  <option value="inStock">In Stock</option>
                  <option value="lowStock">Low Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setPriceRange({ min: '', max: '' });
                    setStockFilter('all');
                    setQuickSearchQuery('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {displayedProducts.map((product, index) => (
                <div key={`${product._id}-${index}`}>
                  <ProductCard product={product} />
                  
                  {/* Promotional banners every 8 products */}
                  {(index + 1) % 8 === 0 && index < displayedProducts.length - 1 && (
                    <div className="col-span-full my-6">
                      <PromoBanner type="single" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Infinite scroll trigger and loading indicator */}
            {hasMore && (
              <div ref={targetRef} className="mt-8 flex justify-center">
                {isFetching ? (
                  <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 w-full">
                    {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
                      <ProductCardSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 py-4">
                    Scroll for more products...
                  </div>
                )}
              </div>
            )}

            {!hasMore && displayedProducts.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  You've seen all {processedProducts.length} products
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
            {(priceRange.min || priceRange.max || stockFilter !== 'all' || quickSearchQuery) && (
              <button
                onClick={() => {
                  setPriceRange({ min: '', max: '' });
                  setStockFilter('all');
                  setQuickSearchQuery('');
                }}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProductsOptimized;
