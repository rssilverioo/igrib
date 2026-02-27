import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function GET(
  req: Request,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const isMember = session.user.memberships.some(
      (m) => m.organizationId === params.orgId
    );
    if (!isMember) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: params.orgId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Members GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    // Only superadmins can invite
    const membership = session.user.memberships.find(
      (m) =>
        m.organizationId === params.orgId &&
        (m.roleType.endsWith('_SUPERADMIN') || m.roleType === 'IGRIB_ADMIN')
    );
    if (!membership) {
      return NextResponse.json({ error: 'Apenas administradores podem convidar' }, { status: 403 });
    }

    const { email, roleType } = await req.json();

    if (!email || !roleType) {
      return NextResponse.json({ error: 'Email e cargo sao obrigatorios' }, { status: 400 });
    }

    // Check if user exists
    const invitedUser = await prisma.user.findUnique({ where: { email } });

    if (invitedUser) {
      // Check if already member
      const existingMembership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: params.orgId,
            userId: invitedUser.id,
          },
        },
      });

      if (existingMembership) {
        return NextResponse.json({ error: 'Usuario ja e membro' }, { status: 409 });
      }

      // Add directly as pending member
      const newMember = await prisma.organizationMember.create({
        data: {
          organizationId: params.orgId,
          userId: invitedUser.id,
          roleType,
          status: 'PENDING',
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json(newMember, { status: 201 });
    }

    // Create invite for non-existing user
    const invite = await prisma.invite.create({
      data: {
        email,
        organizationId: params.orgId,
        roleType,
        invitedById: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error('Member invite error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
