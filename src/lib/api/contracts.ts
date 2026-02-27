import { api } from './client';

export function getContracts() {
  return api.get('/contracts');
}

export function getContract(contractId: string) {
  return api.get(`/contracts/${contractId}`);
}

export function signContract(contractId: string) {
  return api.post(`/contracts/${contractId}/sign`, {});
}

export function getContractPdfUrl(contractId: string) {
  return api.get<{ url: string }>(`/contracts/${contractId}/pdf`);
}
