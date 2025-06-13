import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import SimilarProducts from '../components/SimilarProducts'; // Import SimilarProducts component

function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchData() {
      const productData = await fetchProductById(id);
      setProduct(productData);
    }
    fetchData();
  }, [id]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className=" py-8 w-full bg-white">
      <div className='container mx-auto px-4'>

      {/* Breadcrumbs */}
      <div className="mb-6 text-sm">
        <span className="text-[var(--color-muted-foreground)]">Home</span>
        <span className="mx-2 text-[var(--color-muted-foreground)]">→</span>
        <span className="text-[var(--color-muted-foreground)]">Shop</span>
        <span className="mx-2 text-[var(--color-muted-foreground)]">→</span>
        <span className="text-[var(--color-muted-foreground)]">{product.category || 'Product'}</span>
        <span className="mx-2 text-[var(--color-muted-foreground)]">→</span>
        <span className="text-[var(--color-foreground)] font-semibold">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Image */}
        <div className="flex-1 flex flex-col items-center">
          <img
            src={product.productimg || '/placeholder-image.png'}
            alt={product.name}
            className="h-[420px] w-auto object-contain rounded bg-[var(--color-input-background)] "
          />
        
        </div>

        {/* Product Details Card */}
        <div className="flex-1 max-w-xl bg-[var(--color-muted)] rounded-lg shadow p-8">
          {/* SKU and Share */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-[var(--color-muted-foreground)]">
              SKU: <span className="font-mono">{product.sku}</span>
              <button
                className="ml-1 text-[var(--color-accent)] hover:underline"
                title="Copy SKU"
                onClick={() => navigator.clipboard.writeText(product.sku)}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <rect x="1" y="1" width="13" height="13" rx="2" />
                </svg>
              </button>
            </div>
            <button className="flex items-center text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)]">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
              <span className="ml-1 text-sm">Share</span>
            </button>
          </div>

          {/* Product Name */}
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] mb-2">{product.name}</h1>

          {/* Price */}
          <div className="text-3xl font-bold text-[var(--color-foreground)] mb-4">
            {product.saleprice > 0 ? (
              <>
                <span className="text-[var(--color-danger)]">${product.saleprice.toFixed(2)}</span>
                <span className="ml-2 line-through text-[var(--color-muted-foreground)] text-xl">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <>${product.price.toFixed(2)}</>
            )}
          </div>

          {/* Quantity Selector & Stock */}
          <div className="flex items-center mb-4">
            <span className="text-[var(--color-muted-foreground)] mr-4">Quantity:</span>
            <div className="flex border border-[var(--color-border)] rounded overflow-hidden">
              <button
                className="px-3 py-1 text-lg text-[var(--color-foreground)]  hover:bg-[var(--color-muted)]"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                type="button"
              >-</button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 text-center text-[var(--color-foreground)] outline-none"
                style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
              />
              <button
                className="px-3 py-1 text-lg text-[var(--color-foreground)]  hover:bg-[var(--color-muted)]"
                onClick={() => setQuantity(q => q + 1)}
                type="button"
              >+</button>
            </div>
            <span className={`ml-4 text-sm font-semibold ${product.totalqty > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
              {product.totalqty > 0 ? `In stock (${product.totalqty})` : 'Out of stock'}
            </span>
          </div>

          {/* Add to Cart & Wishlist */}
          <div className="flex items-center mb-6">
            <button
              className={`h-12 px-10 rounded font-bold text-base transition-colors mr-4 ${
                product.totalqty > 0
                  ? 'bg-[var(--color-accent)] text-[var(--color-headingText)] hover:bg-[var(--color-background)]'
                  : 'bg-[var(--color-muted)] text-[var(--color-muted)] cursor-not-allowed'
              }`}
              disabled={product.totalqty <= 0}
            >
              ADD TO CART
            </button>
            <button
              className="h-12 w-12 flex items-center justify-center rounded   text-[var(--color-linkText)] hover:text-[var(--color-accent)]"
              title="Add to Wishlist"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
              </svg>
            </button>
          </div>

          {/* Delivery & Category */}
          <div className="flex items-center mb-2">
            <span className="mr-2">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
                <circle cx="5.5" cy="18.5" r="1.5" />
                <circle cx="18.5" cy="18.5" r="1.5" />
              </svg>
            </span>
            <span className="text-[var(--color-muted-foreground)] text-sm">
              Delivers in: 1-7 Working Days&nbsp;
              <a href="#" className="underline text-[var(--color-accent)]">Shipping Policy</a>
            </span>
          </div>
          <div className="text-[var(--color-muted-foreground)] text-sm">
            Category: <span className="font-bold text-[var(--color-foreground)]">{product.category || '-'}</span>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="max-w-4xl mx-auto mt-12">
        <details className="border-b border-[var(--color-border)] py-4 group" open>
          <summary className="text-lg font-bold text-[var(--color-foreground)] cursor-pointer flex items-center justify-between">
            DESCRIPTION
            <span className="transition-transform group-open:rotate-180">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </summary>
          <div className="mt-2 text-[var(--color-muted-foreground)]">
            {product.description || 'No description available.'}
          </div>
        </details>
        <details className="border-b border-[var(--color-border)] py-4 group">
          <summary className="text-lg font-bold text-[var(--color-foreground)] cursor-pointer flex items-center justify-between">
            DELIVERY INFORMATION
            <span className="transition-transform group-open:rotate-180">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </summary>
          <div className="mt-2 text-[var(--color-muted-foreground)]">
            Standard delivery in 1-7 working days. For more info, see our <a href="#" className="underline text-[var(--color-accent)]">Shipping Policy</a>.
          </div>
        </details>
        <details className="border-b border-[var(--color-border)] py-4 group">
          <summary className="text-lg font-bold text-[var(--color-foreground)] cursor-pointer flex items-center justify-between">
            REVIEWS (0)
            <span className="transition-transform group-open:rotate-180">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </summary>
          <div className="mt-2 text-[var(--color-muted-foreground)]">
            No reviews yet.
          </div>
        </details>
      </div>
    
      {/* Similar Products Section */}
      <div className="max-w-4xl mx-auto mt-12">
        <SimilarProducts
          department={product.department}
          category={product.category || undefined} // Pass undefined if category is missing
          subcategory={product.subcategory || undefined} // Pass undefined if subcategory is missing
          priceRange={`${(product.price || 0) - 50}-${(product.price || 0) + 50}`} // Example price range
        />
      </div>
    
      </div>
      </div>
  );
}

export default SingleProduct;