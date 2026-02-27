import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      cpf?: string | null;
      phone?: string | null;
      memberships: {
        id: string;
        organizationId: string;
        organizationName: string;
        organizationType: 'IGRIB' | 'SELLER' | 'BUYER';
        roleType: string;
        cnpj: string;
      }[];
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
  }
}
