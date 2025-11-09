import React, {useState, useEffect, useCallback, useRef} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {searchProducts, fetchProducts, fetchCategories, fetchDepartments} from '../services/api';
import ProductCard from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';
import {useCMS} from '../Context/CMSContext';
import Categories from "../components/Categories";
import {toast} from 'react-toastify';
import {ProductGridSkeleton} from '../components/LazyLoadingUtils';
import {runFullDiagnostic} from '../utils/skuDiagnostic';

const AllProducts = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const {getTheme, getStoreInfo, loading: cmsLoading, getCategories} = useCMS();
    const [products, setProducts] = useState(() => {
        // Try to restore products from sessionStorage
        const savedProducts = sessionStorage.getItem('allProductsData');
        return savedProducts ? JSON.parse(savedProducts) : [];
    });
    const [initialLoading, setInitialLoading] = useState(() => {
        // Don't show loading if we have cached products
        const savedProducts = sessionStorage.getItem('allProductsData');
        return !savedProducts;
    });
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [suggestions, setSuggestions] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('default');
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [categoriesData, setCategoriesData] = useState([]);
    const [departmentsData, setDepartmentsData] = useState([]);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const hasInitiallyLoaded = useRef(false);

    // Advanced filter states
    const [priceRange, setPriceRange] = useState({min: '', max: ''});
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [stockFilter, setStockFilter] = useState('all'); // all, inStock, lowStock
    const [quickSearchQuery, setQuickSearchQuery] = useState('');
    
    // Multi-select filter states
    const [selectedFilters, setSelectedFilters] = useState({
        categories: [],
        subcategories: [],
        packTypes: [],
        sizes: [],
        salesOffers: [],
        priceRanges: []
    });
    
    // Expandable filter states
    const [expandedSections, setExpandedSections] = useState({
        categories: false,
        subcategories: false,
        packTypes: false,
        priceRanges: false,
        salesOffers: false
    });
    
    // Track which categories are expanded to show subcategories
    const [expandedCategories, setExpandedCategories] = useState({});
    
    const query = searchParams.get('q') || '';
    const department = searchParams.get('department') || '';
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';

    // Get theme colors
    const theme = getTheme();
    const storeInfo = getStoreInfo();

    // Load categories and departments data on component mount - don't block UI
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategoriesData(data || []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                // Silently fail - don't show error to user for non-critical data
            }
        };

        const loadDepartments = async () => {
            try {
                console.log('🔍 Loading departments...');
                const response = await fetchDepartments();
                console.log('📦 Departments API response:', response);
                console.log('📊 Departments data:', response?.departments);
                setDepartmentsData(response?.departments || []);
                
                if (response?.departments?.length > 0) {
                    console.log('✅ Loaded', response.departments.length, 'departments');
                } else {
                    console.log('⚠️ No departments found in response');
                }
            } catch (error) {
                console.error('❌ Failed to fetch departments:', error);
                // Silently fail - don't show error to user for non-critical data
            }
        };

        loadCategories();
        loadDepartments();
    }, []);
    
    // Load more products function (defined before useEffect that uses it)
    const loadMoreProducts = useCallback(() => {
        // Prevent loading if already loading or no more products
        if (isLoadingMore || !hasMore || initialLoading) {
            console.log('⏸️ Skipping loadMore - already loading or no more products');
            return;
        }
        
        const nextPage = currentPage + 1;
        console.log(`📄 Loading page ${nextPage}`);
        setCurrentPage(nextPage);
        
        if (isSearchMode) {
            performSearch(nextPage, true);
        } else {
            loadAllProducts(nextPage, true);
        }
    }, [currentPage, isSearchMode, isLoadingMore, hasMore, initialLoading]);
    
    // Save scroll position before navigating away
    useEffect(() => {
        const saveScrollPosition = () => {
            sessionStorage.setItem('allProductsScrollPosition', window.pageYOffset.toString());
        };
        
        // Save scroll position when user scrolls
        window.addEventListener('scroll', saveScrollPosition);
        
        return () => {
            window.removeEventListener('scroll', saveScrollPosition);
        };
    }, []);
    
    // Save products to sessionStorage whenever they change
    useEffect(() => {
        if (products.length > 0) {
            sessionStorage.setItem('allProductsData', JSON.stringify(products));
        }
    }, [products]);
    
    // Restore scroll position when returning to page
    useEffect(() => {
        const savedPosition = sessionStorage.getItem('allProductsScrollPosition');
        const savedProducts = sessionStorage.getItem('allProductsData');
        
        if (savedPosition && savedProducts && !initialLoading) {
            // Restore scroll position after products load
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedPosition, 10));
            }, 100);
        }
    }, [initialLoading]);
    
    useEffect(() => {
        // Determine if we're in search mode or showing all products
        const hasSearchParams = query || department || category || subcategory;
        setIsSearchMode(hasSearchParams);

        // Check if we have cached data and this is the first load
        const hasCachedData = sessionStorage.getItem('allProductsData') !== null;
        
        // Only load data if we don't have cached data OR if search params changed
        if (!hasCachedData || hasInitiallyLoaded.current) {
            // Only trigger new loads for actual search parameter changes
            if (hasSearchParams) {
                performSearch();
            } else {
                loadAllProducts();
            }
        } else {
            // We have cached data and haven't loaded yet, just mark as loaded
            setInitialLoading(false);
        }
        
        // Mark that we've done the initial load check
        hasInitiallyLoaded.current = true;

        // Reset page and hasMore when search parameters change
        setCurrentPage(1);
        setHasMore(true);

        // Smooth scroll to top when filters change (but not on initial mount with cached data)
        if (hasInitiallyLoaded.current) {
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    }, [query, department, category, subcategory]);

    // Infinite scroll effect
    useEffect(() => {
        const handleScroll = () => {
            // Check if user scrolled near bottom (within 300px)
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            
            if (scrollHeight - scrollTop - clientHeight < 300 && hasMore && !isLoadingMore && !initialLoading) {
                console.log('📜 Near bottom - triggering load more');
                loadMoreProducts();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, isLoadingMore, initialLoading, loadMoreProducts]);

    // Separate effect for sort and filter changes to trigger server calls
    useEffect(() => {
        // Check if we have any active filters or if products are already loaded
        const hasActiveFilters = Object.values(selectedFilters).some(filterArray => filterArray.length > 0);
        const hasOtherFilters = priceRange.min !== '' || priceRange.max !== '' || stockFilter !== 'all' || quickSearchQuery;
        
        if (products.length > 0 || hasActiveFilters || hasOtherFilters) {
            setBackgroundLoading(true);

            // Reset to page 1 when filters change
            setCurrentPage(1);
            setHasMore(true);

            // Small delay to show the updating indicator
            setTimeout(() => {
                if (isSearchMode) {
                    performSearch(1, false);
                } else {
                    loadAllProducts(1, false);
                }
            }, 100);
        }
    }, [sortOption, priceRange, stockFilter, quickSearchQuery, selectedFilters]);
    const loadAllProducts = async (page = 1, appendProducts = false) => {
        try {
            // Only show initial loading for first load
            if (page === 1 && !appendProducts) {
                setInitialLoading(true);
                setProducts([]); // Clear products on new search
            } else {
                setIsLoadingMore(true);
            }

            // Check if we have any active multi-select filters
            const hasMultiSelectFilters = Object.values(selectedFilters).some(filterArray => filterArray.length > 0);

            if (hasMultiSelectFilters) {
                // Use search endpoint with filters when multi-select filters are active
                const searchFilters = {};
                
                // Add multi-select filters
                if (selectedFilters.categories.length > 0) 
                    searchFilters.categories = selectedFilters.categories;
                if (selectedFilters.subcategories.length > 0) 
                    searchFilters.subcategories = selectedFilters.subcategories;
                if (selectedFilters.packTypes.length > 0) 
                    searchFilters.packTypes = selectedFilters.packTypes;
                if (selectedFilters.sizes.length > 0) 
                    searchFilters.sizes = selectedFilters.sizes;
                if (selectedFilters.salesOffers.length > 0) 
                    searchFilters.salesOffers = selectedFilters.salesOffers;
                if (selectedFilters.priceRanges.length > 0) 
                    searchFilters.priceRanges = selectedFilters.priceRanges;

                const response = await searchProducts('', searchFilters, page, 20);

                if (response.success) {
                    let sortedProducts = [...response.products];
                    applySorting(sortedProducts);

                    // Append or replace products based on mode
                    setProducts(prev => appendProducts ? [...prev, ...sortedProducts] : sortedProducts);
                    setPagination({
                        ...response.pagination,
                        page
                    });
                    setSuggestions(response.suggestions);
                    
                    // Check if there are more pages
                    setHasMore(page < response.pagination.totalPages);
                }
            } else {
                // Use regular fetch when no filters are active
                const productList = await fetchProducts();

                // Apply sorting
                applySorting(productList);

                // Manual pagination for all products
                const limit = 20;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedProducts = productList.slice(startIndex, endIndex);

                // Append or replace products based on mode
                setProducts(prev => appendProducts ? [...prev, ...paginatedProducts] : paginatedProducts);
                setPagination({
                    page,
                    limit,
                    total: productList.length,
                    totalPages: Math.ceil(productList.length / limit)
                });
                setSuggestions(null);
                
                // Check if there are more pages
                setHasMore(endIndex < productList.length);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Failed to load products');
        } finally {
            setInitialLoading(false);
            setBackgroundLoading(false);
            setIsLoadingMore(false);
        }
    };

    const performSearch = async (page = 1, appendProducts = false) => {
        try {
            // Only show initial loading for first search
            if (page === 1 && !appendProducts) {
                setInitialLoading(true);
                setProducts([]); // Clear products on new search
            } else {
                setIsLoadingMore(true);
            }

            const searchFilters = {};
            if (department) 
                searchFilters.department = department;
            if (category) 
                searchFilters.category = category;
            if (subcategory) 
                searchFilters.subcategory = subcategory;
            
            // Add multi-select filters
            if (selectedFilters.categories.length > 0) 
                searchFilters.categories = selectedFilters.categories;
            if (selectedFilters.subcategories.length > 0) 
                searchFilters.subcategories = selectedFilters.subcategories;
            if (selectedFilters.packTypes.length > 0) 
                searchFilters.packTypes = selectedFilters.packTypes;
            if (selectedFilters.sizes.length > 0) 
                searchFilters.sizes = selectedFilters.sizes;
            if (selectedFilters.salesOffers.length > 0) 
                searchFilters.salesOffers = selectedFilters.salesOffers;
            if (selectedFilters.priceRanges.length > 0) 
                searchFilters.priceRanges = selectedFilters.priceRanges;
            
            // DEBUG: Log search parameters
            console.log('🔍 SKU SEARCH DEBUG:');
            console.log('Query:', query);
            console.log('Search Filters:', searchFilters);
            console.log('Page:', page);
            
            const response = await searchProducts(query, searchFilters, page, 20);
            
            // DEBUG: Log response
            console.log('Response:', response);
            console.log('Success:', response.success);
            console.log('Products count:', response.products?.length);
            console.log('Products:', response.products);
            console.log('Pagination:', response.pagination);
            console.log('Suggestions:', response.suggestions);
            console.log('Full Response JSON:', JSON.stringify(response, null, 2));

            if (response.success) {
                let sortedProducts = [...response.products];
                applySorting(sortedProducts);

                // Append or replace products based on mode
                setProducts(prev => appendProducts ? [...prev, ...sortedProducts] : sortedProducts);
                setPagination({
                    ...response.pagination,
                    page
                });
                setSuggestions(response.suggestions);
                
                // Check if there are more pages
                setHasMore(page < response.pagination.totalPages);
            } else {
                console.log('❌ Search failed - response.success is false');
                toast.error('Search failed');
            }
        } catch (error) {
            console.error('❌ Search error:', error);
            toast.error('Failed to search products');
        } finally {
            setInitialLoading(false);
            setBackgroundLoading(false);
            setIsLoadingMore(false);
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

    const handlePageChange = (page) => {
        setCurrentPage(page);

        // Smooth scroll to top without waiting
        window.scrollTo({top: 0, behavior: 'smooth'});

        // Load new page data
        if (isSearchMode) {
            performSearch(page);
        } else {
            loadAllProducts(page);
        }
    };

    const handleSortChange = (newSortOption) => {
        setSortOption(newSortOption);
        // Quick feedback without blocking UI
        if (products.length > 0) {
            toast.success('Sorting updated!', {
                position: "bottom-right",
                autoClose: 1000,
                hideProgressBar: true
            });
        }
    };
    const handleFilterClick = (filterType, value) => {
        const params = new URLSearchParams(searchParams);
        params.set(filterType, value);
        navigate(`/products?${params.toString()}`);

        // Immediate scroll without waiting for data
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const clearFilter = (filterType) => {
        const params = new URLSearchParams(searchParams);
        params.delete(filterType);
        navigate(`/products?${params.toString()}`);
    };

    const clearAllFilters = () => {
        const params = new URLSearchParams();
        if (query) 
            params.set('q', query);
        navigate(`/products?${params.toString()}`);
    };

    // Toggle expanded sections for "+X more" functionality
    const toggleExpandedSection = (sectionName) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionName]: !prev[sectionName]
        }));
    };

    // Multi-select filter handlers
    const handleMultiSelectFilter = (filterType, value) => {
        setSelectedFilters(prev => {
            const currentSelection = prev[filterType] || [];
            const isSelected = currentSelection.includes(value);
            
            let newSelection;
            if (isSelected) {
                // Remove if already selected
                newSelection = currentSelection.filter(item => item !== value);
            } else {
                // Add if not selected
                newSelection = [...currentSelection, value];
            }
            
            return {
                ...prev,
                [filterType]: newSelection
            };
        });
    };

    const clearMultiSelectFilter = (filterType, value = null) => {
        setSelectedFilters(prev => {
            if (value) {
                // Remove specific value
                return {
                    ...prev,
                    [filterType]: prev[filterType].filter(item => item !== value)
                };
            } else {
                // Clear all values for this filter type
                return {
                    ...prev,
                    [filterType]: []
                };
            }
        });
    };

    const clearAllMultiSelectFilters = () => {
        setSelectedFilters({
            categories: [],
            subcategories: [],
            packTypes: [],
            sizes: [],
            salesOffers: [],
            priceRanges: []
        });
    };

    const isFilterSelected = (filterType, value) => {
        return selectedFilters[filterType]?.includes(value) || false;
    };
    const getPageTitle = () => {
        if (query) 
            return `Search Results for "${query}"`;
        if (department) 
            return department;
        if (category) 
            return category;
        if (subcategory) 
            return subcategory;
        return 'All Products';
    };

    // Helper function to get all level 1 categories (from departments)
    const getAllCategories = () => {
        const categories = new Set();
        categoriesData.forEach(dept => {
            // Level 1 categories are direct children of departments (level 0)
            dept
                    .subcategories
                    ?.forEach(catData => {
                        if (catData && catData.name !== null) {
                            categories.add(catData.name);
                        }
                    });
        });
        return Array.from(categories);
    };

    // Helper function to get subcategories for the selected category (URL-based)
    const getSubcategoriesForSelectedCategory = () => {
        if (!category) 
            return [];
        
        const subcategories = new Set();
        categoriesData.forEach(dept => {
            // Look through level 1 categories (dept.subcategories)
            dept
                    .subcategories
                    ?.forEach(catData => {
                        // If this is the selected category, get its subcategories (level 2)
                        if (catData.name && catData.name.toLowerCase() === category.toLowerCase() && catData.subcategories) {
                            catData
                                .subcategories
                                .forEach(subcat => {
                                    if (subcat && subcat.name !== null) {
                                        subcategories.add(subcat.name);
                                    }
                                });
                        }
                    });
        });
        return Array.from(subcategories);
    };

    // Toggle expanded category to show/hide subcategories
    const toggleExpandedCategory = (categoryName) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }));
    };

    // Get subcategories for a specific category
    const getSubcategoriesForCategory = (categoryName) => {
        const subcategories = new Set();
        categoriesData.forEach(dept => {
            dept.subcategories?.forEach(catData => {
                if (catData && catData.name && catData.name.toLowerCase() === categoryName.toLowerCase() && catData.subcategories) {
                    catData.subcategories.forEach(subcat => {
                        if (subcat && subcat.name !== null) {
                            subcategories.add(subcat.name);
                        }
                    });
                }
            });
        });
        return Array.from(subcategories);
    };
    
    const getDepartmentsForSidebar = () => {
        console.log('🔍 getDepartmentsForSidebar called');
        console.log('📊 departmentsData:', departmentsData);
        const departments = departmentsData.map(dept => dept.department).filter(Boolean);
        console.log('📋 Filtered departments:', departments);
        return departments;
    };

    // Helper function to get categories for sidebar based on selected department
    const getCategoriesForSidebar = () => {
        console.log('🔍 getCategoriesForSidebar called');
        console.log('📊 department:', department);
        console.log('📊 departmentsData:', departmentsData);
        
        if (!department) {
            // If no department selected, show all categories from all departments
            const allCategories = new Set();
            departmentsData.forEach(dept => {
                dept.categories?.forEach(cat => {
                    if (cat.category) {
                        allCategories.add(cat.category);
                    }
                });
            });
            const result = Array.from(allCategories);
            console.log('📋 All categories:', result);
            return result;
        }

        // If department is selected, show only categories from that department
        const selectedDept = departmentsData.find(dept => 
            dept.department === department
        );
        
        const result = selectedDept?.categories?.map(cat => cat.category).filter(Boolean) || [];
        console.log('📋 Department categories:', result);
        return result;
    };

    // Helper function to get subcategories for sidebar based on selected category
    const getSubcategoriesForSidebar = () => {
        const subcategories = new Set();
        
        // If no categories are selected in filters, show all subcategories
        if (selectedFilters.categories.length === 0) {
            categoriesData.forEach(dept => {
                dept.subcategories?.forEach(catData => {
                    if (catData && catData.subcategories) {
                        catData.subcategories.forEach(subcat => {
                            if (subcat && subcat.name !== null) {
                                subcategories.add(subcat.name);
                            }
                        });
                    }
                });
            });
        } else {
            // Show subcategories only for selected categories in filters
            categoriesData.forEach(dept => {
                dept.subcategories?.forEach(catData => {
                    if (catData && catData.name && selectedFilters.categories.includes(catData.name) && catData.subcategories) {
                        catData.subcategories.forEach(subcat => {
                            if (subcat && subcat.name !== null) {
                                subcategories.add(subcat.name);
                            }
                        });
                    }
                });
            });
        }
        
        return Array.from(subcategories);
    }; // Enhanced Loading state - Only show skeleton for true initial loads
    if (initialLoading && products.length === 0) {
        return (
            <div
                className="min-h-screen bg-gray-50"
                style={{
                    backgroundColor: theme.muted || '#F5F5F5'
                }}>
                <div className="container mx-auto px-4 py-8">
                    <Categories categories={getCategories()}/> {/* Show skeleton grid instead of spinner */}
                    <div className="mt-8">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
                        <ProductGridSkeleton count={12}/>
                    </div>
                </div>
            </div>
        );
    }

    return (
            <div
            className="min-h-screen bg-gray-50"
            style={{
                backgroundColor: theme.muted || '#F5F5F5'
            }}>
            <div className="container mx-auto px-4 py-8">
                <Categories categories={getCategories()}/> {/* Controls Bar */}
                <div className="mb-6">
                    <div
                        className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 px-4 py-3">
                        <div
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            
                            {/* Left side - Shop title */}
                            <div className="flex items-center">
                                <h1 className="text-lg sm:text-xl font-semibold text-black">
                                    {department ? `Shop ${department}` : 'Shop All Products'}
                                </h1>
                            </div>

                            {/* Right side - Filter and Sort controls */}
                            <div className="flex items-center gap-4 flex-wrap justify-between sm:justify-end">
                                {/* Filter Buttons and Applied Filters */}
                                <div className="flex items-center gap-4 flex-wrap">
                                {/* Mobile Filter Button */}
                                <button
                                    onClick={() => setIsMobileFiltersOpen(true)}
                                    className="lg:hidden inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                                    style={{
                                        backgroundColor: theme.primary,
                                        color: 'white'
                                    }}>
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"/>
                                    </svg>
                                    Filters {
                                        (department || category || subcategory) && (
                                            <span className="ml-2 bg-white/20 rounded-full px-1.5 py-0.5 text-xs">
                                                {
                                                    [department, category, subcategory]
                                                        .filter(Boolean)
                                                        .length
                                                }
                                            </span>
                                        )
                                    }
                                </button>

                                {/* Desktop Show Filters Button */}
                                <button
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="hidden lg:inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm border"
                                    style={{
                                        backgroundColor: showAdvancedFilters
                                            ? '#000000'
                                            : 'white',
                                        color: showAdvancedFilters
                                            ? 'white'
                                            : '#000000',
                                        borderColor: '#000000'
                                    }}>
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"/>
                                    </svg>
                                    {
                                        showAdvancedFilters
                                            ? 'Hide Filters'
                                            : 'Show Filters'
                                    }
                                </button>
                                </div>

                                {/* Sort Dropdown */}
                                <div className="flex items-center space-x-3">
                                    <label className="text-sm font-medium hidden sm:block text-black">
                                        Sort:
                                    </label>
                                <select
                                    value={sortOption}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 bg-white shadow-sm transition-all duration-200 min-w-[160px]"
                                    style={{
                                        borderColor: theme.muted,
                                        focusRingColor: `${theme.accent}40`
                                    }}>
                                    <option value="default">Default</option>
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
                                    <option value="price-asc">Price (Low to High)</option>
                                    <option value="price-desc">Price (High to Low)</option>
                                    <option value="newest">Newest First</option>
                                    <option value="popularity">Most Popular</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                                
                                {/* SKU Diagnostic Button (Dev Tool) */}
                                <button
                                    onClick={() => runFullDiagnostic()}
                                    className="px-3 py-2 text-sm font-medium bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-sm transition-all duration-200"
                                    title="Run SKU Search Diagnostic (Check Console)">
                                    🔍 SKU Test
                                </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filter Overlay */}
                    {
                        isMobileFiltersOpen && (
                            <div
                                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                                onClick={() => setIsMobileFiltersOpen(false)}>
                                <div
                                    className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto"
                                    onClick={(e) => e.stopPropagation()}>
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-black">Filter Products</h3>
                                            <button
                                                onClick={() => setIsMobileFiltersOpen(false)}
                                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Active Filters - Mobile */}
                                        {
                                            (department || category || subcategory) && (
                                                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                                    <div className="text-sm font-semibold text-gray-700 mb-3">Navigation Filters:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {
                                                            department && (
                                                                <span
                                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {department}
                                                                    <button
                                                                        onClick={() => clearFilter('department')}
                                                                        className="ml-2 text-blue-600">×</button>
                                                                </span>
                                                            )
                                                        }
                                                        {
                                                            category && (
                                                                <span
                                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    {category}
                                                                    <button onClick={() => clearFilter('category')} className="ml-2 text-green-600">×</button>
                                                                </span>
                                                            )
                                                        }
                                                        {
                                                            subcategory && (
                                                                <span
                                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                    {subcategory}
                                                                    <button
                                                                        onClick={() => clearFilter('subcategory')}
                                                                        className="ml-2 text-purple-600">×</button>
                                                                </span>
                                                            )
                                                        }
                                                    </div>
                                                    <button
                                                        onClick={clearAllFilters}
                                                        className="mt-3 text-sm text-red-600 font-medium underline">
                                                        Clear navigation filters
                                                    </button>
                                                </div>
                                            )
                                        }

                                        {/* Active Multi-Select Filters - Mobile */}
                                        {Object.values(selectedFilters).some(filters => filters.length > 0) && (
                                            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="text-sm font-semibold text-gray-700">Applied Filters:</div>
                                                    <button 
                                                        onClick={clearAllMultiSelectFilters}
                                                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                                                    >
                                                        Clear All
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {Object.entries(selectedFilters).map(([filterType, values]) => 
                                                        values.length > 0 && (
                                                            <div key={filterType}>
                                                                <div className="text-xs font-medium text-gray-600 mb-1 capitalize">
                                                                    {filterType.replace(/([A-Z])/g, ' $1').trim()}:
                                                                </div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {values.map(value => (
                                                                        <span 
                                                                            key={value}
                                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white border border-gray-200"
                                                                        >
                                                                            {value}
                                                                            <button
                                                                                onClick={() => clearMultiSelectFilter(filterType, value)}
                                                                                className="ml-1 text-gray-600 hover:text-red-600"
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {/* Filter Content - Mobile - Simplified */}
                                        <div className="space-y-6">
                                            {/* Categories with Subcategories */}
                                            <div>
                                                <h4 className="font-semibold text-lg mb-3 text-black">
                                                    Categories
                                                </h4>
                                                <div className="space-y-2">
                                                    {
                                                        getCategoriesForSidebar().map((cat, index) => {
                                                            const subcategories = getSubcategoriesForCategory(cat);
                                                            const isExpanded = expandedCategories[cat];
                                                            return (
                                                                <div key={index} className="space-y-1">
                                                                    <div className="flex items-center">
                                                                        <button
                                                                            onClick={() => {
                                                                                handleFilterClick('category', cat);
                                                                                setIsMobileFiltersOpen(false);
                                                                            }}
                                                                            className={`flex-1 text-left text-sm py-2 px-3 rounded-lg font-medium transition-colors ${
                                                                            category === cat
                                                                                ? 'bg-green-600 text-white'
                                                                                : 'bg-gray-100 text-black hover:bg-gray-200'}`}>
                                                                            {cat}
                                                                        </button>
                                                                        {subcategories.length > 0 && (
                                                                            <button
                                                                                onClick={() => toggleExpandedCategory(cat)}
                                                                                className="ml-2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                                                                            >
                                                                                <svg 
                                                                                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                                                    fill="none" 
                                                                                    stroke="currentColor" 
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                </svg>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    {/* Subcategories */}
                                                                    {isExpanded && subcategories.length > 0 && (
                                                                        <div className="ml-4 space-y-1">
                                                                            {subcategories.map((subcat, subIndex) => (
                                                                                <button
                                                                                    key={subIndex}
                                                                                    onClick={() => {
                                                                                        handleFilterClick('subcategory', subcat);
                                                                                        setIsMobileFiltersOpen(false);
                                                                                    }}
                                                                                    className={`block w-full text-left text-xs py-1.5 px-3 rounded-md font-medium transition-colors ${
                                                                                    subcategory === subcat
                                                                                        ? 'bg-purple-600 text-white'
                                                                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                                                                                    {subcat}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    }
                                                </div>
                                            </div>

                                            {/* Price Range */}
                                            <div>
                                                <h4 className="font-semibold text-lg mb-3 text-black">Price Range</h4>
                                                <div className="space-y-2">
                                                    {
                                                        [
                                                            '$0-$10',
                                                            '$10-$50',
                                                            '$50-$100', 
                                                            '$100+'
                                                        ].slice(0, expandedSections.priceRanges ? 4 : 3).map((priceRange, index) => (
                                                            <label key={index} className="flex items-center cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mr-3"
                                                                    checked={isFilterSelected('priceRanges', priceRange)}
                                                                    onChange={() => handleMultiSelectFilter('priceRanges', priceRange)}
                                                                />
                                                                <span className="text-sm text-gray-700">{priceRange}</span>
                                                            </label>
                                                        ))
                                                    }
                                                    {!expandedSections.priceRanges && (
                                                        <button 
                                                            onClick={() => setExpandedSections(prev => ({...prev, priceRanges: true}))}
                                                            className="text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            +1 more
                                                        </button>
                                                    )}
                                                    {expandedSections.priceRanges && (
                                                        <button 
                                                            onClick={() => setExpandedSections(prev => ({...prev, priceRanges: false}))}
                                                            className="text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            Show less
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Sales and Offers */}
                                            <div>
                                                <h4 className="font-semibold text-lg mb-3 text-black">Sales and Offers</h4>
                                                <div className="space-y-2">
                                                    {[
                                                        'Exclusives',
                                                        'Gift set', 
                                                        'Vegan',
                                                        'Seasonal',
                                                        'All on feature and tag'
                                                    ].slice(0, expandedSections.salesOffers ? 5 : 3).map((offer, index) => (
                                                        <label key={index} className="flex items-center cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mr-3"
                                                                checked={isFilterSelected('salesOffers', offer)}
                                                                onChange={() => handleMultiSelectFilter('salesOffers', offer)}
                                                            />
                                                            <span className="text-sm text-gray-700">{offer}</span>
                                                        </label>
                                                    ))}
                                                    {!expandedSections.salesOffers && (
                                                        <button 
                                                            onClick={() => setExpandedSections(prev => ({...prev, salesOffers: true}))}
                                                            className="text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            +2 more
                                                        </button>
                                                    )}
                                                    {expandedSections.salesOffers && (
                                                        <button 
                                                            onClick={() => setExpandedSections(prev => ({...prev, salesOffers: false}))}
                                                            className="text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            Show less
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Size */}
                                            <div>
                                                <h4 className="font-semibold text-lg mb-3 text-black">Size</h4>
                                                <div className="space-y-2">
                                                    {[
                                                        '8 oz',
                                                        '16 oz', 
                                                        '1.75 L'
                                                    ].map((size, index) => (
                                                        <label key={index} className="flex items-center cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mr-3"
                                                                checked={isFilterSelected('sizes', size)}
                                                                onChange={() => handleMultiSelectFilter('sizes', size)}
                                                            />
                                                            <span className="text-sm text-gray-700">{size}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Pack Type */}
                                            <div>
                                                <h4 className="font-semibold text-lg mb-3 text-black">Pack Type</h4>
                                                <div className="space-y-2">
                                                    {[
                                                        'Single',
                                                        '6 pack',
                                                        '12 pack',
                                                        '18 pack',
                                                        '24 pack',
                                                        '30 pack'
                                                    ].slice(0, expandedSections.packTypes ? 6 : 3).map((packType, index) => (
                                                        <label key={index} className="flex items-center cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mr-3"
                                                                checked={isFilterSelected('packTypes', packType)}
                                                                onChange={() => handleMultiSelectFilter('packTypes', packType)}
                                                            />
                                                            <span className="text-sm text-gray-700">{packType}</span>
                                                        </label>
                                                    ))}
                                                    {!expandedSections.packTypes && (
                                                        <button 
                                                            onClick={() => setExpandedSections(prev => ({...prev, packTypes: true}))}
                                                            className="text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            +3 more
                                                        </button>
                                                    )}
                                                    {expandedSections.packTypes && (
                                                        <button 
                                                            onClick={() => setExpandedSections(prev => ({...prev, packTypes: false}))}
                                                            className="text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            Show less
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Apply Filters Button for Mobile */}
                                        <div className="mt-8 pt-6 border-t border-gray-200">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={clearAllMultiSelectFilters}
                                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-200"
                                                >
                                                    Clear All
                                                </button>
                                                <button
                                                    onClick={() => setIsMobileFiltersOpen(false)}
                                                    className="flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors"
                                                    style={{
                                                        backgroundColor: theme.primary
                                                    }}
                                                >
                                                    Apply Filters
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* Desktop Sidebar - Show/Hide based on showAdvancedFilters */}
                    {
                        showAdvancedFilters && (<div className="hidden lg:block lg:w-1/4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
                                <h3 className="text-lg font-semibold text-black mb-4">
                                    Filters
                                </h3>
                                
                                {/* Active Filters Display */}
                                {(Object.values(selectedFilters).some(filters => filters.length > 0)) && (
                                    <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-medium text-black">Active Filters</h4>
                                            <button 
                                                onClick={clearAllMultiSelectFilters}
                                                className="text-xs text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(selectedFilters).map(([filterType, values]) => 
                                                values.length > 0 && (
                                                    <div key={filterType} className="flex flex-wrap gap-1">
                                                        {values.map(value => (
                                                            <span 
                                                                key={value}
                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                                            >
                                                                {value}
                                                                <button
                                                                    onClick={() => clearMultiSelectFilter(filterType, value)}
                                                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Sales and Offers */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-black mb-3">Featured</h4>
                                    <div className="space-y-2">
                                        {[
                                            'Exclusives',
                                            'Gift set', 
                                            'Vegan',
                                            'Seasonal',
                                            'All on feature and tag'
                                        ].map((offer, index) => (
                                            <label key={index} className="flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mr-3"
                                                    checked={isFilterSelected('salesOffers', offer)}
                                                    onChange={() => handleMultiSelectFilter('salesOffers', offer)}
                                                />
                                                <span className="text-sm text-gray-700">{offer}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Category with subcategories */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-black mb-3">Category</h4>
                                    <div className="space-y-2">
                                        {getCategoriesForSidebar().slice(0, expandedSections.categories ? getCategoriesForSidebar().length : 5).map((cat, index) => {
                                            const subcategories = getSubcategoriesForCategory(cat);
                                            const isExpanded = expandedCategories[cat];
                                            return (
                                                <div key={index} className="space-y-1">
                                                    <div className="flex items-center">
                                                        <label className="flex items-center cursor-pointer flex-1">
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mr-3"
                                                                checked={isFilterSelected('categories', cat)}
                                                                onChange={() => handleMultiSelectFilter('categories', cat)}
                                                            />
                                                            <span className="text-sm text-gray-700">{cat}</span>
                                                        </label>
                                                        {subcategories.length > 0 && (
                                                            <button
                                                                onClick={() => toggleExpandedCategory(cat)}
                                                                className="ml-2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                                                            >
                                                                <svg 
                                                                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                                    fill="none" 
                                                                    stroke="currentColor" 
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                    {/* Subcategories under this category */}
                                                    {isExpanded && subcategories.length > 0 && (
                                                        <div className="ml-6 space-y-1 border-l-2 border-gray-200 pl-3">
                                                            {subcategories.map((subcat, subIndex) => (
                                                                <label key={subIndex} className="flex items-center cursor-pointer">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        className="w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-2"
                                                                        checked={isFilterSelected('subcategories', subcat)}
                                                                        onChange={() => handleMultiSelectFilter('subcategories', subcat)}
                                                                    />
                                                                    <span className="text-xs text-gray-600">{subcat}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {getCategoriesForSidebar().length > 5 && !expandedSections.categories && (
                                            <button 
                                                onClick={() => toggleExpandedSection('categories')}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                +{getCategoriesForSidebar().length - 5} more
                                            </button>
                                        )}
                                        {expandedSections.categories && getCategoriesForSidebar().length > 5 && (
                                            <button 
                                                onClick={() => toggleExpandedSection('categories')}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                Show less
                                            </button>
                                        )}
                                    </div>
                                </div>

                               

                                {/* Size */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-black mb-3">Size</h4>
                                    <div className="space-y-2">
                                        {[
                                            '8 oz',
                                            '16 oz', 
                                            '1.75 L'
                                        ].map((size, index) => (
                                            <label key={index} className="flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mr-3"
                                                    checked={isFilterSelected('sizes', size)}
                                                    onChange={() => handleMultiSelectFilter('sizes', size)}
                                                />
                                                <span className="text-sm text-gray-700">{size}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Pack type */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-black mb-3">Pack type</h4>
                                    <div className="space-y-2">
                                        {[
                                            'Single',
                                            '6 pack',
                                            '12 pack',
                                            '18 pack',
                                            '24 pack',
                                            '30 pack'
                                        ].slice(0, expandedSections.packTypes ? 6 : 5).map((packType, index) => (
                                            <label key={index} className="flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mr-3"
                                                    checked={isFilterSelected('packTypes', packType)}
                                                    onChange={() => handleMultiSelectFilter('packTypes', packType)}
                                                />
                                                <span className="text-sm text-gray-700">{packType}</span>
                                            </label>
                                        ))}
                                        {!expandedSections.packTypes && (
                                            <button 
                                                onClick={() => toggleExpandedSection('packTypes')}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                +1 more
                                            </button>
                                        )}
                                        {expandedSections.packTypes && (
                                            <button 
                                                onClick={() => toggleExpandedSection('packTypes')}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                Show less
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Price range */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-black mb-3">Price range</h4>
                                    <div className="space-y-2">
                                        {[
                                            '$0-$10',
                                            '$10-$50',
                                            '$50-$100', 
                                            '$100+'
                                        ].map((priceRange, index) => (
                                            <label key={index} className="flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mr-3"
                                                    checked={isFilterSelected('priceRanges', priceRange)}
                                                    onChange={() => handleMultiSelectFilter('priceRanges', priceRange)}
                                                />
                                                <span className="text-sm text-gray-700">{priceRange}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>)
                    }

                    {/* Main content */}
                    <div className="flex-1 relative">

                        {products.length > 0 ? (
                            <>
                                {/* Subtle background loading indicator - only for filter/sort changes */}
                                {backgroundLoading && (
                                    <div className="absolute top-0 right-0 z-10 bg-blue-500 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                                        Updating...
                                    </div>
                                )}

                                {/* Products grid with enhanced styling and promotional banners */}
                                <div className="space-y-8">
                                    {/* First promotional banner after 4 products */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                                        {
                                        products
                                            .slice(0, 8)
                                            .map((product) => (
                                                <div
                                                    key={product._id}
                                                    className="transform hover:scale-105 transition-transform duration-200">
                                                    <ProductCard product={product}/>
                                                </div>
                                            ))
                                        }
                                    </div>
                  
                                    {/* First promotional banner */}
                                    {products.length > 8 && <PromoBanner type="single" />}
                                
                                    {/* Remaining products with promotional banners every 12 products */}
                                    {products.length > 8 && (
                                        <div
                                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                                            {
                                                products
                                                    .slice(8, 20)
                                                    .map((product) => (
                                                        <div
                                                            key={product._id}
                                                            className="transform hover:scale-105 transition-transform duration-200">
                                                            <ProductCard product={product}/>
                                                        </div>
                                                    ))
                                            }
                                        </div>
                                    )}
                                
                                    {/* Second promotional banner */}
                                    {products.length > 20 && <PromoBanner type="single"/>}
                                
                                    {/* Continue with remaining products */}
                                    {products.length > 20 && (
                                        <div
                                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                                            {
                                                products
                                                    .slice(20)
                                                    .map((product) => (
                                                        <div
                                                            key={product._id}
                                                            className="transform hover:scale-105 transition-transform duration-200">
                                                            <ProductCard product={product}/>
                                                        </div>
                                                    ))
                                            }
                                        </div>
                                    )
                                }
                                </div>

                                {/* Infinite Scroll Loading Indicator */}
                                {isLoadingMore && (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="flex flex-col items-center space-y-3">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-accent)]"></div>
                                            <p className="text-sm text-gray-500">Loading more products...</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* End of Products Indicator */}
                                {!hasMore && products.length > 0 && !initialLoading && (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="text-center">
                                            <div className="w-16 h-1 bg-[var(--color-accent)] mx-auto mb-3 rounded"></div>
                                            <p className="text-sm text-gray-500 font-medium">You've reached the end</p>
                                            <p className="text-xs text-gray-400 mt-1">No more products to load</p>
                                        </div>
                                    </div>
                                )}
                                </>
                            ): (
                            // Enhanced No results section with CMS theme
                            <div className="text-center py-24">
                                <div className="max-w-lg mx-auto">
                                    <div
                                        className="mb-8 opacity-40"
                                        style={{
                                            color: theme.bodyText
                                        }}>
                                        <svg
                                            className="mx-auto h-24 w-24"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                    </div>
                                    <h3
                                        className="text-4xl font-bold mb-4"
                                        style={{
                                            color: theme.headingText
                                        }}>
                                        {
                                            isSearchMode
                                                ? 'No products found'
                                                : 'No products available'
                                        }
                                    </h3>
                                    <div
                                        className="w-16 h-1 mx-auto mb-6"
                                        style={{
                                            backgroundColor: theme.accent
                                        }}></div>
                                    <p
                                        className="text-lg mb-8 leading-relaxed"
                                        style={{
                                            color: theme.bodyText
                                        }}>
                                        {
                                            isSearchMode
                                                ? 'We couldn\'t find any products matching your search criteria. Try adjusting yo' +
                                                        'ur filters or search terms.'
                                                : 'We\'re currently updating our inventory. Please check back soon for new produc' +
                                                        'ts.'
                                        }
                                    </p>
                                    {
                                        isSearchMode && (
                                            <div className="space-y-4">
                                                <button
                                                    onClick={() => navigate('/products')}
                                                    className="text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl"
                                                    style={{
                                                        backgroundColor: theme.accent
                                                    }}>
                                                    Browse All Products
                                                </button>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: theme.bodyText + '80'
                                                    }}>
                                                    or try a different search term
                                                </p>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        )
                    }
                    </div>
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
                        }}>
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"/>
                        </svg>
                        {
                            (() => {
                                const navigationFiltersCount = [department, category, subcategory].filter(Boolean).length;
                                const multiSelectFiltersCount = Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0);
                                const totalFilters = navigationFiltersCount + multiSelectFiltersCount;
                                
                                return totalFilters > 0 && (
                                    <span
                                        className="absolute -top-2 -right-2 rounded-full text-xs font-bold text-white px-2 py-0.5 min-w-[20px] text-center"
                                        style={{
                                            backgroundColor: theme.accent
                                        }}>
                                        {totalFilters}
                                    </span>
                                );
                            })()
                        }
                    </button>
                </div>
            </div>
    );
};

export default AllProducts;
