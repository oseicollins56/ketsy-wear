import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    try {
      await authAPI.toggleWishlist(product._id);
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product: product._id,
      name: product.name,
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      image: product.images?.[0]?.url || '',
      quantity: 1,
    });
  };

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const placeholderImage = `https://via.placeholder.com/400x400/1a1a2e/e94560?text=${encodeURIComponent(product.name)}`;

  return (
    <Link to={`/product/${product._id}`} className="group product-card block">
      <div className="card relative">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-gray-100">
          <img
            src={imgError ? placeholderImage : (product.images?.[0]?.url || placeholderImage)}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover product-img"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {hasDiscount && (
              <span className="badge bg-red-500 text-white">{discountPct}% OFF</span>
            )}
            {product.isCustomizable && (
              <span className="badge bg-gray-900 text-white">Customizable</span>
            )}
            {product.stock === 0 && (
              <span className="badge bg-gray-400 text-white">Out of Stock</span>
            )}
          </div>

          {/* Hover Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors ${isWishlisted ? 'bg-red-500 text-white' : 'text-gray-600'}`}
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <Link
              to={`/product/${product._id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-colors"
            >
              <Eye size={16} />
            </Link>
          </div>

          {/* Add to cart (bottom overlay) */}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 py-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-full group-hover:translate-y-0">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-2 w-full text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:text-red-400 transition-colors"
            >
              <ShoppingCart size={16} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-red-500 font-medium uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-red-500 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                    fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">GHS {displayPrice.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">GHS {product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
