import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const FloatingContextMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleChatWithScientist = () => {
    if (!user) {
      navigate('/login');
      setIsOpen(false);
      return;
    }
    navigate('/scientist-list');
    setIsOpen(false);
  };

  const handleChatWithAI = () => {
    navigate('/chatbot');
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <button
          onClick={toggleMenu}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
        >
          <MessageCircle size={24} />
        </button>
      </motion.div>

      {/* Context Menu Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Menu */}
            <motion.div
              className="fixed bottom-20 right-6 bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="p-2 space-y-1">
                {/* Chat with Scientist */}
                <button
                  onClick={handleChatWithScientist}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors duration-200"
                >
                  <MessageCircle size={20} />
                  <span className="font-medium">Chat with Scientist</span>
                </button>

                {/* AI Chatbot */}
                <button
                  onClick={handleChatWithAI}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors duration-200"
                >
                  <Bot size={20} />
                  <span className="font-medium">AI Pesticide Chatbot</span>
                </button>

                {/* Close */}
                <button
                  onClick={handleClose}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
                >
                  <X size={20} />
                  <span className="font-medium">Close</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingContextMenu;
