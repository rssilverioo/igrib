import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Package } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
}

const Chat = () => {
  const { sellerId, productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const product = location.state?.product;
  const isNewChat = location.state?.isNewChat;

  useEffect(() => {
    if (isNewChat) {
      // Add initial message for new chats
      setMessages([
        {
          id: 1,
          sender: 'buyer',
          text: `Olá! Estou interessado no produto ${product.name}. Gostaria de saber mais sobre disponibilidade e condições de entrega.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } else {
      // This would normally fetch messages from an API
      setMessages([
        {
          id: 1,
          sender: 'buyer',
          text: `Olá! Estou interessado no produto ${product?.name}. Gostaria de saber mais sobre disponibilidade e condições de entrega.`,
          timestamp: '10:30'
        },
        {
          id: 2,
          sender: 'seller',
          text: 'Olá! Claro, temos disponibilidade imediata. Qual quantidade você precisa?',
          timestamp: '10:31'
        }
      ]);
    }
  }, [isNewChat, product]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      sender: 'buyer' as const,
      text: message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  if (!product) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/negotiations')}
            className="hover:bg-green-700 p-2 rounded-full"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{product.producer}</h2>
            <div className="flex items-center text-green-100 text-sm">
              <Package className="h-4 w-4 mr-1" />
              <span>{product.name}</span>
              <span className="mx-2">•</span>
              <span>{product.price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender === 'buyer'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'buyer' ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="p-4 border-t">
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-green-600"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Send className="h-5 w-5" />
              <span>Enviar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;