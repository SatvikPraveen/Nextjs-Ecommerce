// Location: components/cart-drawer.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  X 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { 
  getCartItems, 
  updateCartItem, 
  removeFromCart 
} from '@/server/actions/cart';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: Array<{ url: string; altText?: string | null }>;
  };
}

interface CartDrawerProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CartDrawer({ trigger, open, onOpenChange }: CartDrawerProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart items when drawer opens
  useEffect(() => {
    if (isOpen) {
      loadCartItems();
    }
  }, [isOpen]);

  // Handle controlled open state
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const loadCartItems = async () => {
    setIsLoading(true);
    try {
      const result = await getCartItems();
      if (result.success && result.items) {
        setCartItems(result.items);
      }
    } catch (error) {
      toast.error('Failed to load cart items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      const result = await updateCartItem(itemId, newQuantity);
      if (!result.success) {
        // Revert on error
        loadCartItems();
        toast.error(result.error || 'Failed to update quantity');
      }
    } catch (error) {
      loadCartItems();
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));

    try {
      const result = await removeFromCart(itemId);
      if (!result.success) {
        // Revert on error
        loadCartItems();
        toast.error(result.error || 'Failed to remove item');
      } else {
        toast.success('Item removed from cart');
      }
    } catch (error) {
      loadCartItems();
      toast.error('Failed to remove item');
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 
    0
  );
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const defaultTrigger = (
    <Button variant="outline" size="icon" className="relative">
      <ShoppingCart className="h-4 w-4" />
      {itemCount > 0 && (
        <Badge 
          className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
          variant="destructive"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
      <span className="sr-only">Open cart</span>
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-muted p-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground text-sm">
                Start shopping to add items to your cart
              </p>
            </div>
            <Button asChild>
              <Link href="/products" onClick={() => handleOpenChange(false)}>
                Continue Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.product.images[0]?.url || '/images/product-sample.svg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/products/${item.product.slug}`}
                      onClick={() => handleOpenChange(false)}
                    >
                      <h4 className="font-medium text-sm truncate hover:text-primary transition-colors">
                        {item.product.name}
                      </h4>
                    </Link>
                    <p className="text-sm font-semibold mt-1">
                      {formatCurrency(item.product.price)}
                    </p>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-6 w-6"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="text-sm font-medium min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <p className="text-sm font-semibold">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter className="flex-col space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button asChild size="lg" className="w-full">
                  <Link href="/cart" onClick={() => handleOpenChange(false)}>
                    View Cart
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/checkout" onClick={() => handleOpenChange(false)}>
                    Checkout
                  </Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}