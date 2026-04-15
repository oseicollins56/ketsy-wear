import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = cartTotal > 200 ? 0 : 15;
  const tax = Math.round(cartTotal * 0.125 * 100) / 100;
  const total = cartTotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingBag size={80} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 text-lg">Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-lg py-3 px-8">
            Start Shopping <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Shopping Cart ({cartCount} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.cartId} className="bg-white rounded-2xl p-5 shadow-sm flex gap-5">
                {/* Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  {item.customization?.previewImage ? (
                    <img src={item.customization.previewImage} alt="custom" className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={item.image || `https://via.placeholder.com/100x100/1a1a2e/ffffff?text=${encodeURIComponent(item.name)}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <div className="flex gap-3 text-sm text-gray-500 mt-1">
                        {item.size && <span>Size: <strong>{item.size}</strong></span>}
                        {item.color && (
                          <span className="flex items-center gap-1">
                            Color: <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: item.color }}></span>
                          </span>
                        )}
                      </div>
                      {item.customization?.hasCustomization && (
                        <span className="inline-block mt-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          ✨ Customized
                        </span>
                      )}
                      {item.customization?.textOverlay && (
                        <p className="text-xs text-gray-400 mt-1">Text: "{item.customization.textOverlay}"</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1.5 font-semibold text-sm min-w-[2rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">
                      GHS {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">GHS {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? <span className="text-green-600">Free</span> : `GHS ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (12.5% VAT)</span>
                  <span className="font-medium">GHS {tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-gray-900 font-bold text-lg">
                  <span>Total</span>
                  <span className="text-red-500">GHS {total.toFixed(2)}</span>
                </div>
              </div>

              {cartTotal < 200 && (
                <div className="bg-blue-50 rounded-lg p-3 mb-5 text-sm text-blue-700">
                  Add GHS {(200 - cartTotal).toFixed(2)} more for <strong>free shipping!</strong>
                </div>
              )}

              <button
                onClick={() => user ? navigate('/checkout') : navigate('/login?redirect=/checkout')}
                className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <Link to="/shop" className="block text-center text-sm text-gray-500 hover:text-red-500 mt-4 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
