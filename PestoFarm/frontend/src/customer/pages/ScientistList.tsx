import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Scientist {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  description: string;
}

// Mock data for scientists - replace with API call later
const mockScientists: Scientist[] = [
  {
    id: '1',
    name: 'Dr. Jane Doe',
    specialization: 'Agricultural Biotechnology',
    experience: '7 years',
    description: 'Specialist in sustainable agriculture, crop protection, and plant innovation. Expert in modern farming techniques and biotechnology applications.',
  },
  {
    id: '2',
    name: 'Dr. John Smith',
    specialization: 'Crop Protection',
    experience: '10 years',
    description: 'Expert in pesticides, fungicides, and integrated pest management. Helps farmers choose the right protection solutions for their crops.',
  },
  {
    id: '3',
    name: 'Dr. Sarah Johnson',
    specialization: 'Soil Science',
    experience: '8 years',
    description: 'Specializes in soil health, fertility management, and nutrient optimization. Provides guidance on soil testing and amendment strategies.',
  },
  {
    id: '4',
    name: 'Dr. Michael Brown',
    specialization: 'Plant Pathology',
    experience: '12 years',
    description: 'Expert in plant diseases, diagnosis, and treatment. Offers solutions for fungal, bacterial, and viral plant infections.',
  },
  {
    id: '5',
    name: 'Dr. Emily Davis',
    specialization: 'Agronomy',
    experience: '9 years',
    description: 'Focuses on crop production, field management, and yield optimization. Provides comprehensive farming advice and best practices.',
  },
  {
    id: '6',
    name: 'Dr. Robert Wilson',
    specialization: 'Organic Farming',
    experience: '11 years',
    description: 'Specialist in organic farming methods, natural pest control, and sustainable agriculture practices. Promotes eco-friendly farming solutions.',
  },
];

const ScientistList: React.FC = () => {
  const navigate = useNavigate();
  const [scientists, setScientists] = useState<Scientist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call - replace with actual backend integration
    const fetchScientists = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setScientists(mockScientists);
        setError(null);
      } catch (err) {
        setError('Failed to load scientists. Please try again later.');
        console.error('Error fetching scientists:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScientists();
  }, []);

  const handleChatWithScientist = (scientistId: string) => {
    navigate(`/customer-chat?scientistId=${scientistId}`);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gray-50 p-4 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scientists...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gray-50 p-4 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 p-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <User className="text-green-600 mr-3" size={24} />
          <h1 className="text-2xl font-semibold text-green-700">Choose a Scientist</h1>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <p className="text-gray-600 text-center">
            Connect with our expert agricultural scientists to get personalized advice on crop protection,
            farming techniques, and pest management solutions. Choose a specialist that matches your needs.
          </p>
        </div>

        {/* Scientists Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scientists.map((scientist) => (
            <motion.div
              key={scientist.id}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <User className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{scientist.name}</h3>
                  <p className="text-sm text-green-600 font-medium">{scientist.specialization}</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{scientist.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  <strong>Experience:</strong> {scientist.experience}
                </span>
              </div>

              <button
                onClick={() => handleChatWithScientist(scientist.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center font-medium"
              >
                <MessageCircle className="mr-2" size={18} />
                Chat Now
              </button>
            </motion.div>
          ))}
        </div>

        {scientists.length === 0 && !loading && (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No scientists available at the moment.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ScientistList;
