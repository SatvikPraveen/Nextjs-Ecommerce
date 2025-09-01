// Location: components/product-grid.tsx

import { ProductCard } from './product-card';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  images: Array<{ url: string; altText?: string | null }>;
  category?: {
    name: string;
    slug: string;
  } | null;
  inventory?: Array<{
    available: number;
  }>;
  reviews?: Array<{
    rating: number;
  }>;
}

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground max-w-sm">
          We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className || ''}`}
    >
      {products.map((product) => {
        // Calculate average rating
        const avgRating = product.reviews && product.reviews.length > 0
          ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
          : 0;

        // Check stock availability
        const inStock = product.inventory && product.inventory.length > 0
          ? product.inventory[0].available > 0
          : true;

        // Get primary image
        const primaryImage = product.images && product.images.length > 0
          ? product.images[0].url
          : undefined;

        return (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            comparePrice={product.comparePrice}
            image={primaryImage}
            rating={avgRating}
            reviewCount={product.reviews?.length || 0}
            status={product.status}
            category={product.category}
            inStock={inStock}
          />
        );
      })}
    </div>
  );
}

// Loading skeleton for product grid
export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-square bg-muted animate-pulse rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Featured products section
export function FeaturedProducts({ products }: { products: Product[] }) {
  const featuredProducts = products.slice(0, 4);

  return (
    <section className="py-12">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Featured Products
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of the most popular and highly-rated products.
          </p>
        </div>
        
        <ProductGrid products={featuredProducts} />
        
        {products.length > 4 && (
          <div className="text-center mt-8">
            <a
              href="/products"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              View All Products
            </a>
          </div>
        )}
      </div>
    </section>
  );
}