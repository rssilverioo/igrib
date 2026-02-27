import { api } from './client';

export function getFavorites() {
  return api.get('/favorites');
}

export function addFavorite(productId: string) {
  return api.post('/favorites', { productId });
}

export function removeFavorite(productId: string) {
  return api.delete(`/favorites/${productId}`);
}
