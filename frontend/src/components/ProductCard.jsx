import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCart} from '../Context/CartContext';
import {useCMS} from '../Context/CMSContext';
import {toast} from 'react-toastify';
import WishlistIcon from './WishlistIcon';
import { LazyImage } from './LazyLoadingUtils';

// Minimal icon components
const StarIcon = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>
);

const DiamondIcon = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path
            d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h2a1 1 0 01.894 1.447l-8 16a1 1 0 01-1.788 0l-8-16A1 1 0 013 6h2V4zm2 2V4h6v2H7z"/>
    </svg>
);

const UserGroupIcon = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path
            d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
    </svg>
);

const ShoppingCartIcon = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path
            d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
    </svg>
);

const XIcon = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"/>
    </svg>
);

const CheckIcon = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"/>
    </svg>
);

const ExclamationIcon = ({className}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"/>
    </svg>
);

function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { getTheme } = useCMS();

    const theme = getTheme();

    // Safety check for product
    if (!product || !product._id) {
        return null;
    }

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart({
            ...product,
            salePrice: typeof product.saleprice === 'number' && product.saleprice > 0
                ? product.saleprice
                : product.price
        }, 1);
        toast.success(`${product.name || 'Product'} added to cart!`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined
        });
    };

    const handleCardClick = (e) => {
        if (e.target.tagName === 'BUTTON') 
            return;
        navigate(`/products/${product._id}`);
    };

    // Helper functions
    const getDiscountPercentage = () => {
        if (product.saleprice > 0 && product.price > product.saleprice) {
            return Math.round(((product.price - product.saleprice) / product.price) * 100);
        }
        return 0;
    };

    const getStockLevel = () => {
        if (product.totalqty === 0) 
            return 'out-of-stock';
        if (product.totalqty <= 5) 
            return 'low-stock';
        return 'in-stock';
    };

    const formatPrice = (price) => {
        return new Intl
            .NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            })
            .format(price);
    };    return (
        <div
            className="group relative bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden w-full h-[280px] sm:h-[400px] flex flex-col"
            onClick={handleCardClick}>            {/* Top Right Badges - Compact */}
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-10">
                <div className="flex flex-col gap-0.5 sm:gap-1">

                    {
                        product.bestseller && (
                            <span
                                className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                                <StarIcon className="w-2 h-2 sm:w-3 sm:h-3"/>
                                <span className="hidden sm:inline">Best Seller</span>
                                <span className="sm:hidden">Best</span>
                            </span>
                        )
                    }
                    {
                        product.exclusive && (
                            <span
                                className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                <DiamondIcon className="w-2 h-2 sm:w-3 sm:h-3"/>
                                <span className="hidden sm:inline">Exclusive</span>
                                <span className="sm:hidden">Exc</span>
                            </span>
                        )
                    }
                    {
                        product.staffpick && (
                            <span
                                className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
                                <UserGroupIcon className="w-2 h-2 sm:w-3 sm:h-3"/>
                                <span className="hidden sm:inline">Staff Pick</span>
                                <span className="sm:hidden">Staff</span>
                            </span>
                        )
                    }

                </div>
            </div>            {/* Left Floating Icons for Extra Info - Compact */}
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-10">
                <div className="flex flex-col gap-0.5 sm:gap-1">
                    {/* Vintage Icon */}
                    {
                        product.vintage && product.vintage !== "No Vintage" && (
                            <div
                                className="w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-sm border border-white/20 hover:scale-110 transition-all duration-200"
                                style={{
                                    backgroundColor: `${theme.primary}CC`
                                }}
                                title={`Vintage: ${product.vintage}`}>
                                <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 7h12v9H4V7z"/>
                                    <path d="M10 8a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1z"/>
                                </svg>
                            </div>
                        )
                    }

                    {/* ABV Icon */}
                    {
                        product.abv && (
                            <div
                                className="w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-sm border border-white/20 hover:scale-110 transition-all duration-200"
                                style={{
                                    backgroundColor: `${theme.accent}CC`
                                }}
                                title={`ABV: ${product.abv}%`}>
                                <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                                </svg>
                            </div>
                        )
                    }

                    {/* Country/Origin Icon */}
                    {
                        product.country && product.country !== "NAN" && (
                            <div
                                className="w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-sm border border-white/20 hover:scale-110 transition-all duration-200"
                                style={{
                                    backgroundColor: `${theme.secondary}CC`
                                }}
                                title={`Origin: ${product.country}`}>
                                <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                                        clipRule="evenodd"/>
                                </svg>
                            </div>
                        )
                    }
                </div>
            </div>            {/* Product Image - Optimized with Lazy Loading */}
            <div
                className="relative h-32 sm:h-52 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-2 sm:p-3">
                <LazyImage
                    src={product.productimg || '/placeholder-image.png'}
                    alt={product.name}
                    className="h-full w-auto object-contain transition-all duration-300 group-hover:scale-105"
                    placeholder={
                        <div className="animate-pulse bg-gray-300 rounded w-8 h-12 sm:w-12 sm:h-16"></div>
                    }
                />

                {/* Size Floating Badge - Bottom Right - Compact */}
                {
                    product.size && (
                        <div
                            className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 px-1 py-0.5 sm:px-2 sm:py-1 rounded-full text-white text-xs font-semibold shadow-lg backdrop-blur-sm border border-white/20"
                            style={{
                                backgroundColor: `${theme.accent}CC`
                            }}
                            title={`Size: ${product.size}`}>
                            <span className="hidden sm:inline">{product.size} {product.packname!="Single"?product.packname: ''}</span>
                            <span className="sm:hidden">{product.size}</span>
                        </div>
                    )
                }
            </div>            {/* Product Information - Compact */}
            <div className="p-2 sm:p-3 flex-1 flex flex-col min-h-0">
                {/* Product Name and Category Row - Compact */}
                <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1 sm:mb-2 flex-shrink-0">                    <h3
                        className="font-semibold text-xs sm:text-base text-gray-900 line-clamp-2 group-hover:text-primary transition-colors flex-1">
                        {product.name || 'Unnamed Product'}
                    </h3>
                    <div className="flex flex-col gap-0.5 sm:gap-1 flex-shrink-0">
                        {
                            product.category && (
                                <span
                                    className="text-xs text-gray-600 bg-gray-100 px-1 py-0.5 sm:px-2 sm:py-1 rounded-md whitespace-nowrap hidden sm:inline-block">
                                    {product.category}
                                </span>
                            )
                        }
                        {
                            product.subcategory && (
                                <span
                                    className="text-xs text-gray-600 bg-gray-50 px-1 py-0.5 sm:px-2 sm:py-1 rounded-md border whitespace-nowrap hidden sm:inline-block">
                                    {product.subcategory}
                                </span>
                            )
                        }
                        {
                            !product.category && !product.subcategory && product.department && (
                                <span
                                    className="text-xs text-gray-600 bg-gray-100 px-1 py-0.5 sm:px-2 sm:py-1 rounded-md whitespace-nowrap hidden sm:inline-block">
                                    {product.department}
                                </span>
                            )
                        }
                    </div>
                </div>

                {/* Price Section - Compact */}
                <div className="mb-1 sm:mb-2 flex-shrink-0">
                    {
                        product.saleprice > 0
                            ? (
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="text-sm sm:text-xl font-bold text-accent">
                                        {formatPrice(product.saleprice)}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500 line-through">
                                        {formatPrice(product.price)}
                                    </div>
                                </div>
                            )
                            : (
                                <div className="text-sm sm:text-xl font-bold text-gray-900">
                                    {formatPrice(product.price)}
                                </div>
                            )
                    }
                </div>

                {/* Flexible space */}
                <div className="flex-1 min-h-0"></div>
                {/* Bottom Section - Action Buttons - Compact */}
                <div className="space-y-1 sm:space-y-2 flex-shrink-0">
                    <div className='flex items-center justify-between mt-1 sm:mt-2 gap-1 sm:gap-2'>
                        {/* Add to Cart Button - Compact */}
                        <button
                            onClick={handleAddToCart}
                            disabled={product.totalqty <= 0}
                            className={`w-full py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg ${
                            'text-white hover:opacity-90 transform hover:scale-105'}`}
                            style={{
                                backgroundColor: theme.accent
                            }}>

                            <> <ShoppingCartIcon className="w-3 h-3 sm:w-4 sm:h-4"/>
                            <span className="hidden sm:inline">Add to Cart</span>
                            <span className="sm:hidden">Add</span>
                        </>

                    </button>

                    {/* Wishlist Icon */}
                    <div className="self-end">
                        <WishlistIcon product={product} size="sm"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}

export default ProductCard;
