'use client';
import { useState } from 'react';
import { Send, Search, ChevronDown } from 'lucide-react';

const mockChats = [
  {
    id: '1',
    name: 'Fazenda São João',
    product: 'Soja Orgânica',
    lastMessage: 'Podemos fechar por R$ 180/saca?',
    status: 'em-negociacao',
    unread: true,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '2',
    name: 'Café das Montanhas',
    product: 'Café Arábica',
    lastMessage: 'Enviei a proposta de entrega',
    status: 'aguardando',
    unread: false,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  }
];

const mockMessages = [
  { id: 1, sender: 'seller', text: 'Bom dia! Temos 500 sacas disponíveis', timestamp: '10:05' },
  { id: 2, sender: 'buyer', text: 'Podemos fechar por R$ 180/saca?', timestamp: '10:30' }
];

export default function CompactChatPage() {
  const [activeChat, setActiveChat] = useState(mockChats[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'buyer',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex justify-center items-start p-4">
      <div className="flex w-full max-w-4xl rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Lista de chats - Largura reduzida */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50">
          <div className="p-3 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold">Negociações</h2>
          </div>
          
          <div className="p-2 border-b border-gray-200 bg-white flex items-center">
            <Search className="h-4 w-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Pesquisar produtor..."
              className="w-full outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
            <div className="p-2 bg-gray-100 text-sm font-medium flex justify-between items-center">
              <span>Aguardando ({mockChats.filter(c => c.status === 'aguardando').length})</span>
              <ChevronDown className="h-4 w-4" />
            </div>

            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`p-3 border-b border-gray-100 flex items-center cursor-pointer hover:bg-gray-50 ${
                  activeChat.id === chat.id ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-sm truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{chat.lastMessage.split(' ')[0]}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{chat.product}</p>
                  <p className="text-sm truncate">
                    {chat.lastMessage.length > 25 
                      ? `${chat.lastMessage.substring(0, 25)}...` 
                      : chat.lastMessage}
                  </p>
                </div>
                {chat.unread && (
                  <div className="ml-2 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Área de conversa - Largura principal mas compacta */}
        <div className="flex-1 flex flex-col" style={{ maxHeight: '600px' }}>
          <div className="p-3 border-b border-gray-200 bg-green-600 text-white flex items-center">
            <img
              src={activeChat.avatar}
              alt={activeChat.name}
              className="w-8 h-8 rounded-full object-cover mr-3"
            />
            <div>
              <h3 className="font-medium">{activeChat.name}</h3>
              <p className="text-xs text-green-100">{activeChat.product}</p>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-3 ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    msg.sender === 'buyer'
                      ? 'bg-green-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === 'buyer' ? 'text-green-100' : 'text-gray-500'
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="ml-2 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}