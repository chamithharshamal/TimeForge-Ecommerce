import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from backend if user is logged in
  const loadCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCartItems(data);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const addToCart = async (watchId, quantity = 1, color = null) => {
    if (!user) return false; // Controller should handle redirection or UI should block
    try {
      const { data } = await api.post('/cart', { watch_id: watchId, quantity, color });
      // Reload cart to get merged data and watch relationships
      await loadCart();
      return true;
    } catch (err) {
      console.error("Add to cart failed", err);
      return false;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await api.put(`/cart/${cartItemId}`, { quantity });
      setCartItems(prev => prev.map(item => 
        item.id === cartItemId ? { ...item, quantity } : item
      ));
    } catch (err) {
      console.error("Update quantity failed", err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/cart/${cartItemId}`);
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    } catch (err) {
      console.error("Remove from cart failed", err);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.watch.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      loading, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      cartCount, 
      cartTotal,
      refreshCart: loadCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
