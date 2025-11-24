import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

interface Chat {
  id: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: string;
  hasNewMessageForScientist?: boolean;
  status: 'active' | 'completed';
  messages?: { text: string; sender: string; timestamp: string }[];
}

interface Profile {
  fullName: string;
  email: string;
  specialization: string;
  experience: string;
  description: string;
}

const LiveChats: React.FC = () => {
  const { user } = useAuth();
  const [profile] = useState<Profile>(() => {
    const saved = localStorage.getItem('scientistProfile');
    return saved ? JSON.parse(saved) : {
      fullName: user?.fullName || 'Dr. Jane Do',
      email: user?.email || 'jane.doe@example.com',
      specialization: 'Agricultural Biotechnology',
      experience: '7 years',
      description: 'Specialist in sustainable agriculture, crop protection, and plant innovation.',
    };
  });

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  // Load chats from backend when possible, otherwise fallback to localStorage
  useEffect(() => {
    const loadChats = async () => {
      try {
        const jwt = (user as any)?.jwt || localStorage.getItem('jwt');
        if (jwt) {
          const res = await axios.get('http://localhost:5454/api/chats/scientist', {
            headers: { Authorization: `${jwt}` },
          });
          const backendChats = res.data || [];
          // Map backend chat structure to our Chat interface
          const mapped = backendChats.map((c: any) => ({
            id: String(c.id),
            customerName: c.user?.fullname || c.user?.email || 'Customer',
            lastMessage: c.lastMessage || '',
            lastMessageAt: c.lastMessageAt || '',
            hasNewMessageForScientist: false,
            status: c.status || 'active',
            messages: [],
          } as Chat));
          setChats(mapped);
          localStorage.setItem('scientistChats', JSON.stringify(mapped));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to load chats from backend, falling back to localStorage', err);
      }

      const savedChats = localStorage.getItem('scientistChats');
      if (savedChats) {
        setChats(JSON.parse(savedChats));
      } else {
        setChats([]);
      }
      setLoading(false);
    };

    loadChats();
  }, [profile.fullName, user]);

  // Save chats to localStorage whenever they change (backup)
  useEffect(() => {
    localStorage.setItem('scientistChats', JSON.stringify(chats));
    if (activeChat) {
      const updatedActiveChat = chats.find(c => c.id === activeChat.id);
      if (updatedActiveChat) setActiveChat(updatedActiveChat);
      else setActiveChat(null);
    }
  }, [chats, activeChat]);

  // Send message (use backend when available)
  const handleSendMessage = useCallback(async () => {
    if (!activeChat || !messageText.trim()) return;
    try {
      const jwt = (user as any)?.jwt || localStorage.getItem('jwt');
      if (jwt) {
        // Create form data for the chat message
        const form = new FormData();
        form.append('chatId', activeChat.id);
        form.append('message', messageText);
        const res = await axios.post('http://localhost:5454/api/chats/scientist/send', form, {
          headers: { Authorization: `${jwt}` },
        });
        const sentMsg = res.data;
        // Append to chat messages locally (we'll fetch messages on select)
        setChats(prev => prev.map(chat => chat.id === activeChat.id ? { ...chat, lastMessage: sentMsg.text || messageText, lastMessageAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), messages: [...(chat.messages || []), { text: sentMsg.text || messageText, sender: profile.fullName, timestamp: sentMsg.createdAt || new Date().toLocaleTimeString() }] } : chat));
        setMessageText('');
        return;
      }
    } catch (err) {
      console.warn('Failed to send message via backend, falling back to local update', err);
    }

    // Local fallback
    const newMessage = {
      text: messageText,
      sender: profile.fullName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChats(prev => prev.map(chat => chat.id === activeChat.id ? { ...chat, lastMessage: newMessage.text, lastMessageAt: newMessage.timestamp, hasNewMessageForScientist: false, messages: [...(chat.messages || []), newMessage] } : chat));
    setMessageText('');
  }, [activeChat, messageText, profile.fullName, user]);

  // End consultation - Replaced window.confirm
  const handleEndConsultation = useCallback((chatId: string) => {
    console.log(`Consultation ${chatId} ended.`);

    // Simulate confirmation and action
    setChats((prev) => prev.map((chat) => chat.id === chatId ? { ...chat, status: 'completed' } : chat));
    setActiveChat(null);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[600px] bg-white rounded-xl shadow-lg">
        <h1 className="text-green-700 text-xl font-semibold animate-pulse">
          Loading Chats...
        </h1>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-gray-50 min-h-full"
    >
      <h1 className="text-3xl font-semibold text-green-700 mb-6 flex items-center">
        <MessageSquare className="mr-3" size={32} /> Live Consultations
      </h1>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-lg p-5">
          <h2 className="text-lg font-semibold text-green-700 mb-4 border-b pb-2">
            Consultation List ({chats.filter(c => c.status === 'active').length} Active)
          </h2>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {chats
              .sort((a, b) => (b.status === 'active' ? 1 : -1) - (a.status === 'active' ? 1 : -1)) // Active first
              .map((chat) => (
              <motion.div
                key={chat.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setActiveChat(chat)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  activeChat?.id === chat.id ? 'bg-green-200 border-l-4 border-green-700 shadow-md' :
                  chat.hasNewMessageForScientist
                  ? 'bg-green-100 border-l-4 border-green-600 hover:bg-green-200'
                  : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <p className="font-semibold flex justify-between items-center">
                  {chat.customerName}
                  <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${
                    chat.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {chat.status.toUpperCase()}
                  </span>
                </p>
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                <p className="text-xs text-gray-500 mt-1">{chat.lastMessageAt}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Chat View */}
        <div className="md:col-span-2">
          {activeChat ? (
            <motion.div
              key={activeChat.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-lg p-5 flex flex-col h-full min-h-[70vh]"
            >
              <div className="flex justify-between items-center border-b pb-3 mb-3">
                <h2 className="text-xl font-semibold text-green-700">
                Chat with {activeChat.customerName}
                </h2>
                {activeChat.status === 'active' && (
                  <button
                    onClick={() => handleEndConsultation(activeChat.id)}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
                  >
                    End Consultation
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto border rounded-lg bg-gray-50 p-3 mb-4 space-y-3">
                {activeChat.messages?.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === profile.fullName ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl shadow-sm text-sm ${msg.sender === profile.fullName ? 'bg-green-100 text-green-800 rounded-br-none' : 'bg-white text-gray-800 rounded-tl-none border'}`}>
                      <p>{msg.text}</p>
                      <div className={`text-xs mt-1 ${msg.sender === profile.fullName ? 'text-green-600 text-right' : 'text-gray-500 text-left'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {activeChat.status === 'active' ? (
                <div className="flex gap-2">
                  <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  placeholder="Type message..."
                  className="flex-1 border rounded-lg p-3 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                  onClick={handleSendMessage}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:bg-gray-400"
                  disabled={!messageText.trim()}
                  >
                  Send
                  </button>
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-100 rounded-lg text-gray-500 font-semibold">
                  Consultation completed. This chat is read-only.
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg flex items-center justify-center text-xl text-gray-500 p-8 min-h-[70vh]">
              <MessageSquare className="mr-2" size={36} /> Select a consultation to view the chat history.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LiveChats;
