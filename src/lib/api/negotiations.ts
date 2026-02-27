import { api } from './client';

export function getNegotiations() {
  return api.get('/negotiations');
}

export function getNegotiation(roomId: string) {
  return api.get(`/negotiations/${roomId}`);
}

export function createNegotiation(data: {
  productId: string;
  deliveryType?: string;
  requestedQty?: number;
  deliveryDate?: string;
  deliveryAddress?: Record<string, string>;
}) {
  return api.post('/negotiations', data);
}

export function updateNegotiationStatus(roomId: string, status: string) {
  return api.patch(`/negotiations/${roomId}`, { status });
}

export function getMessages(roomId: string, cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return api.get(`/negotiations/${roomId}/messages${params}`);
}

export function getProposals(roomId: string) {
  return api.get(`/negotiations/${roomId}/proposals`);
}

export function createProposal(roomId: string, data: Record<string, unknown>) {
  return api.post(`/negotiations/${roomId}/proposals`, data);
}

export function respondToProposal(
  roomId: string,
  proposalId: string,
  status: 'ACCEPTED' | 'REJECTED'
) {
  return api.patch(`/negotiations/${roomId}/proposals/${proposalId}`, { status });
}
