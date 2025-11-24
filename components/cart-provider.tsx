'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    stock: number;
    images: Array<{ url: string }>;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItem: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  totalAmount: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load cart from localStorage
    const saved = localStorage.getItem('cart');
    if (saved) {
      setItems(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateItem: updateQuantity,
        clearCart,
        total,
        totalAmount: total,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
