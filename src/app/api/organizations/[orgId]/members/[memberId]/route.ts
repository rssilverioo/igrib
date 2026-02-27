import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function PATCH(
  req: Request,
  { params }: { params: { orgId: string; memberId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const isAdmin = session.user.memberships.some(
      (m) =>
        m.organizationId === params.orgId &&
        (m.roleType.endsWith('_SUPERADMIN') || m.roleType === 'IGRIB_ADMIN')
    );
    if (!isAdmin) {
      return NextResponse.json({ error: 'Apenas administradores' }, { status: 403 });
    }

    const { roleType, status } = await req.json();

    const updated = await prisma.organizationMember.update({
      where: { id: params.memberId },
      data: {
        ...(roleType && { roleType }),
        ...(status && { status }),
        ...(status === 'ACTIVE' && { joinedAt: new Date() }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Member PATCH error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { orgId: string; memberId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const isAdmin = session.user.memberships.some(
      (m) =>
        m.organizationId === params.orgId &&
        (m.roleType.endsWith('_SUPERADMIN') || m.roleType === 'IGRIB_ADMIN')
    );
    if (!isAdmin) {
      return NextResponse.json({ error: 'Apenas administradores' }, { status: 403 });
    }

    // Cannot remove self if only superadmin
    const member = await prisma.organizationMember.findUnique({
      where: { id: params.memberId },
    });

    if (member?.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Voce nao pode remover a si mesmo' },
        { status: 400 }
      );
    }

    await prisma.organizationMember.delete({
      where: { id: params.memberId },
    });

    return NextResponse.json({ message: 'Membro removido' });
  } catch (error) {
    console.error('Member DELETE error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
