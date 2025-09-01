// Location: components/product-card.tsx

import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { AddToCart } from './add-to-cart';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  image?: string;
  rating?: number;
  reviewCount?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category?: {
    name: string;
    slug: string;
  };
  inStock?: boolean;
  badge?: string;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  image,
  rating = 0,
  reviewCount = 0,
  status,
  category,
  inStock = true,
  badge,
}: ProductCardProps) {
  const discountPercentage = comparePrice 
    ? Math.round(((comparePrice - price) / comparePrice) * 100) 
    : 0;

  const isOnSale = comparePrice && comparePrice > price;

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${slug}`} className="block">
          <Image
            src={image || '/images/product-sample.svg'}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-2">
          {isOnSale && (
            <Badge variant="destructive" className="text-xs">
              -{discountPercentage}%
            </Badge>
          )}
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
          {!inStock && (
            <Badge variant="outline" className="text-xs bg-background/80">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Quick Add Button - Shows on hover */}
        <div className="absolute inset-x-2 bottom-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <AddToCart
            productId={id}
            disabled={!inStock}
            variant="secondary"
            size="sm"
            className="w-full bg-background/90 hover:bg-background"
          />
        </div>
      </div>

      <CardContent className="p-4">
        {/* Category */}
        {category && (
          <Link 
            href={`/category/${category.slug}`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {category.name}
          </Link>
        )}

        {/* Product Name */}
        <Link href={`/products/${slug}`}>
          <h3 className="font-medium text-sm mt-1 mb-2 line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">
            {formatCurrency(price)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(comparePrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {inStock ? (
          <p className="text-xs text-green-600 mt-1">In Stock</p>
        ) : (
          <p className="text-xs text-red-600 mt-1">Out of Stock</p>
        )}
      </CardContent>
    </Card>
  );
}