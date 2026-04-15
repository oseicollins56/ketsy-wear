import React, { useState, useEffect } from 'react';
import { Package, Heart, User, Settings, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  processing: { color: 'bg-blue-100 text-blue-700', icon: Settings },
  shipped: { color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle },
};

const DashboardPage = () => {
  const { user, updateProfile } = useAuth();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || {},
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await orderAPI.getMyOrders();
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleProfileSave = async () => {
    try {
      await updateProfile(profileData);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white font-black text-2xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Hi, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === id ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <div key={i} className="bg-white h-24 rounded-xl animate-pulse"></div>)}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <Package size={60} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">Your orders will appear here once you shop</p>
                <a href="/shop" className="btn-primary">Start Shopping</a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const { color, icon: StatusIcon } = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  return (
                    <div key={order._id} className="bg-white rounded-xl p-5 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="font-bold text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`badge ${color} flex items-center gap-1`}>
                            <StatusIcon size={12} /> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className="font-bold text-gray-900">GHS {order.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                              <img src={item.image || `https://via.placeholder.com/40`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
                              <p className="text-xs text-gray-500">×{item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-gray-400 self-center">+{order.items.length - 3} more</span>
                        )}
                      </div>
                      {order.trackingNumber && (
                        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500 flex items-center gap-2">
                          <Truck size={14} className="text-purple-500" />
                          Tracking: <strong>{order.trackingNumber}</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="bg-white rounded-xl p-6 shadow-sm max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email (cannot change)</label>
                <input type="email" value={user?.email} disabled className="input-field bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="input-field"
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={profileData.address?.city || ''}
                  onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, city: e.target.value } })}
                  className="input-field"
                  placeholder="Accra"
                />
              </div>
              <button onClick={handleProfileSave} className="btn-primary w-full py-3">Save Changes</button>
            </div>
          </div>
        )}

        {/* Wishlist Tab */}
        {tab === 'wishlist' && (
          <div className="text-center py-16">
            <Heart size={60} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Wishlist</h3>
            <p className="text-gray-500 mb-6">Browse products and click the heart icon to save items here</p>
            <a href="/shop" className="btn-primary">Browse Products</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
