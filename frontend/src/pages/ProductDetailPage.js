import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Upload, Type, Palette, ChevronLeft, ChevronRight, ZoomIn, Share2 } from 'lucide-react';
import { productAPI, authAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const canvasRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Customization state
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(24);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [hasCustomization, setHasCustomization] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await productAPI.getOne(id);
        setProduct(data.product);
        if (data.product.customizationOptions?.availableSizes?.[0]) {
          setSelectedSize(data.product.customizationOptions.availableSizes[0]);
        }
        if (data.product.customizationOptions?.availableColors?.[0]) {
          setSelectedColor(data.product.customizationOptions.availableColors[0].hex);
        }
      } catch {
        toast.error('Product not found');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  // Draw customization canvas preview
  useEffect(() => {
    if (!canvasRef.current || !product?.isCustomizable) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Product placeholder
    ctx.fillStyle = selectedColor || '#4B5563';
    ctx.roundRect(20, 20, canvas.width - 40, canvas.height - 40, 10);
    ctx.fill();

    // Uploaded image
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 80, 60, canvas.width - 160, canvas.height - 120);
        drawText();
      };
      img.src = uploadedImage;
    } else {
      drawText();
    }

    function drawText() {
      if (customText) {
        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.fillText(customText, canvas.width / 2, canvas.height / 2 + 20);
        ctx.shadowBlur = 0;
      }
    }
  }, [customText, textColor, fontSize, uploadedImage, selectedColor, product]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setHasCustomization(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAddToCart = () => {
    if (!selectedSize && product?.customizationOptions?.availableSizes?.length > 0) {
      toast.error('Please select a size');
      return;
    }

    const canvasPreview = hasCustomization && canvasRef.current
      ? canvasRef.current.toDataURL()
      : null;

    addToCart({
      product: product._id,
      name: product.name,
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      image: product.images?.[0]?.url || '',
      size: selectedSize,
      color: selectedColor,
      quantity,
      customization: hasCustomization ? {
        hasCustomization: true,
        textOverlay: customText,
        textColor,
        fontSize,
        uploadedImageUrl: uploadedImage,
        previewImage: canvasPreview,
      } : { hasCustomization: false },
    });
  };

  const handleSubmitReview = async () => {
    if (!user) { toast.error('Please login to review'); return; }
    if (!reviewComment.trim()) { toast.error('Please write a comment'); return; }
    setSubmittingReview(true);
    try {
      await productAPI.addReview(id, { rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted!');
      setReviewComment('');
      setReviewRating(5);
      // Refresh
      const { data } = await productAPI.getOne(id);
      setProduct(data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login first'); return; }
    try {
      await authAPI.toggleWishlist(id);
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch { toast.error('Failed'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) return null;

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a href="/" className="hover:text-red-500">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:text-red-500">Shop</a>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
              <img
                src={product.images?.[activeImg]?.url || `https://via.placeholder.com/600x600/1a1a2e/e94560?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((prev) => (prev - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setActiveImg((prev) => (prev + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm text-red-500 font-semibold uppercase tracking-wider">{product.category}</span>
              <div className="flex gap-2">
                <button onClick={handleWishlist} className={`p-2 rounded-full border transition-colors ${isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 hover:border-red-200 hover:text-red-500'}`}>
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link copied!'))}
                  className="p-2 rounded-full border border-gray-200 hover:border-gray-400 transition-colors"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'} fill={i < Math.round(product.rating) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-gray-600 text-sm">{product.rating} ({product.numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-black text-gray-900">GHS {displayPrice.toFixed(2)}</span>
              {product.discountPrice > 0 && (
                <span className="text-xl text-gray-400 line-through">GHS {product.price.toFixed(2)}</span>
              )}
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

            {/* Color Selector */}
            {product.customizationOptions?.availableColors?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Color: <span className="font-normal">{product.customizationOptions.availableColors.find((c) => c.hex === selectedColor)?.name || 'Select'}</span>
                </p>
                <div className="flex gap-2">
                  {product.customizationOptions.availableColors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColor(color.hex)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color.hex ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.customizationOptions?.availableSizes?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.customizationOptions.availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${selectedSize === size ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 hover:border-gray-900'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors text-lg font-bold">−</button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors text-lg font-bold">+</button>
              </div>
              <span className="text-sm text-gray-500">{product.stock} in stock</span>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-lg mb-4"
            >
              <ShoppingCart size={22} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {/* Customization Tool */}
            {product.isCustomizable && (
              <div className="border border-dashed border-red-300 bg-red-50 rounded-xl p-5 mt-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Palette size={18} className="text-red-500" /> Customize This Product
                </h3>

                <canvas
                  ref={canvasRef}
                  width={300}
                  height={200}
                  className="w-full rounded-lg mb-4 border border-gray-200"
                />

                <div className="space-y-3">
                  {product.customizationOptions?.allowImageUpload && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Design</label>
                      <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded-lg px-4 py-2.5 hover:bg-gray-100 transition-colors text-sm">
                        <Upload size={16} /> Choose Image (Max 5MB)
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  )}
                  {product.customizationOptions?.allowTextOverlay && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Add Text</label>
                      <input
                        type="text"
                        value={customText}
                        onChange={(e) => { setCustomText(e.target.value); setHasCustomization(true); }}
                        placeholder="Your text here..."
                        className="input-field text-sm"
                        maxLength={50}
                      />
                    </div>
                  )}
                  {customText && (
                    <div className="flex gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Text Color</label>
                        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Font Size: {fontSize}px</label>
                        <input type="range" min="12" max="48" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-red-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-gray-200">
            {['details', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              >
                {tab} {tab === 'reviews' && `(${product.numReviews})`}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'details' && (
              <div className="prose max-w-none text-gray-600">
                <p className="leading-relaxed">{product.description}</p>
                {product.customizationOptions?.availableSizes?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900">Available Sizes:</h4>
                    <p>{product.customizationOptions.availableSizes.join(', ')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Review form */}
                {user && (
                  <div className="bg-gray-50 rounded-xl p-6 mb-8">
                    <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setReviewRating(s)}>
                          <Star size={24} className={s <= reviewRating ? 'text-yellow-400' : 'text-gray-300'} fill={s <= reviewRating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="input-field resize-none mb-3"
                      placeholder="Share your experience..."
                    />
                    <button onClick={handleSubmitReview} disabled={submittingReview} className="btn-primary">
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                )}

                {/* Reviews list */}
                {product.reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map((review, i) => (
                      <div key={i} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0">
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {review.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold text-gray-900">{review.name}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, s) => (
                                <Star key={s} size={13} className={s < review.rating ? 'text-yellow-400' : 'text-gray-300'} fill={s < review.rating ? 'currentColor' : 'none'} />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                          <p className="text-gray-400 text-xs mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
