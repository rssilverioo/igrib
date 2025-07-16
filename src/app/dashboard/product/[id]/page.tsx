'use client';

import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/ProductDetails';

const mockProducts = {
  '1': {
    id: '1',
    name: 'Soja Orgânica Premium',
    producer: 'Fazenda São João',
    description: 'Soja orgânica de alta qualidade, cultivada com práticas sustentáveis e certificação orgânica. Ideal para produção de alimentos saudáveis e processamento industrial.',
    price: 'R$ 180,00/saca',
    images: [
      'https://images.unsplash.com/photo-1728931340168-3869028e99e7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://plus.unsplash.com/premium_photo-1671130295735-25af5e78d40c?q=80&w=1968&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1641913040048-771b0c408136?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
    location: 'Sorriso, MT',
    rating: 4.8,
    reviews: 156,
    available: '500 sacas',
    specifications: {
      humidity: '14%',
      protein: '40%',
      purity: '99%',
      certification: 'Orgânico BR'
    }
  },
  '2': {
    id: '2',
    name: 'Café Arábica Premium',
    producer: 'Café das Montanhas',
    description: 'Café arábica de altitude, cultivado em região privilegiada com clima ideal. Notas de chocolate e caramelo, acidez equilibrada e corpo aveludado.',
    price: 'R$ 1.200,00/saca',
    images: [
      'https://images.unsplash.com/photo-1606486544554-164d98da4889?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://plus.unsplash.com/premium_photo-1675435646793-f6ceb239b064?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1602101888581-ee1331659f16?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
    location: 'Poços de Caldas, MG',
    rating: 4.9,
    reviews: 203,
    available: '100 sacas',
    specifications: {
      humidity: '11%',
      protein: 'N/A',
      purity: '98%',
      certification: 'Specialty Coffee'
    }
  }
};

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const product = mockProducts[productId];
  
  if (!product) notFound();

  return <ProductDetails product={product} />;
}