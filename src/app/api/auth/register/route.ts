import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name, cpf, phone, role, organization } = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ja esta cadastrado' },
        { status: 409 }
      );
    }

    // Check if CPF already exists
    const existingCPF = await prisma.user.findUnique({ where: { cpf: cpf.replace(/\D/g, '') } });
    if (existingCPF) {
      return NextResponse.json(
        { error: 'Este CPF ja esta cadastrado' },
        { status: 409 }
      );
    }

    // Check if CNPJ already exists
    const cleanCNPJ = organization.cnpj.replace(/\D/g, '');
    const existingOrg = await prisma.organization.findUnique({ where: { cnpj: cleanCNPJ } });
    if (existingOrg) {
      return NextResponse.json(
        { error: 'Este CNPJ ja esta cadastrado' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const orgType = role === 'buyer' ? 'BUYER' : 'SELLER';
    const superAdminRole = role === 'buyer' ? 'BUYER_SUPERADMIN' : 'SELLER_SUPERADMIN';

    // Create user, organization, and membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          cpf: cpf.replace(/\D/g, ''),
          phone: phone || null,
        },
      });

      const org = await tx.organization.create({
        data: {
          name: organization.name,
          type: orgType,
          cnpj: cleanCNPJ,
          phone: organization.phone || null,
          email: organization.email || null,
          street: organization.street || null,
          number: organization.number || null,
          complement: organization.complement || null,
          neighborhood: organization.neighborhood || null,
          city: organization.city || null,
          state: organization.state || null,
          zipcode: organization.zipcode || null,
        },
      });

      const membership = await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          roleType: superAdminRole,
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      });

      return { user, org, membership };
    });

    return NextResponse.json(
      {
        message: 'Cadastro realizado com sucesso',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        organization: {
          id: result.org.id,
          name: result.org.name,
          type: result.org.type,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
