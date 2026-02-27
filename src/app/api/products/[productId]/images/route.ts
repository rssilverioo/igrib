import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';
import { deleteObject } from '@/lib/tigris';

export async function POST(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      select: { organizationId: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto nao encontrado' }, { status: 404 });
    }

    const isMember = session.user.memberships.some(
      (m) => m.organizationId === product.organizationId
    );
    if (!isMember) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    const { key, url, order } = await req.json();

    if (!key || !url) {
      return NextResponse.json({ error: 'key e url sao obrigatorios' }, { status: 400 });
    }

    const image = await prisma.productImage.create({
      data: {
        productId: params.productId,
        key,
        url,
        order: order ?? 0,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Product image POST error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json({ error: 'imageId obrigatorio' }, { status: 400 });
    }

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: {
        product: { select: { organizationId: true } },
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Imagem nao encontrada' }, { status: 404 });
    }

    const isMember = session.user.memberships.some(
      (m) => m.organizationId === image.product.organizationId
    );
    if (!isMember) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    // Delete from Tigris
    try {
      await deleteObject(image.key);
    } catch (e) {
      console.error('Tigris delete error:', e);
    }

    // Delete from database
    await prisma.productImage.delete({ where: { id: imageId } });

    return NextResponse.json({ message: 'Imagem removida' });
  } catch (error) {
    console.error('Product image DELETE error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
