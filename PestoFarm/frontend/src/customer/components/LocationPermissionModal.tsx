import React, { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';

interface LocationPermissionModalProps {
  onClose: () => void;
  onChoice: (choice: 'allowWhileVisiting' | 'onlyThisTime' | 'dontAllow') => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ onClose, onChoice }) => {
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check current permission state on mount
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state as 'prompt' | 'granted' | 'denied');
      });
    }
  }, []);

  const requestLocation = (choice: 'allowWhileVisiting' | 'onlyThisTime' | 'dontAllow') => {
    setIsRequesting(true);
    if (choice === 'dontAllow') {
      // Directly deny without requesting
      onChoice(choice);
      onClose();
      return;
    }

    // Request geolocation permission
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success: permission granted
        setPermissionState('granted');
        onChoice(choice);
        onClose();
      },
      (error) => {
        // Error: permission denied or error
        console.error('Geolocation error:', error);
        setPermissionState('denied');
        onChoice('dontAllow');
        onClose();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <MapPin size={24} className="text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Location Permission</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-700 mb-6 text-center">
          PestoFarm would like to access your location to provide better services and recommendations.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => requestLocation('allowWhileVisiting')}
            disabled={isRequesting}
            className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {isRequesting ? 'Requesting...' : 'Only while visiting the site'}
          </button>

          <button
            onClick={() => requestLocation('onlyThisTime')}
            disabled={isRequesting}
            className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {isRequesting ? 'Requesting...' : 'Only this time'}
          </button>

          <button
            onClick={() => requestLocation('dontAllow')}
            disabled={isRequesting}
            className="w-full p-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
          >
            Don't allow
          </button>
        </div>

        {permissionState === 'denied' && (
          <p className="text-sm text-red-600 mt-4 text-center">
            Location access was denied. You can change this in your browser settings.
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationPermissionModal;
