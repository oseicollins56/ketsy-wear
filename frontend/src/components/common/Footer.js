import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-3xl font-black text-white tracking-wider mb-4 block">
              KETSY<span className="text-red-500">.</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Premium customized clothing and accessories made in Ghana. Express your style with unique, personalized products.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-500 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-500 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-500 transition-colors">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Shop</h3>
            <ul className="space-y-2 text-sm">
              {['T-Shirts', 'Joggers', 'Shorts', 'Caps', 'Cups', 'Crop Tops', 'Frames'].map((item) => (
                <li key={item}>
                  <Link to={`/shop?category=${item.toLowerCase().replace(' ', '-')}`}
                    className="hover:text-red-400 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Info</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-red-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-red-400 transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-red-400 transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-red-400 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-red-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/privacy" className="hover:text-red-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-red-500 mt-0.5 shrink-0" />
                <span>Accra, Ghana</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-red-500 shrink-0" />
                <a href="tel:+233XXXXXXXXX" className="hover:text-red-400">+233 XX XXX XXXX</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-red-500 shrink-0" />
                <a href="mailto:info@ketsywear.com" className="hover:text-red-400">info@ketsywear.com</a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="text-white text-sm font-semibold mb-2">Payment Methods</h4>
              <div className="flex flex-wrap gap-2">
                {['MTN MoMo', 'Vodafone', 'AirtelTigo', 'Card'].map((p) => (
                  <span key={p} className="text-xs bg-gray-800 px-2 py-1 rounded">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Ketsy Wear. All rights reserved. Made with ❤️ in Ghana.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
