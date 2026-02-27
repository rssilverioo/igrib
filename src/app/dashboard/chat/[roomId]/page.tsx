'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getNegotiation, getMessages, getProposals } from '@/lib/api/negotiations';
import ProposalForm from '@/components/chat/ProposalForm';
import ProposalCard from '@/components/chat/ProposalCard';

interface NegotiationRoom {
  id: string;
  status: string;
  buyerOrgId: string;
  sellerOrgId: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: { url: string }[];
    organization: { name: string };
  };
  buyerOrg: { id: string; name: string };
  sellerOrg: { id: string; name: string };
}

interface Proposal {
  id: string;
  negotiationRoomId: string;
  createdByOrgId: string;
  status: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
  deliveryType: string;
  deliveryDate: string | null;
  paymentTerms: string | null;
  notes: string | null;
  parentProposalId: string | null;
  createdAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const { user, isSeller, activeOrg } = useCurrentUser();

  const [room, setRoom] = useState<NegotiationRoom | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [counterProposalParent, setCounterProposalParent] = useState<Proposal | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadProposals = useCallback(async () => {
    try {
      const data = await getProposals(roomId) as Proposal[];
      setProposals(data);
    } catch (err) {
      console.error('Failed to load proposals:', err);
    }
  }, [roomId]);

  const { isConnected, messages, typingUsers, sendMessage, startTyping, stopTyping, setInitialMessages, notifyActivity, currentUserId } = useSocket(roomId, loadProposals);

  useEffect(() => {
    async function load() {
      try {
        const [roomData, messagesData] = await Promise.all([
          getNegotiation(roomId) as Promise<NegotiationRoom>,
          getMessages(roomId) as Promise<{ messages: any[]; nextCursor: string | null }>,
        ]);
        setRoom(roomData);
        setInitialMessages(messagesData.messages || []);
        await loadProposals();
      } catch (err) {
        console.error('Failed to load chat:', err);
      } finally {
        setLoading(false);
      }
    }
    if (roomId) load();
  }, [roomId, setInitialMessages, loadProposals]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(message.trim());
    setMessage('');
    stopTyping();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    startTyping();
  };

  const handleCounterPropose = (proposal: Proposal) => {
    setCounterProposalParent(proposal);
    setShowProposalForm(true);
  };

  const handleProposalCreated = () => {
    loadProposals();
    notifyActivity();
  };

  const handleProposalUpdated = async () => {
    loadProposals();
    notifyActivity();
    // Reload room to get updated status (e.g. PENDING_VALIDATION)
    try {
      const roomData = await getNegotiation(roomId) as NegotiationRoom;
      setRoom(roomData);
    } catch (err) {
      console.error('Failed to reload room:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Sala de negociacao nao encontrada.</p>
        <button onClick={() => router.back()} className="mt-4 text-green-600 hover:underline">
          Voltar
        </button>
      </div>
    );
  }

  const userOrgId = activeOrg?.organizationId;
  const counterpartyName = isSeller ? room.buyerOrg?.name : room.sellerOrg?.name;
  const productImage = room.product?.images?.[0]?.url;

  // Build a timeline of messages and proposals merged by timestamp
  const proposalNotificationIds = new Set(
    messages.filter(m => m.messageType === 'proposal_notification').map(m => m.id)
  );

  return (
    <>
      <div className="flex justify-center items-start p-4">
        <div className="flex flex-col w-full max-w-4xl rounded-lg border border-gray-200 shadow-sm overflow-hidden" style={{ height: '80vh' }}>
          {/* Header */}
          <div className="p-3 border-b border-gray-200 bg-green-600 text-white flex items-center">
            <button onClick={() => router.back()} className="mr-3 hover:bg-green-700 p-1 rounded">
              <ArrowLeft className="h-5 w-5" />
            </button>
            {productImage && (
              <img
                src={productImage}
                alt={room.product?.name}
                className="w-8 h-8 rounded-full object-cover mr-3"
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium">{counterpartyName}</h3>
              <p className="text-xs text-green-100">{room.product?.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setCounterProposalParent(null);
                  setShowProposalForm(true);
                }}
                className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Proposta</span>
              </button>
              {isConnected ? (
                <span className="w-2 h-2 bg-green-300 rounded-full" title="Conectado" />
              ) : (
                <span className="w-2 h-2 bg-red-400 rounded-full" title="Desconectado" />
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.length === 0 && proposals.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
              </div>
            )}

            {messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;

              // If it's a proposal notification, render the proposal card instead
              if (msg.messageType === 'proposal_notification') {
                const relatedProposal = proposals.find(p => {
                  const msgTime = new Date(msg.createdAt).getTime();
                  const propTime = new Date(p.createdAt).getTime();
                  return Math.abs(msgTime - propTime) < 5000; // within 5 seconds
                });

                if (relatedProposal) {
                  const isProposalOwn = relatedProposal.createdByOrgId === userOrgId;
                  return (
                    <ProposalCard
                      key={`proposal-${relatedProposal.id}`}
                      proposal={relatedProposal}
                      isOwn={isProposalOwn}
                      roomStatus={room?.status}
                      onCounterPropose={handleCounterPropose}
                      onUpdate={handleProposalUpdated}
                    />
                  );
                }

                // Fallback: render as system message
                return (
                  <div key={msg.id} className="flex justify-center mb-3">
                    <div className="bg-gray-200 text-gray-600 rounded-lg px-4 py-2 text-sm italic max-w-[80%] text-center">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              if (msg.messageType === 'system') {
                return (
                  <div key={msg.id} className="flex justify-center mb-3">
                    <div className="bg-gray-200 text-gray-600 rounded-lg px-4 py-2 text-sm italic max-w-[80%] text-center">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      isOwn
                        ? 'bg-green-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-medium text-gray-500 mb-1">{msg.sender?.name}</p>
                    )}
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-green-100' : 'text-gray-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}

            {typingUsers.length > 0 && (
              <div className="text-sm text-gray-400 italic">
                {typingUsers.map(u => u.userName).join(', ')} digitando...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder="Digite sua mensagem..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="ml-2 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Proposal Form Modal */}
      <AnimatePresence>
        {showProposalForm && (
          <ProposalForm
            roomId={roomId}
            onClose={() => {
              setShowProposalForm(false);
              setCounterProposalParent(null);
            }}
            onCreated={handleProposalCreated}
            parentProposal={counterProposalParent}
          />
        )}
      </AnimatePresence>
    </>
  );
}
