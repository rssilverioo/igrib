import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    newUser: '/signup',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId as string },
          include: {
            memberships: {
              where: { status: 'ACTIVE' },
              include: { organization: true },
            },
          },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.cpf = dbUser.cpf;
          session.user.phone = dbUser.phone;
          session.user.memberships = dbUser.memberships.map((m) => ({
            id: m.id,
            organizationId: m.organizationId,
            organizationName: m.organization.name,
            organizationType: m.organization.type,
            roleType: m.roleType,
            cnpj: m.organization.cnpj,
          }));
        }
      }
      return session;
    },
  },
};
