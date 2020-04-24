import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const products = await AsyncStorage.getItem('@GoMarketplace:products');

      setProducts(JSON.parse(products));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async (product: Omit<Product, 'quantity'>) => {
    const productsExists = products.find(prod => prod.id === product.id);

    if(productsExists) {
      setProducts(products.map(prod => {
        if (prod.id === product.id) {
          return {
            ...prod,
            quantity: prod.quantity + 1,
          }
        }

        return prod;
      }))
    } else {
      setProducts([...products, {...product, quantity: 1}]);
    }

    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products));
  }, [products]);

  const increment = useCallback(async id => {
    setProducts(state => state.map(product => {
      if(product.id === id) {
        return {
          ...product,
          quantity: product.quantity + 1,
        }
      }

      return product;
    }));

    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products));
  }, [products]);

  const decrement = useCallback(async id => {
    setProducts(state => state.map(product => {
      if (product.id === id) {
        return {
          ...product,
          quantity: product.quantity > 0 ? product.quantity - 1 : 0,
        }
      }

      return product;
    }));

    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products));
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
