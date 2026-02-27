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

    // Verify user is member
    const isMember = session.user.memberships.some(
      (m) => m.organizationId === params.orgId
    );
    if (!isMember) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: params.orgId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, cpf: true, phone: true },
            },
          },
        },
        _count: { select: { products: true, invites: true } },
      },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organizacao nao encontrada' }, { status: 404 });
    }

    return NextResponse.json(org);
  } catch (error) {
    console.error('Organization GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    // Only superadmins can edit org
    const membership = session.user.memberships.find(
      (m) =>
        m.organizationId === params.orgId &&
        (m.roleType.endsWith('_SUPERADMIN') || m.roleType === 'IGRIB_ADMIN')
    );
    if (!membership) {
      return NextResponse.json({ error: 'Apenas administradores podem editar' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name, phone, email, street, number, complement,
      neighborhood, city, state, zipcode,
    } = body;

    const updated = await prisma.organization.update({
      where: { id: params.orgId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(street !== undefined && { street }),
        ...(number !== undefined && { number }),
        ...(complement !== undefined && { complement }),
        ...(neighborhood !== undefined && { neighborhood }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipcode !== undefined && { zipcode }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Organization PATCH error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
