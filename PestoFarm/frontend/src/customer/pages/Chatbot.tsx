import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Mic, MicOff, Camera, ArrowLeft, CloudSun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  text: string;
  isUser: boolean;
  image?: string;
  timestamp: string;
}

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! 🌱 I'm your Pesticide & Agriculture Assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [messageText, setMessageText] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('intents');
  const [isRecording, setIsRecording] = useState(false);
  const [isImagePanelOpen, setIsImagePanelOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const accumulatedTranscriptRef = useRef<string>('');

  const apiUrl = 'http://127.0.0.1:5000';

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Web Speech API not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        accumulatedTranscriptRef.current += finalTranscript;
      }

      setMessageText(accumulatedTranscriptRef.current + interimTranscript);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      accumulatedTranscriptRef.current = '';
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access to use voice input.');
      } else {
        alert('Voice recognition error: ' + event.error);
      }
    };
  }, []);

  const addMessage = (text: string, isUser: boolean, image?: string) => {
    const newMessage: Message = {
      text,
      isUser,
      image,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    const message = messageText.trim();
    if (!message) return;

    addMessage(message, true);
    setMessageText('');

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, city, category }),
      });
      const data = await response.json();
      addMessage(data.response || "⚠️ Server not responding.", false);
    } catch (error) {
      addMessage("⚠️ Unable to connect to chatbot server. Please ensure the Flask backend is running on port 5000.", false);
    }
  };

  const sendWeatherRequest = async () => {
    const cityName = city.trim();
    if (!cityName) {
      addMessage("🌦️ Please enter a city name.", false);
      return;
    }

    addMessage(`Checking weather in ${cityName}...`, true);

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'What is the weather?', city: cityName, category: 'intents' }),
      });
      const data = await response.json();
      addMessage(data.response, false);
    } catch (error) {
      addMessage("⚠️ Unable to connect to chatbot server. Please ensure the Flask backend is running on port 5000.", false);
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    addMessage("📸 Image uploaded. Processing...", true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', category);
      formData.append('message', 'Analyze this image');
      formData.append('city', city);

      const response = await fetch(`${apiUrl}/multimodal`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      addMessage(data.response || `⚠️ ${data.error}`, false);
    } catch (error) {
      addMessage("⚠️ Unable to process image. Please ensure the Flask backend is running on port 5000.", false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 p-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-green-600 mr-3">
            <MessageSquare size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-green-700">Pesticide Chatbot</h1>
            <p className="text-sm text-gray-500">Your agricultural assistant</p>
          </div>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-xl shadow-2xl flex overflow-hidden h-[80vh]">

          {/* Chat Section */}
          <div className="flex flex-col flex-1">

            {/* Category Selection */}
            <div className="p-4 border-b border-gray-200">
              <label htmlFor="category-select" className="mr-2 font-medium text-gray-700">Select Category:</label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded border-gray-300 px-3 py-1 text-gray-700 border focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="intents">General / Weather</option>
                <option value="flowers">Flowers</option>
                <option value="fruits">Fruits</option>
                <option value="vegetables">Vegetables</option>
              </select>
            </div>

            {/* Chat Box */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} items-start`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-xl shadow-sm ${
                      msg.isUser
                        ? 'bg-green-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {msg.image && (
                      <img src={msg.image} alt="Uploaded" className="w-32 h-auto rounded-md mb-2 border border-gray-300" />
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`text-xs mt-2 ${
                        msg.isUser ? 'text-green-100 text-right' : 'text-gray-500 text-left'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-100 border-t border-gray-200 flex items-center space-x-2">

              {/* City Input */}
              <div className="relative w-1/3 flex items-center">
                <input
                  id="city-input"
                  type="text"
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendWeatherRequest()}
                  className="w-full pl-10 pr-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CloudSun size={16} className="text-gray-400" />
                </div>
                <button
                  id="weather-button"
                  title="Get weather"
                  onClick={sendWeatherRequest}
                  className="p-2 ml-2 rounded-full text-gray-500 hover:text-green-600 hover:bg-gray-200 focus:ring-2 focus:ring-green-500"
                >
                  <CloudSun size={16} />
                </button>
              </div>

              {/* Message Input */}
              <div className="relative w-2/3">
                <input
                  id="message-input"
                  type="text"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-4 pr-16 py-2 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center space-x-2">
                  <label className="p-2 rounded-full text-gray-500 hover:text-green-600 hover:bg-gray-200 cursor-pointer focus:ring-2 focus:ring-green-500">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    id="mic-button"
                    onClick={handleVoiceRecord}
                    className={`p-2 rounded-full focus:ring-2 focus:ring-green-500 ${
                      isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-green-600 hover:bg-gray-200'
                    }`}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  <button
                    id="send-button"
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    className="p-2 rounded-full text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 focus:ring-2 focus:ring-green-500"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Panel */}
          <div
            id="image-panel"
            className={`bg-gray-50 border-l border-gray-300 flex flex-col items-center justify-center p-4 transition-all duration-300 ${
              isImagePanelOpen ? 'w-80' : 'w-0 overflow-hidden'
            }`}
          >
            {isImagePanelOpen && (
              <>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Upload Plant Image</h2>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mb-3 border p-2 rounded w-full bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  id="process-image"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full focus:ring-2 focus:ring-green-500"
                >
                  Process
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Chatbot;
