import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(server, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      // Parse cookies manually from the handshake headers
      const cookieHeader = socket.request.headers.cookie || '';
      const cookies: Record<string, string> = {};
      cookieHeader.split(';').forEach((c) => {
        const [key, ...val] = c.trim().split('=');
        if (key) cookies[key] = val.join('=');
      });

      // Build a fake request object that getToken can read
      const fakeReq = {
        headers: socket.request.headers,
        cookies,
      };

      const token = await getToken({
        req: fakeReq as any,
        secret: process.env.NEXTAUTH_SECRET!,
      });

      console.log('[Socket.io] Token:', token ? { userId: token.userId, name: token.name } : 'null');

      if (!token?.userId) {
        console.log('[Socket.io] Rejected: no userId in token');
        return next(new Error('Nao autorizado'));
      }

      socket.data.userId = token.userId;
      socket.data.userName = token.name;
      next();
    } catch (err) {
      console.error('[Socket.io] Auth error:', err);
      next(new Error('Erro de autenticacao'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.userId}`);

    // Join a negotiation room
    socket.on('join-room', async (roomId: string) => {
      // Verify user has access to this room
      const user = await prisma.user.findUnique({
        where: { id: socket.data.userId },
        include: {
          memberships: {
            where: { status: 'ACTIVE' },
            select: { organizationId: true },
          },
        },
      });

      if (!user) return;

      const userOrgIds = user.memberships.map((m) => m.organizationId);

      const room = await prisma.negotiationRoom.findUnique({
        where: { id: roomId },
        select: { buyerOrgId: true, sellerOrgId: true },
      });

      if (!room) return;

      const hasAccess =
        userOrgIds.includes(room.buyerOrgId) ||
        userOrgIds.includes(room.sellerOrgId);

      if (!hasAccess) return;

      socket.join(`negotiation:${roomId}`);
      socket
        .to(`negotiation:${roomId}`)
        .emit('user-online', {
          userId: socket.data.userId,
          userName: socket.data.userName,
        });
    });

    // Send message
    socket.on('send-message', async ({ roomId, content }: { roomId: string; content: string }) => {
      if (!content?.trim()) return;

      try {
        const message = await prisma.chatMessage.create({
          data: {
            negotiationRoomId: roomId,
            senderId: socket.data.userId,
            content: content.trim(),
            messageType: 'text',
          },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
          },
        });

        // Update room's updatedAt
        await prisma.negotiationRoom.update({
          where: { id: roomId },
          data: { updatedAt: new Date() },
        });

        io.to(`negotiation:${roomId}`).emit('new-message', message);
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('message-error', { error: 'Erro ao enviar mensagem' });
      }
    });

    // Typing indicators
    socket.on('typing', ({ roomId }: { roomId: string }) => {
      socket.to(`negotiation:${roomId}`).emit('user-typing', {
        userId: socket.data.userId,
        userName: socket.data.userName,
      });
    });

    socket.on('stop-typing', ({ roomId }: { roomId: string }) => {
      socket.to(`negotiation:${roomId}`).emit('user-stop-typing', {
        userId: socket.data.userId,
      });
    });

    // Notify room of new activity (proposal created, accepted, rejected)
    // Client calls this after REST API operations that create messages
    socket.on('notify-activity', async ({ roomId }: { roomId: string }) => {
      try {
        const latestMessage = await prisma.chatMessage.findFirst({
          where: { negotiationRoomId: roomId },
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
          },
        });

        if (latestMessage) {
          io.to(`negotiation:${roomId}`).emit('new-message', latestMessage);

          // If it's a proposal-related message, also tell clients to reload proposals
          if (latestMessage.messageType === 'proposal_notification' || latestMessage.messageType === 'system') {
            io.to(`negotiation:${roomId}`).emit('proposal-updated');
          }
        }
      } catch (error) {
        console.error('Error in notify-activity:', error);
      }
    });

    // Leave room
    socket.on('leave-room', (roomId: string) => {
      socket.leave(`negotiation:${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });

  const port = parseInt(process.env.PORT || '3000');
  server.listen(port, () => {
    console.log(`> Server ready on http://localhost:${port}`);
  });
});
