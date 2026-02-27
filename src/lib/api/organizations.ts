import { api } from './client';

export function getOrganization(orgId: string) {
  return api.get(`/organizations/${orgId}`);
}

export function updateOrganization(orgId: string, data: Record<string, unknown>) {
  return api.patch(`/organizations/${orgId}`, data);
}

export function getMembers(orgId: string) {
  return api.get(`/organizations/${orgId}/members`);
}

export function inviteMember(orgId: string, email: string, roleType: string) {
  return api.post(`/organizations/${orgId}/members`, { email, roleType });
}

export function updateMember(
  orgId: string,
  memberId: string,
  data: { roleType?: string; status?: string }
) {
  return api.patch(`/organizations/${orgId}/members/${memberId}`, data);
}

export function removeMember(orgId: string, memberId: string) {
  return api.delete(`/organizations/${orgId}/members/${memberId}`);
}
