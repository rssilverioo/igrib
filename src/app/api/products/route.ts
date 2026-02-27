import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const membership = session.user.memberships[0];
    if (!membership) {
      return NextResponse.json({ error: 'Sem organizacao ativa' }, { status: 403 });
    }

    const isSeller = membership.organizationType === 'SELLER';

    const where: Record<string, unknown> = {};

    if (isSeller) {
      // Sellers only see their own organization's products
      where.organizationId = membership.organizationId;
    } else {
      // Buyers see all products from all sellers (excluding drafts)
      where.status = { not: 'DRAFT' };
    }

    // Apply explicit status filter if provided
    if (status) where.status = status.toUpperCase();

    if (type) where.type = type;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' } },
          organization: { select: { id: true, name: true, city: true, state: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { favorites: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const membership = session.user.memberships.find(
      (m) => m.organizationType === 'SELLER'
    );
    if (!membership) {
      return NextResponse.json({ error: 'Apenas vendedores podem criar produtos' }, { status: 403 });
    }

    const allowedRoles = ['SELLER_SUPERADMIN', 'SELLER_SELLER'];
    if (!allowedRoles.includes(membership.roleType)) {
      return NextResponse.json({ error: 'Sem permissao para criar produtos' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, type, price, quantity, unit, location, specifications } = body;

    if (!name || !description || !type || !price || !quantity || !location) {
      return NextResponse.json({ error: 'Campos obrigatorios faltando' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        type,
        price,
        quantity,
        unit: unit || 'sacas',
        location,
        specifications: specifications || {},
        organizationId: membership.organizationId,
        createdById: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        images: true,
        organization: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product POST error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
