'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import PageTransition from '../PageTransition';
import { getProducts, deleteProduct } from '@/lib/api/products';

interface Product {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  location: string;
  status: string;
  images: { id: string; url: string; order: number }[];
}

const MyProducts = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await getProducts() as { products: Product[]; pagination: any };
        setProducts(res.products || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product Deleted!', { duration: 5000 });
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast.error('Failed to delete product');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {t('seller.products.empty.title')}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('seller.products.empty.description')}
        </p>
        <Link
          href="/dashboard/seller/products/new"
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('seller.products.addNew')}
        </Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">{t('seller.products.title')}</h1>
          <Link
            href="/dashboard/seller/products/new"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>{t('seller.products.addNew')}</span>
          </Link>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-md p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <input
            type="text"
            placeholder={t('seller.products.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </motion.div>

        <motion.div
          className="grid gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredProducts.map((product) => {
            const imageUrl = product.images?.[0]?.url || '/images/placeholder-product.jpg';
            return (
              <motion.div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                variants={item}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center px-4">
                  <div className="w-48 h-48">
                    <Image
                      src={imageUrl}
                      width={192}
                      height={192}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-gray-600">{product.type}</p>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/dashboard/seller/products/edit/${product.id}`)}
                        >
                          <Edit className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center text-gray-600">
                      <Package className="h-5 w-5 mr-2" />
                      <span>{t('common.available')}: {product.quantity} {product.unit || 'sacas'}</span>
                    </div>

                    <div className="mt-4">
                      <p className="text-lg font-semibold text-gray-900">
                        R$ {Number(product.price).toFixed(2)}/{product.unit || 'saca'}
                      </p>
                    </div>

                    <div className="mt-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t(`seller.products.status.${product.status?.toLowerCase() || 'draft'}`)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default MyProducts;
