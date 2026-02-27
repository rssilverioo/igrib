import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const invite = await prisma.invite.findUnique({
      where: { token: params.token },
      include: {
        organization: {
          select: { name: true, type: true },
        },
      },
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

    return NextResponse.json({
      email: invite.email,
      organizationName: invite.organization.name,
      organizationType: invite.organization.type,
      roleType: invite.roleType,
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    console.error('Invite GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

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

    // Check if user is already a member
    const existingMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invite.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json({ error: 'Voce ja e membro desta organizacao' }, { status: 409 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const membership = await tx.organizationMember.create({
        data: {
          organizationId: invite.organizationId,
          userId: session.user.id,
          roleType: invite.roleType,
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' },
      });

      return membership;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Invite POST error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
