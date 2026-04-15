import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, Users, ShoppingBag, DollarSign, AlertTriangle, Settings, Tag, LogOut, Menu, X, Home, Plus, Upload } from 'lucide-react';
import { adminAPI, orderAPI, productAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ===== SUB-COMPONENTS =====

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
    <p className="text-gray-500 text-sm">{title}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ===== OVERVIEW PAGE =====
const Overview = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          adminAPI.getDashboard(),
          orderAPI.getAnalytics({ period: 'monthly' }),
        ]);
        setStats(dashRes.data);
        setSalesData(analyticsRes.data.salesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner"></div></div>;

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue" value={`GHS ${(stats?.stats.totalRevenue || 0).toFixed(0)}`} icon={DollarSign} color="bg-green-500" />
        <StatCard title="Total Orders" value={stats?.stats.totalOrders || 0} icon={ShoppingBag} color="bg-blue-500" sub={`${stats?.stats.pendingOrders || 0} pending`} />
        <StatCard title="Total Products" value={stats?.stats.totalProducts || 0} icon={Package} color="bg-purple-500" />
        <StatCard title="Customers" value={stats?.stats.totalUsers || 0} icon={Users} color="bg-red-500" />
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h3 className="font-bold text-gray-900 mb-4">Monthly Revenue (GHS)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`GHS ${v.toFixed(2)}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#e94560" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-red-500 text-sm hover:text-red-600">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.recentOrders || []).map((order) => (
              <div key={order._id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">GHS {order.totalPrice?.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" /> Low Stock Alert
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.lowStockProducts || []).length === 0 ? (
              <p className="p-4 text-gray-500 text-sm text-center">All products are well-stocked ✅</p>
            ) : stats.lowStockProducts.map((p) => (
              <div key={p._id} className="p-4 flex justify-between items-center">
                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                <span className="text-sm font-bold text-orange-500">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== PRODUCTS PAGE =====
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', category: 't-shirts', price: '', stock: '',
    discountPrice: '', featured: false, isCustomizable: true,
    'customizationOptions.availableSizes': 'XS,S,M,L,XL,XXL',
  });

  const fetchProducts = async () => {
    const { data } = await productAPI.getAll({ limit: 50, sort: '-createdAt' });
    setProducts(data.products);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async () => {
    try {
      const productData = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        discountPrice: Number(form.discountPrice) || 0,
        customizationOptions: {
          allowTextOverlay: true,
          allowImageUpload: true,
          allowColorChange: true,
          availableSizes: form['customizationOptions.availableSizes'].split(',').map((s) => s.trim()),
        },
      };

      if (editProduct) {
        await productAPI.update(editProduct._id, productData);
        toast.success('Product updated');
      } else {
        await productAPI.create(productData);
        toast.success('Product created');
      }
      setShowForm(false);
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-gray-900">Products</h2>
        <button onClick={() => { setShowForm(true); setEditProduct(null); setForm({ name: '', description: '', category: 't-shirts', price: '', stock: '', discountPrice: '', featured: false, isCustomizable: true, 'customizationOptions.availableSizes': 'XS,S,M,L,XL,XXL' }); }}
          className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-5">{editProduct ? 'Edit Product' : 'Add Product'}</h3>
            <div className="space-y-3">
              {[['name', 'Product Name', 'text'], ['description', 'Description', 'textarea'], ['price', 'Price (GHS)', 'number'], ['discountPrice', 'Discount Price', 'number'], ['stock', 'Stock Quantity', 'number']].map(([key, label, type]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                  {type === 'textarea' ? (
                    <textarea value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input-field resize-none" rows={3} />
                  ) : (
                    <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input-field" />
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                  {['t-shirts', 'joggers', 'shorts', 'caps', 'cups', 'crop-tops', 'frames'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Available Sizes (comma-separated)</label>
                <input type="text" value={form['customizationOptions.availableSizes']} onChange={(e) => setForm({ ...form, 'customizationOptions.availableSizes': e.target.value })} className="input-field" placeholder="XS,S,M,L,XL,XXL" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-red-500" />
                  <span className="text-sm font-medium">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isCustomizable} onChange={(e) => setForm({ ...form, isCustomizable: e.target.checked })} className="accent-red-500" />
                  <span className="text-sm font-medium">Customizable</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 btn-outline py-2.5">Cancel</button>
              <button onClick={handleSave} className="flex-1 btn-primary py-2.5">Save Product</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Featured</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-gray-900">GHS {p.price}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${p.stock <= 5 ? 'text-red-500' : 'text-green-600'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.featured ? <span className="badge bg-yellow-100 text-yellow-700">Yes</span> : <span className="text-gray-400 text-xs">No</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditProduct(p); setForm({ ...p, 'customizationOptions.availableSizes': p.customizationOptions?.availableSizes?.join(',') || '' }); setShowForm(true); }}
                        className="text-blue-500 hover:text-blue-600 text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-600 text-xs font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center"><div className="spinner mx-auto"></div></div>}
          {!loading && products.length === 0 && <p className="p-8 text-center text-gray-500">No products yet. Add your first product!</p>}
        </div>
      </div>
    </div>
  );
};

// ===== ORDERS PAGE =====
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    const { data } = await orderAPI.getAllOrders({ status: filter || undefined, limit: 50 });
    setOrders(data.orders);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleStatusUpdate = async (orderId, status, trackingNumber) => {
    try {
      await orderAPI.updateStatus(orderId, { status, trackingNumber });
      toast.success('Order updated');
      setSelected(null);
      fetchOrders();
    } catch {
      toast.error('Failed to update');
    }
  };

  const STATUS_COLORS = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-6">Orders</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${filter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Order #</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-xs">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-900">{order.user?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-semibold">GHS {order.totalPrice?.toFixed(2)}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{order.paymentMethod?.replace('-', ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(order)} className="text-blue-500 hover:text-blue-700 text-xs font-medium">Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-8 text-center"><div className="spinner mx-auto"></div></div>}
        </div>
      </div>

      {/* Status Update Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-1">Update Order</h3>
            <p className="text-gray-500 text-sm mb-5">{selected.orderNumber}</p>
            <UpdateOrderForm order={selected} onUpdate={handleStatusUpdate} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

const UpdateOrderForm = ({ order, onUpdate, onClose }) => {
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber || '');

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      {status === 'shipped' && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tracking Number</label>
          <input type="text" value={tracking} onChange={(e) => setTracking(e.target.value)} className="input-field" placeholder="e.g. GHA12345678" />
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 btn-outline py-2.5">Cancel</button>
        <button onClick={() => onUpdate(order._id, status, tracking)} className="flex-1 btn-primary py-2.5">Update</button>
      </div>
    </div>
  );
};

// ===== MAIN ADMIN LAYOUT =====
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('overview');

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'users', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tag },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'overview': return <Overview />;
      case 'products': return <AdminProducts />;
      case 'orders': return <AdminOrders />;
      default: return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 flex flex-col transition-all duration-300 fixed top-0 left-0 h-full z-40`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-800 h-16">
          {sidebarOpen && <Link to="/" className="text-xl font-black text-white">KETSY<span className="text-red-500">.</span></Link>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white p-1">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${activePage === id ? 'bg-red-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm"
          >
            <LogOut size={18} /> {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 p-6 pt-8`}>
        <div className="max-w-6xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
