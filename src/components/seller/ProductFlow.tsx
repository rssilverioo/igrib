import React, { useState, useRef, DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Image as ImageIcon, Droplet, Scale, AlignCenterVertical as Certificate, Tag, MapPin, ChevronRight, ArrowLeft, Upload, LucideIcon } from 'lucide-react';
import PageTransition from '../PageTransition';
import { useSellerProducts } from '@/store/sellerProducts';

interface ProductDetails {
  id: string;
  name: string;
  type: string;
  description: string;
  price: string;
  available: string;
  location: string;
  specifications: {
    humidity: string;
    protein: string;
    purity: string;
    certification: string;
  };
  images: string[];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 5;

const ProductFlow = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { addProduct } = useSellerProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [product, setProduct] = useState<ProductDetails>({
    id: '',
    name: '',
    type: '',
    description: '',
    price: '',
    available: '',
    location: '',
    specifications: {
      humidity: '',
      protein: '',
      purity: '',
      certification: ''
    },
    images: []
  });
  const [uploadError, setUploadError] = useState<string>('');

type StepItem = {
  title: string;
  icon: LucideIcon;
};

const steps: StepItem[] = [
  { title: t('seller.products.productFlow.steps.basic'), icon: Package },
  { title: t('seller.products.productFlow.steps.specifications'), icon: Certificate },
  { title: t('seller.products.productFlow.steps.images'), icon: ImageIcon },
  { title: t('seller.products.productFlow.steps.pricing'), icon: Tag },
  { title: t('seller.products.productFlow.steps.location'), icon: MapPin }
];

  const handleFiles = (files: File[]) => {
    setUploadError('');

    if (product.images.length + files.length > MAX_IMAGES) {
      setUploadError(t('seller.products.productFlow.images.maxImages'));
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(t('seller.productFlow.images.sizeError'));
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => URL.createObjectURL(file));
    setProduct({ ...product, images: [...product.images, ...newImages] });
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
  };
const handleNext = () => {
  if (step === steps.length) {
    addProduct({
   id: Date.now().toString(),
      name: product.name,
      type: product.type,
      description: product.description,
      price: product.price,
      available: product.available,
      location: product.location,
      specifications: product.specifications,
      images: product.images,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });

    router.push('/dashboard/seller/products');
  } else {
    setStep(step + 1);
  }
};

