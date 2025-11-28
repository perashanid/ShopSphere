'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, isLoading, fetchCart, updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponCode.trim());
      setCouponCode('');
    } catch (error) {
      // Error is handled in the store
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
    } catch (error) {
      // Error is handled in the store
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-earth-sage mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-earth-dark mb-4">Please sign in to view your cart</h2>
            <p className="text-earth-olive mb-8">You need to be logged in to access your shopping cart.</p>
            <Link
              href="/auth/login"
              className="btn-primary inline-flex items-center"
            >
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="w-24 h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter out any invalid items
  const validCartItems = cart?.items?.filter(item => item && item.product && item.product.id) || [];

  if (!cart || validCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-earth-dark">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="card-modern">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-earth-dark mb-4">
                  Cart Items ({validCartItems.length} {validCartItems.length === 1 ? 'item' : 'items'})
                </h2>

                <div className="space-y-4">
                  {validCartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-earth-light/30 rounded-lg hover:bg-earth-light/10 transition-colors">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                        {(() => {
                          const image = item.product?.primaryImage || item.product?.images?.[0];
                          return image && image.url ? (
                            <img
                              src={image.url}
                              alt={image.alt || item.product?.name || 'Product image'}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : null;
                        })()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-earth-dark truncate">
                          {item.product?.name || 'Product Unavailable'}
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-earth-olive">
                            {item.variant.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-earth-sage">
                          ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-earth-light/30 rounded-md bg-white/80">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="p-2 hover:bg-earth-light/20 disabled:opacity-50 disabled:cursor-not-allowed text-earth-olive transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[3rem] text-earth-dark">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="p-2 hover:bg-earth-light/20 disabled:opacity-50 disabled:cursor-not-allowed text-earth-olive transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right min-w-[4rem]">
                          <p className="text-lg font-semibold text-earth-dark">
                            ${item.totalPrice.toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isLoading}
                          className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-modern p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-earth-dark mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cart.totals.subtotal.toFixed(2)}</span>
                </div>

                {cart.totals.discount && cart.totals.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-${cart.totals.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${cart.totals.tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {cart.totals.shipping === 0 ? 'Free' : `$${cart.totals.shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${cart.totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mb-6">
                {cart.coupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Coupon Applied: {cart.coupon.code}
                      </p>
                      <p className="text-xs text-green-600">
                        You saved ${cart.coupon.discount.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="coupon"
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="btn-primary w-full flex items-center justify-center"
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>

                <Link
                  href="/products"
                  className="btn-secondary w-full text-center block"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Free Shipping Notice */}
              {cart.totals.subtotal < 50 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    Add ${(50 - cart.totals.subtotal).toFixed(2)} more for free shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}