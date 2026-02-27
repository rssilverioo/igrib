import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/get-session';
import { getUploadPresignedUrl, getPublicUrl } from '@/lib/tigris';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const { fileName, contentType, productId } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName e contentType sao obrigatorios' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo nao permitido' },
        { status: 400 }
      );
    }

    const membership = session.user.memberships[0];
    const orgId = membership?.organizationId || 'unknown';
    const ext = fileName.split('.').pop() || 'jpg';
    const key = `products/${orgId}/${productId || 'temp'}/${randomUUID()}.${ext}`;

    const uploadUrl = await getUploadPresignedUrl(key, contentType);
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl,
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
