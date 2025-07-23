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
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) 
            return;
        navigate(`/products/${product._id}`);
    };

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        // WishlistIcon handles its own click logic
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
    };

    const hasDiscount = product.saleprice > 0 && product.price > product.saleprice;
    const discountPercentage = getDiscountPercentage();

    return (
        <div 
            className="w-full h-auto p-2 sm:p-4 bg-[#FAFAFA] rounded-xl sm:rounded-2xl shadow-[0px_5px_20px_0px_rgba(0,0,0,0.05)] outline-1 outline-offset-[-1px] outline-slate-600/25 flex flex-col justify-start items-start gap-2 sm:gap-3 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleCardClick}
        >
            {/* Image Section */}
            <div className="self-stretch h-32 sm:h-48 relative rounded-lg outline-1 outline-offset-[-1px] outline-slate-600/25 overflow-hidden">
                <LazyImage 
                    src={product.productimg || "https://placehold.co/200x250"} 
                    alt={product.name}
                    className="w-full h-full object-contain"
                />
                {hasDiscount && (
                    <div className="w-10 h-5 sm:w-14 sm:h-6 px-1 py-0.5 right-0 top-0 absolute bg-green-700 rounded-tr-lg rounded-bl-lg flex justify-center items-center">
                        <div className="text-white text-[10px] sm:text-xs font-bold font-['Play']">
                            {discountPercentage}% off
                        </div>
                    </div>
                )}
            </div>
            
            {/* Product Name */}
            <div className="self-stretch text-left text-neutral-800 text-xs sm:text-sm font-semibold line-clamp-2">
                {product.name}
            </div>
            
            {/* Price Section */}
            <div className="self-stretch flex justify-between items-center">
                <div className="flex items-center gap-1 sm:gap-2">
                    {hasDiscount ? (
                        <>
                            <span className="text-zinc-800 text-xs sm:text-sm font-bold">
                                {formatPrice(product.saleprice)}
                            </span>
                            <span className="text-red-700 text-[10px] sm:text-xs font-normal line-through">
                                {formatPrice(product.price)}
                            </span>
                        </>
                    ) : (
                        <span className="text-zinc-800 text-xs sm:text-sm font-bold">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>
                
                {/* Size and Pack Name */}
                <div className="text-black text-[9px] sm:text-xs font-normal">
                    {product.size} | {product.packname}
                </div>
            </div>
            
            {/* Featured/Special Tags */}
            <div className="flex justify-start items-start gap-1 sm:gap-2 flex-wrap min-h-[16px] sm:min-h-[20px]">
                {product.featured && (
                    <div className="text-[10px] sm:text-xs font-semibold" style={{ color: '#A36F00' }}>
                        {product.featured}
                    </div>
                )}
            </div>
            
            {/* Action Buttons */}
            <div className="self-stretch flex justify-start items-start gap-1 sm:gap-2">
                <button 
                    className="flex-1 h-6 sm:h-7 px-1 sm:px-2 py-1 bg-[var(--color-accent)] rounded flex justify-center items-center gap-1 sm:gap-2 hover:bg-red-800 transition-colors"
                    onClick={handleAddToCart}
                    disabled={product.totalqty === 0}
                >
                    <ShoppingCartIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    <div className="text-white text-[10px] sm:text-xs font-bold ">
                        {product.totalqty === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                    </div>
                </button>
                
                <div 
                    className="flex justify-center items-center"
                    onClick={handleWishlistClick}
                >
                    <WishlistIcon product={product} size="sm" />
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
