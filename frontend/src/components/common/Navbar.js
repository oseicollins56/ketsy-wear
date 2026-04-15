import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Heart, Search, LogOut, Settings, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowDropdown(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const categories = [
    { name: "T-Shirts", path: "/shop?category=t-shirts" },
    { name: "Joggers", path: "/shop?category=joggers" },
    { name: "Shorts", path: "/shop?category=shorts" },
    { name: "Caps", path: "/shop?category=caps" },
    { name: "Cups", path: "/shop?category=cups" },
    { name: "Crop Tops", path: "/shop?category=crop-tops" },
    { name: "Frames", path: "/shop?category=frames" },
  ];

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900 shadow-lg' : 'bg-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black text-white tracking-wider">
              KETSY<span className="text-red-500">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-red-400 transition-colors text-sm font-medium">Home</Link>
            <div className="relative group">
              <button className="text-gray-300 hover:text-red-400 transition-colors text-sm font-medium flex items-center gap-1">
                Shop <span className="text-xs">▾</span>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat.name}
                    to={cat.path}
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 first:rounded-t-xl last:rounded-b-xl transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/shop" className="text-gray-300 hover:text-red-400 transition-colors text-sm font-medium">All Products</Link>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-800 rounded-full px-4 py-1.5 w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent text-gray-300 placeholder-gray-500 text-sm outline-none flex-1"
            />
            <button type="submit">
              <Search size={16} className="text-gray-400 hover:text-red-400 transition-colors" />
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <Link to="/wishlist" className="relative text-gray-300 hover:text-red-400 transition-colors hidden md:block">
                <Heart size={22} />
              </Link>
            )}

            <Link to="/cart" className="relative text-gray-300 hover:text-red-400 transition-colors">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b">
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500">
                      <User size={16} /> My Account
                    </Link>
                    <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500">
                      <Package size={16} /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500">
                        <Settings size={16} /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 border-t"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-gray-300 hover:text-white transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-gray-900 border-t border-gray-700 px-4 py-4">
          <form onSubmit={handleSearch} className="flex items-center bg-gray-800 rounded-full px-4 py-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent text-gray-300 placeholder-gray-500 text-sm outline-none flex-1"
            />
            <button type="submit"><Search size={16} className="text-gray-400" /></button>
          </form>
          <div className="space-y-1">
            <Link to="/" className="block py-2 text-gray-300 hover:text-red-400 font-medium">Home</Link>
            <Link to="/shop" className="block py-2 text-gray-300 hover:text-red-400 font-medium">All Products</Link>
            {categories.map((cat) => (
              <Link key={cat.name} to={cat.path} className="block py-1.5 pl-4 text-gray-400 hover:text-red-400 text-sm">
                {cat.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" className="block py-2 text-gray-300 hover:text-red-400">My Account</Link>
                <Link to="/orders" className="block py-2 text-gray-300 hover:text-red-400">My Orders</Link>
                {isAdmin && <Link to="/admin" className="block py-2 text-gray-300 hover:text-red-400">Admin Panel</Link>}
                <button onClick={logout} className="block w-full text-left py-2 text-red-400">Logout</button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1 text-center py-2 border border-gray-600 rounded-lg text-gray-300 hover:border-red-400 hover:text-red-400">Login</Link>
                <Link to="/register" className="flex-1 text-center py-2 bg-red-500 rounded-lg text-white font-semibold">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
