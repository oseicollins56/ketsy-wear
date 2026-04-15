import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { productAPI } from '../utils/api';
import ProductCard from '../components/product/ProductCard';

const CATEGORIES = [
  { name: 'T-Shirts', slug: 't-shirts', emoji: '👕', color: 'from-blue-500 to-blue-700' },
  { name: 'Joggers', slug: 'joggers', emoji: '🩱', color: 'from-purple-500 to-purple-700' },
  { name: 'Shorts', slug: 'shorts', emoji: '🩳', color: 'from-green-500 to-green-700' },
  { name: 'Caps', slug: 'caps', emoji: '🧢', color: 'from-yellow-500 to-orange-500' },
  { name: 'Cups', slug: 'cups', emoji: '☕', color: 'from-red-500 to-red-700' },
  { name: 'Crop Tops', slug: 'crop-tops', emoji: '👚', color: 'from-pink-500 to-pink-700' },
  { name: 'Frames', slug: 'frames', emoji: '🖼️', color: 'from-indigo-500 to-indigo-700' },
];

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over GHS 200' },
  { icon: Shield, title: 'Secure Payment', desc: 'MTN, Vodafone, Card & more' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await productAPI.getFeatured();
        setFeatured(data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden pt-16">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute text-6xl select-none" style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              opacity: 0.3,
            }}>
              {['👕', '🧢', '☕', '🖼️'][i % 4]}
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-red-400 text-sm font-medium">Custom Orders Now Open in Ghana</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
                Wear Your
                <span className="block text-red-500">Story.</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-lg">
                Premium customized t-shirts, joggers, caps, cups, frames, and more.
                Upload your design or create one — we'll bring it to life.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                >
                  Shop Now <ArrowRight size={20} />
                </Link>
                <Link
                  to="/shop?category=t-shirts"
                  className="inline-flex items-center gap-2 border-2 border-gray-600 hover:border-red-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all"
                >
                  Custom Design
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10">
                <div className="text-center">
                  <p className="text-3xl font-black text-white">500+</p>
                  <p className="text-gray-400 text-sm">Happy Customers</p>
                </div>
                <div className="w-px h-12 bg-gray-700"></div>
                <div className="text-center">
                  <p className="text-3xl font-black text-white">7</p>
                  <p className="text-gray-400 text-sm">Product Types</p>
                </div>
                <div className="w-px h-12 bg-gray-700"></div>
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} className="text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-white font-bold ml-2">4.9</span>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-96 h-96">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl opacity-20 blur-3xl"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl flex items-center justify-center border border-gray-600">
                  <div className="text-center">
                    <div className="text-8xl mb-4">👕</div>
                    <p className="text-white font-bold text-xl">Your Design Here</p>
                    <p className="text-gray-400 text-sm mt-2">Upload & Customize</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 p-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Shop By Category</h2>
            <p className="text-gray-500 text-lg">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center p-6 bg-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform`}>
                  {cat.emoji}
                </div>
                <span className="text-sm font-semibold text-gray-900 text-center group-hover:text-red-500 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-500">Our most loved customizable items</p>
            </div>
            <Link
              to="/shop"
              className="hidden md:flex items-center gap-2 text-red-500 font-semibold hover:text-red-600 transition-colors"
            >
              View All <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl aspect-square animate-pulse"></div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl mb-4">No featured products yet</p>
              <Link to="/shop" className="btn-primary">Browse All Products</Link>
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
              View All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CUSTOMIZATION CTA */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-red-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Design Something Unique</h2>
          <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto">
            Upload your logo, artwork, or text. We'll print it on premium quality products and deliver it to your door.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop" className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105">
              Start Customizing
            </Link>
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition-all">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