  const isStepValid = () => {
    switch (step) {
      case 1:
        return product.name && product.type && product.description;
      case 2:
        return Object.values(product.specifications).every(value => value.trim() !== '');
      case 3:
        return product.images.length > 0;
      case 4:
        return product.price && product.available;
      case 5:
        return product.location;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('seller.products.productFlow.steps.basic')}</h2>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('seller.products.productFlow.basic.name')}
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={t('seller.products.productFlow.basic.namePlaceholder')}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('seller.products.productFlow.basic.type')}
                </label>
                <select
                  value={product.type}
                  onChange={(e) => setProduct({ ...product, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{t('seller.products.productFlow.basic.selectType')}</option>
                  <option value="soy">{t('seller.products.productFlow.basic.types.soy')}</option>
                  <option value="corn">{t('seller.products.productFlow.basic.types.corn')}</option>
                  <option value="wheat">{t('seller.products.productFlow.basic.types.wheat')}</option>
                </select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('seller.products.productFlow.basic.description')}
                </label>
                <textarea
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={t('seller.products.productFlow.basic.descriptionPlaceholder')}
                />
              </motion.div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('seller.products.productFlow.specifications.title')}</h2>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="show"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Droplet className="h-4 w-4 text-gray-500" />
                  <label className="block text-sm font-medium text-gray-700">
                    {t('seller.products.productFlow.specifications.humidity')}
                  </label>
                </div>
                <input
                  type="text"
                  value={product.specifications.humidity}
                  onChange={(e) => setProduct({
                    ...product,
                    specifications: { ...product.specifications, humidity: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="14%"
                />
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Scale className="h-4 w-4 text-gray-500" />
                  <label className="block text-sm font-medium text-gray-700">
                    {t('seller.products.productFlow.specifications.protein')}
                  </label>
                </div>
                <input
                  type="text"
                  value={product.specifications.protein}
                  onChange={(e) => setProduct({
                    ...product,
                    specifications: { ...product.specifications, protein: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="40%"
                />
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Package className="h-4 w-4 text-gray-500" />
                  <label className="block text-sm font-medium text-gray-700">
                    {t('seller.products.productFlow.specifications.purity')}
                  </label>
                </div>
                <input
                  type="text"
                  value={product.specifications.purity}
                  onChange={(e) => setProduct({
                    ...product,
                    specifications: { ...product.specifications, purity: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="99%"
                />
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Certificate className="h-4 w-4 text-gray-500" />
                  <label className="block text-sm font-medium text-gray-700">
                    {t('seller.products.productFlow.specifications.certification')}
                  </label>
                </div>
                <input
                  type="text"
                  value={product.specifications.certification}
                  onChange={(e) => setProduct({
                    ...product,
                    specifications: { ...product.specifications, certification: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Orgânico BR"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('seller.products.productFlow.images.title')}</h2>
            <div className="space-y-4">
              <motion.div
                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 transition-colors ${
                  isDragging
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-500'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="text-center">
                  <motion.div
                    animate={{
                      scale: isDragging ? 1.1 : 1,
                      rotate: isDragging ? 180 : 0
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Upload className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 ${
                      isDragging ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </motion.div>
                  <p className={`text-sm sm:text-base ${isDragging ? 'text-green-600' : 'text-gray-600'}`}>
                    {t('seller.products.productFlow.images.dragDrop')}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{t('seller.products.productFlow.images.formats')}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{t('seller.products.productFlow.images.maxImages')}</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </motion.div>

              {uploadError && (
                <motion.p 
                  className="text-red-500 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {uploadError}
                </motion.p>
              )}

              {product.images.length > 0 && (
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  initial="hidden"
                  animate="show"
                >
                  {product.images.map((image, index) => (
                    <motion.div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden"
                      variants={{
                        hidden: { opacity: 0, scale: 0.8 },
                        show: { opacity: 1, scale: 1 }
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProduct({
                            ...product,
                            images: product.images.filter((_, i) => i !== index)
                          });
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ×
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('seller.products.productFlow.pricing.title')}</h2>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('seller.products.productFlow.pricing.price')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: e.target.value })}
                    className="w-full pl-12 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">{t('seller.products.productFlow.pricing.pricePerBag')}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('seller.products.productFlow.pricing.available')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={product.available}
                    onChange={(e) => setProduct({ ...product, available: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="100"
                    min="1"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {t('seller.products.productFlow.pricing.bags')}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div 
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('seller.products.productFlow.location.title')}</h2>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('seller.products.productFlow.location.address')}
                </label>
                <input
                  type="text"
                  value={product.location}
                  onChange={(e) => setProduct({ ...product, location: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={t('seller.products.productFlow.location.addressPlaceholder')}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {t('seller.products.productFlow.location.addressHelp')}
                </p>
              </motion.div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto py-6 sm:py-12 px-4 sm:px-6">
        {/* Progress Steps */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
            {steps.map((stepItem, index) => (
              <motion.div 
                key={stepItem.title} 
                className={`flex flex-col items-center ${
                  index < step - 1 ? 'text-green-600' : index === step - 1 ? 'text-green-600' : 'text-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                <motion.div 
                  className={`p-2 rounded-full ${
                    index < step - 1 
                      ? 'bg-green-100' 
                      : index === step - 1 
                        ? 'bg-green-100' 
                        : 'bg-gray-100'
                  }`}
                  animate={{
                    scale: index === step - 1 ? [1, 1.1, 1] : 1
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <stepItem.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
                <span className="text-xs mt-1 hidden sm:block">{stepItem.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Back Button */}
        {step > 1 && (
          <motion.button
            onClick={() => setStep(step - 1)}
            className="mb-4 sm:mb-6 flex items-center text-gray-600 hover:text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('common.back')}
          </motion.button>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <div className="mt-6 sm:mt-8">
          <motion.button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`w-full py-3 sm:py-4 rounded-xl flex items-center justify-center space-x-2 ${
              isStepValid()
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={isStepValid() ? { scale: 1.02 } : {}}
            whileTap={isStepValid() ? { scale: 0.98 } : {}}
          >
            <span>
              {step === steps.length 
                ?  t('common.publish')
                : t('common.continue')}
            </span>
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProductFlow;