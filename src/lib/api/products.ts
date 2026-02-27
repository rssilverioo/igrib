import { api } from './client';

interface ProductsQuery {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export function getProducts(query?: ProductsQuery) {
  const params = new URLSearchParams();
  if (query?.type) params.set('type', query.type);
  if (query?.status) params.set('status', query.status);
  if (query?.page) params.set('page', String(query.page));
  if (query?.limit) params.set('limit', String(query.limit));
  if (query?.search) params.set('search', query.search);

  const qs = params.toString();
  return api.get(`/products${qs ? `?${qs}` : ''}`);
}

export function getProduct(id: string) {
  return api.get(`/products/${id}`);
}

export function createProduct(data: Record<string, unknown>) {
  return api.post('/products', data);
}

export function updateProduct(id: string, data: Record<string, unknown>) {
  return api.patch(`/products/${id}`, data);
}

export function deleteProduct(id: string) {
  return api.delete(`/products/${id}`);
}
