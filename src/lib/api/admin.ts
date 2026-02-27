import { api } from './client';

export function getPendingValidations() {
  return api.get('/admin/contracts/pending');
}

export function approveContract(roomId: string) {
  return api.post(`/admin/contracts/${roomId}/approve`, {});
}

export function rejectContract(roomId: string, reason?: string) {
  return api.post(`/admin/contracts/${roomId}/reject`, { reason });
}

export function getAdminStats() {
  return api.get('/admin/stats');
}

export function getPendingProducts() {
  return api.get('/admin/products/pending');
}

export function approveProduct(productId: string) {
  return api.patch(`/admin/products/${productId}/approve`, {});
}

export function rejectProduct(productId: string) {
  return api.patch(`/admin/products/${productId}/reject`, {});
}

export function getOrganizations(type?: string) {
  const query = type ? `?type=${type}` : '';
  return api.get(`/admin/organizations${query}`);
}

export function getRecentContracts() {
  return api.get('/admin/contracts');
}
