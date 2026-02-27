import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const invite = await prisma.invite.findUnique({
      where: { token: params.token },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Convite nao encontrado' }, { status: 404 });
    }

    if (invite.status !== 'PENDING') {
      return NextResponse.json({ error: 'Este convite ja foi utilizado' }, { status: 410 });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ error: 'Este convite expirou' }, { status: 410 });
    }

    const { name, email, cpf, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha sao obrigatorios' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter no minimo 8 caracteres' }, { status: 400 });
    }

    if (email !== invite.email) {
      return NextResponse.json({ error: 'O email nao corresponde ao convite' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Este email ja esta cadastrado' }, { status: 409 });
    }

    // Check if CPF already exists
    if (cpf) {
      const cleanCpf = cpf.replace(/\D/g, '');
      const existingCPF = await prisma.user.findUnique({ where: { cpf: cleanCpf } });
      if (existingCPF) {
        return NextResponse.json({ error: 'Este CPF ja esta cadastrado' }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          cpf: cpf ? cpf.replace(/\D/g, '') : null,
          phone: phone || null,
        },
      });

      const membership = await tx.organizationMember.create({
        data: {
          organizationId: invite.organizationId,
          userId: user.id,
          roleType: invite.roleType,
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' },
      });

      return { user, membership };
    });

    return NextResponse.json(
      {
        message: 'Conta criada com sucesso',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Invite register error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
