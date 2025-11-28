import { useCartStore } from '@/store/cartStore';

export function useCart() {
  const { 
    cart, 
    isLoading, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    fetchCart 
  } = useCartStore();

  // Calculate item count from cart
  const itemCount = cart?.itemCount || 0;

  return {
    cart,
    isLoading,
    itemCount,
    addItem: addToCart,
    updateItem: updateCartItem,
    removeItem: removeFromCart,
    clearCart,
    fetchCart,
  };
}