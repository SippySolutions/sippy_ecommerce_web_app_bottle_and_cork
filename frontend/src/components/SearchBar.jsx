import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { getSearchSuggestions } from '../services/api';

const SearchBar = ({ className = '', placeholder = "Search products, brands, categories..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  // Debounce search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions(null);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    try {
      setLoading(true);
      const response = await getSearchSuggestions(query, 'all');
      if (response.success) {
        setSuggestions(response.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (query = searchTerm) => {
    if (query.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion, type) => {
    let searchQuery = '';
    
    switch (type) {
      case 'product':
        searchQuery = suggestion.name;
        break;
      case 'department':
      case 'category':
      case 'subcategory':
        searchQuery = suggestion;
        break;
      default:
        searchQuery = suggestion;
    }
    
    setSearchTerm(searchQuery);
    handleSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions(null);
    setShowSuggestions(false);
    searchRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            if (suggestions && searchTerm.length >= 2) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="border border-gray-300 rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] pr-10"
        />
        
        {/* Clear button */}
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-12 text-gray-400 hover:text-gray-600"
            type="button"
          >
            <ClearIcon fontSize="small" />
          </button>
        )}
        
        {/* Search button */}
        <button
          onClick={() => handleSearch()}
          className="bg-[var(--color-background)] text-white px-4 py-2 rounded-r-md hover:bg-[var(--color-accent)] flex items-center justify-center min-w-[48px]"
          type="button"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            <SearchIcon />
          )}
        </button>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-96 overflow-y-auto"
        >
          {/* Products */}
          {suggestions.products && suggestions.products.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Products
              </div>
              {suggestions.products.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleSuggestionClick(product, 'product')}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center space-x-3"
                >
                  <SearchIcon className="text-gray-400" fontSize="small" />
                  <div>
                    <div className="font-medium text-sm">{product.name}</div>
                    {product.sku && (
                      <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Departments */}
          {suggestions.departments && suggestions.departments.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Departments
              </div>
              {suggestions.departments.map((dept, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(dept, 'department')}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center space-x-3"
                >
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm">{dept}</span>
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {suggestions.categories && suggestions.categories.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Categories
              </div>
              {suggestions.categories.map((cat, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(cat, 'category')}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center space-x-3"
                >
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm">{cat}</span>
                </button>
              ))}
            </div>
          )}

          {/* Subcategories */}
          {suggestions.subcategories && suggestions.subcategories.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Subcategories
              </div>
              {suggestions.subcategories.map((subcat, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(subcat, 'subcategory')}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center space-x-3"
                >
                  <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <span className="text-sm">{subcat}</span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {(!suggestions.products?.length && 
            !suggestions.departments?.length && 
            !suggestions.categories?.length && 
            !suggestions.subcategories?.length) && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
