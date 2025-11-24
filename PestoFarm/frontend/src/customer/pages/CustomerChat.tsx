import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Mic, MicOff, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import axios from 'axios';

interface Message {
  text: string;
  sender: string;
  timestamp: string;
  image?: string;
}

interface Chat {
  id: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: string;
  hasNewMessageForScientist: boolean;
  status: 'active' | 'completed';
  messages: Message[];
}

const CustomerChat: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [selectedScientistId, setSelectedScientistId] = useState<string | null>(null);
  const [selectedScientistName, setSelectedScientistName] = useState<string>('Scientist');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>('');

  const customerName = user?.fullName || 'Anonymous Customer';

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Get scientist ID from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const scientistId = urlParams.get('scientistId');
    if (scientistId) {
      setSelectedScientistId(scientistId);
      // Mock scientist name lookup - replace with API call
      const mockScientists = [
        { id: '1', name: 'Dr. Jane Doe' },
        { id: '2', name: 'Dr. John Smith' },
        { id: '3', name: 'Dr. Sarah Johnson' },
        { id: '4', name: 'Dr. Michael Brown' },
        { id: '5', name: 'Dr. Emily Davis' },
        { id: '6', name: 'Dr. Robert Wilson' },
      ];
      const scientist = mockScientists.find(s => s.id === scientistId);
      if (scientist) {
        setSelectedScientistName(scientist.name);
      }
    }
  }, []);

  // Load or create chat (prefer backend)
  useEffect(() => {
    const initChat = async () => {
      if (!user) return;
      try {
        const jwt = (user as any).jwt || localStorage.getItem('jwt');
        const scientistId = selectedScientistId;
        if (jwt && scientistId) {
          // Use API to create or fetch chat (userInitiateOrSendMessage endpoint with scientistId and no chatId will create or return existing chat)
          const form = new FormData();
          form.append('scientistId', scientistId);
          form.append('message', ''); // no initial message; API will create chat entry
          const res = await axios.post('http://localhost:5454/api/chats/user/send', form, {
            headers: { Authorization: `${jwt}` },
          });
          const message = res.data;
          const chat = message?.chat || (message && message.chatId) ? { id: String(message.chatId || message.chat?.id) } : null;
          if (chat) {
            setChatId(chat.id);
            // fetch messages for this chat
            const msgsRes = await axios.get(`http://localhost:5454/api/chats/${chat.id}/messages`, { headers: { Authorization: `${jwt}` } });
            const msgs = msgsRes.data || [];
            const mapped = msgs.map((m: any) => ({ text: m.message, sender: m.senderName || (m.user ? m.user.fullname : 'User'), timestamp: m.createdAt || '' }));
            setMessages(mapped);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to initialize chat via backend, using localStorage fallback', err);
      }

      // Local fallback
      const savedChats = localStorage.getItem('scientistChats');
      let chats: Chat[] = savedChats ? JSON.parse(savedChats) : [];
      let existingChat = chats.find(chat => chat.customerName === customerName && chat.status === 'active');
      if (!existingChat) {
        const newChat: Chat = { id: `chat_${Date.now()}`, customerName, lastMessage: '', lastMessageAt: '', hasNewMessageForScientist: false, status: 'active', messages: [] };
        chats.push(newChat);
        existingChat = newChat;
        localStorage.setItem('scientistChats', JSON.stringify(chats));
      }
      setChatId(existingChat.id);
      setMessages(existingChat.messages);
    };

    initChat();
  }, [customerName, selectedScientistId, user]);

  // Poll for new messages from scientist (reduced frequency to prevent thread exhaustion)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!chatId || !user) return;

      try {
        const jwt = (user as any).jwt || localStorage.getItem('jwt');
        if (jwt) {
          const msgsRes = await axios.get(`http://localhost:5454/api/chats/${chatId}/messages`, {
            headers: { Authorization: `${jwt}` },
            timeout: 5000 // 5 second timeout
          });
          const msgs = msgsRes.data || [];
          const mapped = msgs.map((m: any) => ({
            text: m.message,
            sender: m.senderName || (m.user ? m.user.fullname : 'User'),
            timestamp: m.createdAt || ''
          }));

          // Only update if we have new messages
          if (mapped.length > messages.length) {
            setMessages(mapped);
          }
        }
      } catch (err) {
        // Silently handle polling errors to prevent console spam
        console.warn('Failed to poll for new messages:', err);
      }
    }, 5000); // Poll every 5 seconds instead of 1

    return () => clearInterval(interval);
  }, [chatId, messages.length, user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    // Check for Web Speech API support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Web Speech API not supported in this browser.');
      return;
    }

    // Use vendor-prefixed or standard SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    // Configure recognition settings for real-time transcription
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.continuous = true; // Allow continuous listening
    recognitionRef.current.interimResults = true; // Enable interim results for real-time updates

    // Handle speech recognition results
    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Process all results, separating final and interim transcripts
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Accumulate final transcripts and update interim in real-time
      if (finalTranscript) {
        accumulatedTranscriptRef.current += finalTranscript;
      }

      // Update the input field with accumulated final transcript + current interim
      setMessageText(accumulatedTranscriptRef.current + interimTranscript);
    };

    // Handle recognition end event
    recognitionRef.current.onend = () => {
      setIsRecording(false);
      // Reset accumulated transcript for next recording session
      accumulatedTranscriptRef.current = '';
    };

    // Handle errors gracefully
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access to use voice input.');
      } else {
        alert('Voice recognition error: ' + event.error);
      }
    };

    // Handle start event for logging
    recognitionRef.current.onstart = () => {
      console.log('Speech recognition started');
    };
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !chatId || !user) return;

    try {
      const jwt = (user as any).jwt || localStorage.getItem('jwt');
      if (jwt) {
        const form = new FormData();
        form.append('chatId', chatId);
        form.append('message', messageText);
        const res = await axios.post('http://localhost:5454/api/chats/user/send', form, { headers: { Authorization: `${jwt}` } });
        const sent = res.data;
        // After sending, fetch messages
        const msgsRes = await axios.get(`http://localhost:5454/api/chats/${chatId}/messages`, { headers: { Authorization: `${jwt}` } });
        const msgs = msgsRes.data || [];
        const mapped = msgs.map((m: any) => ({ text: m.message, sender: m.senderName || (m.user ? m.user.fullname : 'User'), timestamp: m.createdAt || '' }));
        setMessages(mapped);
        setMessageText('');
      }
    } catch (err) {
      console.error('Failed to send message via backend:', err);
      // No fallback - message won't be sent without backend
    }
  };

  const handleVoiceRecord = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && chatId) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        const newMessage: Message = {
          text: 'Image uploaded',
          sender: customerName,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          image: imageData,
        };

        const updatedMessages = [...messages, newMessage];

        // Limit messages to last 50 to prevent storage quota issues
        if (updatedMessages.length > 50) {
          updatedMessages.splice(0, updatedMessages.length - 50);
        }

        setMessages(updatedMessages);

        try {
          // Update localStorage with quota check
          const savedChats = localStorage.getItem('scientistChats');
          if (savedChats) {
            const chats: Chat[] = JSON.parse(savedChats);
            const chatIndex = chats.findIndex(chat => chat.id === chatId);
            if (chatIndex !== -1) {
              chats[chatIndex].messages = updatedMessages;
              chats[chatIndex].lastMessage = 'Image uploaded';
              chats[chatIndex].lastMessageAt = newMessage.timestamp;
              chats[chatIndex].hasNewMessageForScientist = true;

              // Check storage size before saving
              const dataString = JSON.stringify(chats);
              if (dataString.length > 4 * 1024 * 1024) { // 4MB limit
                // Remove oldest messages if storage is full
                chats[chatIndex].messages = chats[chatIndex].messages.slice(-20);
              }

              localStorage.setItem('scientistChats', JSON.stringify(chats));
            }
          }
        } catch (error) {
          console.error('Failed to save chat data:', error);
          if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            alert('Storage limit exceeded. Clearing old messages to continue.');
            // Clear old messages and retry
            const savedChats = localStorage.getItem('scientistChats');
            if (savedChats) {
              const chats: Chat[] = JSON.parse(savedChats);
              const chatIndex = chats.findIndex(chat => chat.id === chatId);
              if (chatIndex !== -1) {
                chats[chatIndex].messages = chats[chatIndex].messages.slice(-10);
                localStorage.setItem('scientistChats', JSON.stringify(chats));
                setMessages(chats[chatIndex].messages);
              }
            }
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 p-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 flex items-center">
          <button
            onClick={() => navigate('/scientist-list')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <MessageSquare className="text-green-600 mr-3" size={24} />
          <div>
            {selectedScientistName !== 'Scientist' ? (
              <h1 className="text-3xl font-bold text-green-700">{selectedScientistName}</h1>
            ) : (
              <h1 className="text-2xl font-semibold text-green-700">Chat</h1>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-xl shadow-lg flex flex-col h-[70vh]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Start a conversation with our agricultural scientists!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === customerName ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-xl shadow-sm ${
                      msg.sender === customerName
                        ? 'bg-green-100 text-green-800 rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {msg.image && (
                      <img src={msg.image} alt="Uploaded" className="w-32 h-auto rounded-md mb-2" />
                    )}
                    <p>{msg.text}</p>
                    <div
                      className={`text-xs mt-2 ${
                        msg.sender === customerName ? 'text-green-600 text-right' : 'text-gray-500 text-left'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"
              />

              {/* Image Upload */}
              <label className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                <Camera size={20} className="text-gray-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Voice Record */}
              <button
                onClick={handleVoiceRecord}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* Send */}
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerChat;
