'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface ChatMessage {
  id: string;
  negotiationRoomId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface TypingUser {
  userId: string;
  userName: string;
}

export function useSocket(roomId: string | null, onProposalUpdated?: () => void) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onProposalUpdatedRef = useRef(onProposalUpdated);
  onProposalUpdatedRef.current = onProposalUpdated;

  useEffect(() => {
    if (!roomId || !session) return;

    const socket = io({
      path: '/api/socket',
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', roomId);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    socket.on('new-message', (message: ChatMessage) => {
      setMessages((prev) => {
        // Deduplicate by ID to prevent double-rendering
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on('proposal-updated', () => {
      onProposalUpdatedRef.current?.();
    });

    socket.on('user-typing', (user: TypingUser) => {
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === user.userId)) return prev;
        return [...prev, user];
      });
    });

    socket.on('user-stop-typing', ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    socket.on('message-error', ({ error }: { error: string }) => {
      console.error('Message error:', error);
    });

    return () => {
      socket.emit('leave-room', roomId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, session]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!socketRef.current || !roomId) return;
      socketRef.current.emit('send-message', { roomId, content });
    },
    [roomId]
  );

  const startTyping = useCallback(() => {
    if (!socketRef.current || !roomId) return;

    socketRef.current.emit('typing', { roomId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop-typing', { roomId });
    }, 2000);
  }, [roomId]);

  const stopTyping = useCallback(() => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('stop-typing', { roomId });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [roomId]);

  const setInitialMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs);
  }, []);

  const notifyActivity = useCallback(() => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit('notify-activity', { roomId });
  }, [roomId]);

  return {
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    setInitialMessages,
    notifyActivity,
    currentUserId: session?.user?.id,
  };
}
