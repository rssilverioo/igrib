'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MessageCircle, Heart, MapPin, Package, AlignCenterVertical as Certificate, Droplet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageGallery from './ImageGallery';
import PageTransition from './PageTransition';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  images: string[];
  producer: string;
  location: string;
  rating: number;
  reviews: number;
  available: string;
  specifications: {
    humidity: string;
    protein: string;
    purity: string;
    certification: string;
  };
}

export default function ProductDetails({ product }: { product: Product }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);

  // Load favorite status from localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.some((fav: Product) => fav.id === product.id));
  }, [product.id]);

  // Load saved products from localStorage
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedProducts') || '[]');
    setSavedProducts(saved);
  }, []);

  const isProductSaved = savedProducts.some(p => p.id === product.id);

  const handleFavoriteClick = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      const updatedFavorites = favorites.filter((fav: Product) => fav.id !== product.id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } else {
      localStorage.setItem('favorites', JSON.stringify([...favorites, product]));
    }
    
    setIsFavorite(!isFavorite);
  };

  const handleSaveProduct = () => {
    let updatedProducts;
    
    if (isProductSaved) {
      updatedProducts = savedProducts.filter(p => p.id !== product.id);
    } else {
      updatedProducts = [...savedProducts, product];
    }
    
    localStorage.setItem('savedProducts', JSON.stringify(updatedProducts));
    setSavedProducts(updatedProducts);
  };

  const handleStartNegotiation = () => {
    setIsNegotiating(true);
    
    // Create negotiation and save to localStorage
    const negotiation = {
      id: Date.now().toString(),
      productId: product.id,
      sellerId: product.producer,
      product: {
        name: product.name,
        producer: product.producer,
        image: product.images[0],
        price: product.price,
        available: product.available,
        rating: product.rating
      },
      lastMessage: {
        text: `I'm interested in your ${product.name}`,
        timestamp: new Date().toISOString(),
        unread: false
      },
      status: 'new',
      deliveryType: 'delivery',
      deliveryDate: new Date().toISOString(),
      quantity: 100
    };

    const negotiations = JSON.parse(localStorage.getItem('negotiations') || '[]');
    localStorage.setItem('negotiations', JSON.stringify([...negotiations, negotiation]));
    
   router.push(`/dashboard/chat/${encodeURIComponent(product.producer)}/${product.id}?negotiation=new`)
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('common.back')}
        </motion.button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="p-6 lg:p-8">
              <ImageGallery images={product.images} alt={product.name} />
            </div>

            {/* Product Info */}
            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-lg text-gray-600">{product.producer}</p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleSaveProduct}
                    className={`p-2 rounded-full ${
                      isProductSaved
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-400 hover:text-blue-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Package className={`h-6 w-6 ${isProductSaved ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    onClick={handleFavoriteClick}
                    className={`p-2 rounded-full ${
                      isFavorite
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-400 hover:text-red-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center mt-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-gray-600">{product.rating}</span>
                <span className="ml-1 text-gray-500">
                  ({product.reviews} {t('common.ratings')})
                </span>
              </div>

              <div className="flex items-center mt-4 text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{product.location}</span>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('common.price')}
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-gray-900">{product.price}</p>
                  <p className="text-gray-600 mt-1">
                    {t('common.available')}: {product.available}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Specifications
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600">
                      <Droplet className="h-5 w-5 mr-2" />
                      <span>Humidity</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">{product.specifications.humidity}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600">
                      <Package className="h-5 w-5 mr-2" />
                      <span>Protein</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">{product.specifications.protein}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600">
                      <Star className="h-5 w-5 mr-2" />
                      <span>Purity</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">{product.specifications.purity}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center text-gray-600">
                      <Certificate className="h-5 w-5 mr-2" />
                      <span>Certification</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">{product.specifications.certification}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mt-8">
                <motion.button
                  onClick={handleStartNegotiation}
                  disabled={isNegotiating}
                  className={`w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 ${
                    isNegotiating ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  whileHover={!isNegotiating ? { scale: 1.02 } : {}}
                  whileTap={!isNegotiating ? { scale: 0.98 } : {}}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>
                    {isNegotiating ? 'Starting chat...' : 'Start Negotiation'}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}