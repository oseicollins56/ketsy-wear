import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return children;
};

// Layout with Navbar + Footer
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes with layout */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/shop" element={<MainLayout><ShopPage /></MainLayout>} />
      <Route path="/product/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />
      <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />

      {/* Auth routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />

      {/* Protected routes */}
      <Route path="/checkout" element={<ProtectedRoute><MainLayout><CheckoutPage /></MainLayout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />

      {/* Admin routes - no footer */}
      <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* Simple placeholder pages */}
      <Route path="/about" element={<MainLayout><SimplePage title="About Us" content="Ketsy Wear is a premium customized clothing brand based in Ghana. We specialize in creating unique, personalized products that help you express your style." /></MainLayout>} />
      <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
      <Route path="/faq" element={<MainLayout><SimplePage title="FAQ" content="Find answers to common questions about ordering, customization, payment, and shipping." /></MainLayout>} />
      <Route path="/privacy" element={<MainLayout><SimplePage title="Privacy Policy" content="Your privacy is important to us. We collect only necessary data and never share your information with third parties without your consent." /></MainLayout>} />
      <Route path="/shipping" element={<MainLayout><SimplePage title="Shipping Policy" content="We offer free shipping on orders over GHS 200. Standard delivery takes 3-7 business days within Ghana." /></MainLayout>} />
      <Route path="/returns" element={<MainLayout><SimplePage title="Returns & Refunds" content="Not satisfied? Return within 7 days for a full refund. Customized items can only be returned if defective." /></MainLayout>} />

      {/* Payment callback */}
      <Route path="/payment/verify" element={<PaymentVerify />} />

      {/* 404 */}
      <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  );
};

// Simple reusable page
const SimplePage = ({ title, content }) => (
  <div className="min-h-screen pt-24 pb-16 bg-gray-50">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="text-4xl font-black text-gray-900 mb-6">{title}</h1>
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <p className="text-gray-600 leading-relaxed text-lg">{content}</p>
      </div>
    </div>
  </div>
);

// Contact page
const ContactPage = () => (
  <div className="min-h-screen pt-24 pb-16 bg-gray-50">
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-4xl font-black text-gray-900 mb-8">Contact Us</h1>
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent! We will contact you shortly.'); }}>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Name</label><input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Message</label><textarea rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" required /></div>
          <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors">Send Message</button>
        </form>
      </div>
    </div>
  </div>
);

// Payment Verify page
const PaymentVerify = () => {
  const navigate = Navigate;
  React.useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('reference');
    if (ref) {
      import('./utils/api').then(({ paymentAPI }) => {
        paymentAPI.verifyPaystack(ref)
          .then(() => window.location.href = '/dashboard')
          .catch(() => window.location.href = '/cart');
      });
    } else {
      window.location.href = '/';
    }
  }, []);
  return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div><p className="ml-4 text-gray-600">Verifying payment...</p></div>;
};

// 404 page
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
    <div className="text-center">
      <p className="text-8xl font-black text-red-500 mb-4">404</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-xl transition-colors">Go Home</a>
    </div>
  </div>
);

const App = () => (
  <Router>
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  </Router>
);

export default App;
