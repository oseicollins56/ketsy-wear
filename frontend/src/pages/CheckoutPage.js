import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ChevronRight, Lock, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, paymentAPI } from '../utils/api';
import toast from 'react-hot-toast';

const NETWORKS = ['MTN', 'Vodafone', 'AirtelTigo'];

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: shipping, 2: payment, 3: success
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState('MTN');
  const [momoPhone, setMomoPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState('');

  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    country: 'Ghana',
    postalCode: '',
  });

  const itemsTotal = cartTotal;
  const shippingCost = itemsTotal > 200 ? 0 : 15;
  const tax = Math.round(itemsTotal * 0.125 * 100) / 100;
  const total = itemsTotal + shippingCost + tax - discountAmount;

  const handleShippingChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const validateShipping = () => {
    return shipping.fullName && shipping.phone && shipping.street && shipping.city;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const { data } = await (await import('../utils/api')).adminAPI.validateCoupon({ code: couponCode, orderAmount: total });
      setDiscountAmount(data.discountAmount);
      toast.success(`Coupon applied! Saved GHS ${data.discountAmount.toFixed(2)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          customization: item.customization,
        })),
        shippingAddress: shipping,
        paymentMethod: 'mobile-money',
        couponCode: couponCode || undefined,
        mobileMoneyDetails: { network, phone: momoPhone },
      };

      if (!momoPhone) {
        toast.error('Please enter your mobile money number');
        setLoading(false);
        return;
      }

      const { data } = await orderAPI.create(orderData);
      setOrderId(data.order._id);
      setOrderNumber(data.order.orderNumber);

      await paymentAPI.initiateMobileMoney({ orderId: data.order._id, phone: momoPhone, network });
      toast.success('✅ Check your phone to approve the Mobile Money payment!');
      clearCart();
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl p-12 shadow-lg">
          <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-3">Order Placed! 🎉</h2>
          <p className="text-gray-500 mb-2">Order Number: <strong className="text-gray-900">{orderNumber}</strong></p>
          <p className="text-gray-500 mb-2">We've sent a confirmation to {user?.email}</p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800">
            📱 A Mobile Money prompt was sent to <strong>{momoPhone}</strong> ({network}).
            Please check your phone and approve the payment.
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate(`/orders/${orderId}`)} className="flex-1 btn-primary py-3">
              Track Order
            </button>
            <button onClick={() => navigate('/shop')} className="flex-1 btn-outline py-3">
              Shop More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-3xl font-black text-gray-900">Checkout</h1>
          <Lock size={20} className="text-gray-400" />
        </div>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {['Shipping', 'Payment'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step > i + 1 ? 'text-green-600' : step === i + 1 ? 'text-red-500' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i + 1 ? 'bg-green-100' : step === i + 1 ? 'bg-red-100' : 'bg-gray-100'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className="font-semibold text-sm hidden sm:block">{s}</span>
              </div>
              {i < 1 && <ChevronRight size={16} className="text-gray-300" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
                    { name: 'phone', label: 'Phone Number', placeholder: '+233 XX XXX XXXX' },
                    { name: 'street', label: 'Street Address', placeholder: '123 Main St', full: true },
                    { name: 'city', label: 'City', placeholder: 'Accra' },
                    { name: 'state', label: 'Region/State', placeholder: 'Greater Accra' },
                    { name: 'country', label: 'Country', placeholder: 'Ghana' },
                    { name: 'postalCode', label: 'Postal Code', placeholder: '00233' },
                  ].map(({ name, label, placeholder, full }) => (
                    <div key={name} className={full ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                      <input
                        type="text"
                        name={name}
                        value={shipping[name]}
                        onChange={handleShippingChange}
                        placeholder={placeholder}
                        className="input-field"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (!validateShipping()) { toast.error('Please fill in required fields'); return; }
                    setStep(2);
                  }}
                  className="mt-6 w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
                >
                  Continue to Payment <ChevronRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Mobile Money Payment</h2>
                <p className="text-gray-500 text-sm mb-6">Pay securely using your Ghana Mobile Money account</p>

                {/* Network selector */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Network</label>
                  <div className="flex gap-3">
                    {NETWORKS.map((n) => (
                      <button
                        key={n}
                        onClick={() => setNetwork(n)}
                        className={`flex-1 py-3 border-2 rounded-xl text-sm font-bold transition-all ${network === n ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 hover:border-gray-400'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone number */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Money Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder="0XX XXX XXXX"
                      className="input-field pl-10 text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Enter the number registered to your {network} Mobile Money wallet</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6 text-sm text-yellow-800">
                  💡 After clicking "Pay", you'll receive a prompt on your phone — approve it to complete your order.
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 btn-outline py-3">Back</button>
                  <button
                    onClick={placeOrder}
                    disabled={loading}
                    className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                  >
                    {loading ? <span className="animate-spin">⏳</span> : <Lock size={16} />}
                    {loading ? 'Sending prompt...' : `Pay GHS ${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.cartId} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <img src={item.image || `https://via.placeholder.com/48`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold shrink-0">GHS {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="input-field text-sm flex-1"
                />
                <button onClick={handleApplyCoupon} className="btn-secondary px-3 py-2 text-sm whitespace-nowrap">Apply</button>
              </div>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>GHS {itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : `GHS ${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (VAT)</span><span>GHS {tax.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span><span>-GHS {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
                  <span>Total</span><span className="text-red-500">GHS {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
