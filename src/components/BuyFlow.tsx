'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Truck, Store, Package, MapPin, ChevronRight, ArrowLeft, Brain as Grain, Coffee, Droplet, Wheat, Popcorn as Corn, Calendar } from 'lucide-react';

interface DeliveryAddress {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

interface ProductType {
  id: string;
  name: string;
  unit: string;
}

interface PickupLocation {
  city: string;
  state: string;
  radius: number;
}

interface GrainType {
  id: string;
  name: string;
  icon: any;
  description: string;
}

const BuyFlow = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup' | null>(null);
  const [address, setAddress] = useState<DeliveryAddress>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: ''
  });
  const [pickupLocation, setPickupLocation] = useState<PickupLocation>({
    city: '',
    state: '',
    radius: 50
  });
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [selectedGrainType, setSelectedGrainType] = useState<GrainType | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');

  const productTypes: ProductType[] = [
    { id: 'grain', name: t('buyFlow.product.types.grain'), unit: 'saca' },
    { id: 'coffee', name: t('buyFlow.product.types.coffee'), unit: 'saca' },
    { id: 'liquid', name: t('buyFlow.product.types.liquid'), unit: 'litro' },
  ];

  const grainTypes: GrainType[] = [
    { 
      id: 'soy',
      name: t('buyFlow.product.grainTypes.soy.name'),
      icon: Grain,
      description: t('buyFlow.product.grainTypes.soy.description')
    },
    { 
      id: 'corn',
      name: t('buyFlow.product.grainTypes.corn.name'),
      icon: Corn,
      description: t('buyFlow.product.grainTypes.corn.description')
    },
    { 
      id: 'wheat',
      name: t('buyFlow.product.grainTypes.wheat.name'),
      icon: Wheat,
      description: t('buyFlow.product.grainTypes.wheat.description')
    }
  ];

  const steps = [
    { title: t('buyFlow.steps.delivery'), icon: Truck, isCompleted: deliveryType !== null },
    { title: t('buyFlow.steps.location'), icon: MapPin, isCompleted: deliveryType === 'delivery' ? Object.values(address).every(value => value.trim() !== '') : (pickupLocation.city && pickupLocation.state) },
    { title: t('buyFlow.steps.product'), icon: Package, isCompleted: selectedProduct !== null && (selectedProduct.id !== 'grain' || selectedGrainType !== null) },
    { title: t('buyFlow.steps.quantity'), icon: Store, isCompleted: quantity !== '' && Number(quantity) > 0 },
    { title: t('buyFlow.steps.date'), icon: Calendar, isCompleted: deliveryDate !== '' }
  ];

  const handleNext = () => {
    if (step === 5) {
      const params = new URLSearchParams();
      if (deliveryType) params.set('deliveryType', deliveryType);
      if (selectedProduct?.id) params.set('type', selectedProduct.id);
      if (selectedGrainType?.id) params.set('grainType', selectedGrainType.id);
      if (quantity) params.set('quantity', quantity);
      if (deliveryDate) params.set('deliveryDate', deliveryDate);
      if (deliveryType === 'pickup' && pickupLocation.city) {
        params.set('city', pickupLocation.city);
        params.set('state', pickupLocation.state);
      }
      router.push(`/dashboard/products?${params.toString()}`);
    } else {
      setStep(step + 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return deliveryType !== null;
      case 2:
        if (deliveryType === 'delivery') {
          return Object.values(address).every(value => value.trim() !== '');
        }
        return pickupLocation.city.trim() !== '' && 
               pickupLocation.state.trim() !== '' && 
               pickupLocation.radius > 0;
      case 3:
        if (selectedProduct?.id === 'grain') {
          return selectedGrainType !== null;
        }
        return selectedProduct !== null;
      case 4:
        return quantity !== '' && Number(quantity) > 0;
      case 5:
        return deliveryDate !== '';
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('buyFlow.deliveryType.title')}</h2>
            <div className="grid gap-4">
              <button
                onClick={() => setDeliveryType('delivery')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  deliveryType === 'delivery'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${
                    deliveryType === 'delivery' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Truck className={`h-6 w-6 ${
                      deliveryType === 'delivery' ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="ml-4 text-left">
                    <h3 className="font-semibold text-gray-900">{t('buyFlow.deliveryType.delivery.title')}</h3>
                    <p className="text-sm text-gray-600">{t('buyFlow.deliveryType.delivery.description')}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setDeliveryType('pickup')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  deliveryType === 'pickup'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${
                    deliveryType === 'pickup' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Store className={`h-6 w-6 ${
                      deliveryType === 'pickup' ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="ml-4 text-left">
                    <h3 className="font-semibold text-gray-900">{t('buyFlow.deliveryType.pickup.title')}</h3>
                    <p className="text-sm text-gray-600">{t('buyFlow.deliveryType.pickup.description')}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case 2:
        return deliveryType === 'delivery' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('buyFlow.address.delivery.title')}</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('buyFlow.address.delivery.zipcode')}
                </label>
                <input
                  type="text"
                  value={address.zipcode}
                  onChange={(e) => setAddress({ ...address, zipcode: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="00000-000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('buyFlow.address.delivery.street')}
                  </label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('buyFlow.address.delivery.number')}
                  </label>
                  <input
                    type="text"
                    value={address.number}
                    onChange={(e) => setAddress({ ...address, number: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('buyFlow.address.delivery.complement')}
                </label>
                <input
                  type="text"
                  value={address.complement}
                  onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={t('buyFlow.address.delivery.optional')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('buyFlow.address.delivery.neighborhood')}
                </label>
                <input
                  type="text"
                  value={address.neighborhood}
                  onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('buyFlow.address.delivery.city')}
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('buyFlow.address.delivery.state')}
                  </label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('buyFlow.address.pickup.title')}</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('buyFlow.address.pickup.city')}
                  </label>
                  <input
                    type="text"
                    value={pickupLocation.city}
                    onChange={(e) => setPickupLocation({ ...pickupLocation, city: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t('buyFlow.address.pickup.city')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('buyFlow.address.pickup.state')}
                  </label>
                  <input
                    type="text"
                    value={pickupLocation.state}
                    onChange={(e) => setPickupLocation({ ...pickupLocation, state: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t('buyFlow.address.pickup.state')}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('buyFlow.address.pickup.radius')}
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={pickupLocation.radius}
                    onChange={(e) => setPickupLocation({ ...pickupLocation, radius: Number(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-gray-700 font-medium w-20">
                    {pickupLocation.radius} km
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {t('buyFlow.address.pickup.radiusDescription', { radius: pickupLocation.radius })}
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        if (selectedProduct?.id === 'grain' && selectedGrainType) {
          return (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-green-600 cursor-pointer" onClick={() => setSelectedGrainType(null)}>
                <ArrowLeft className="h-5 w-5" />
                <span>{t('common.back')}</span>
              </div>
              <div className="text-center">
                <div className="inline-block p-4 bg-green-50 rounded-full mb-4">
                  <selectedGrainType.icon className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedGrainType.name}</h2>
                <p className="text-gray-600 mt-2">{selectedGrainType.description}</p>
              </div>
            </div>
          );
        }

        if (selectedProduct?.id === 'grain') {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('buyFlow.product.title')}</h2>
              <div className="grid gap-4">
                {grainTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedGrainType(type)}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-green-200 transition-all"
                  >
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-gray-100">
                        <type.icon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="ml-4 text-left">
                        <h3 className="font-semibold text-gray-900">{type.name}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('buyFlow.product.title')}</h2>
            <div className="grid gap-4">
              {productTypes.map((type) => {
                const Icon = type.id === 'grain' ? Grain : type.id === 'coffee' ? Coffee : Droplet;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedProduct(type);
                      setSelectedGrainType(null);
                    }}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedProduct?.id === type.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full ${
                        selectedProduct?.id === type.id ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          selectedProduct?.id === type.id ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="ml-4 text-left">
                        <h3 className="font-semibold text-gray-900">{type.name}</h3>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('buyFlow.quantity.title')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('common.quantity')} ({selectedProduct?.unit}s)
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={t('buyFlow.quantity.placeholder')}
                />
              </div>
              <p className="text-sm text-gray-600">
                {t('buyFlow.quantity.description')}
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('buyFlow.date.title')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('buyFlow.date.description', { type: deliveryType === 'delivery' ? t('buyFlow.date.receive') : t('buyFlow.date.pickup') })}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
          {steps.map((stepItem, index) => (
            <div 
              key={stepItem.title} 
              className={`flex flex-col items-center ${index < step - 1 ? 'text-green-600' : index === step - 1 ? 'text-green-600' : 'text-gray-400'}`}
            >
              <div className={`p-2 rounded-full ${
                index < step - 1 
                  ? 'bg-green-100' 
                  : index === step - 1 
                    ? 'bg-green-100' 
                    : 'bg-gray-100'
              }`}>
                <stepItem.icon className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">{stepItem.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Back Button */}
      {step > 1 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('common.back')}
        </button>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {renderStep()}
      </div>

      {/* Next Button */}
      <div className="mt-8">
        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          className={`w-full py-4 rounded-xl flex items-center justify-center space-x-2 ${
            isStepValid()
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>{step === 5 ? t('common.seeAvailableProducts') : t('common.continue')}</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default BuyFlow;