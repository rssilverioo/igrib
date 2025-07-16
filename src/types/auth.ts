export interface UserRole {
  name: string;
  permissions: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
} 