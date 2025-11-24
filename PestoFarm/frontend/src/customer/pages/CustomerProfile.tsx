import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import axios from 'axios';

// --- INTERFACES ---
interface CustomerProfile {
  fullName: string;
  email: string;
  address: string;
  phone: string;
  [key: string]: any;
}

interface InputFieldProps {
  label: string;
  name: string;
  value: any;
  disabled: boolean;
  type?: string;
  rows?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

// --- FIX: INPUT FIELD MOVED OUTSIDE OF MAIN COMPONENT & MEMOIZED ---
const InputField: React.FC<InputFieldProps> = React.memo(({ label, name, value, disabled, type = 'text', rows = 1, onChange }) => (
  <div className="col-span-1">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {rows > 1 ? (
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        className={`w-full p-3 border rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 transition resize-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value === 0 && type === 'number' ? '' : value || ''}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-3 border rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 transition ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
      />
    )}
  </div>
));
// Ensure display name for debugging
InputField.displayName = 'InputField';

// --- MAIN CUSTOMER PROFILE COMPONENT ---
const CustomerProfile = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState<CustomerProfile>({
    fullName: '',
    email: '',
    address: '',
    phone: '',
  });
  const [originalProfile, setOriginalProfile] = useState<CustomerProfile>({
    fullName: '',
    email: '',
    address: '',
    phone: '',
  });
  const [profileError, setProfileError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  // Fetch profile from API on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const response = await axios.get('http://localhost:5454/api/users/profile', {
          headers: {
            Authorization: `Bearer ${user.jwt}`,
          },
        });
        const profileData = response.data;
        const fetchedProfile = {
          fullName: profileData.fullname || '',
          email: profileData.email || '',
          address: profileData.address || '',
          phone: profileData.phone || '',
        };
        setTempProfile(fetchedProfile);
        setOriginalProfile(fetchedProfile);
        setProfileError('');
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        // Set default profile on error
        const defaultProfile = {
          fullName: user.fullName || '',
          email: user.email,
          address: '',
          phone: '',
        };
        setTempProfile(defaultProfile);
        setOriginalProfile(defaultProfile);

        // Provide specific error messages based on status
        if (error.response?.status === 500) {
          setProfileError('Server error occurred. Please try again later.');
        } else if (error.response?.status === 401) {
          setProfileError('Authentication failed. Please log in again.');
        } else if (error.response?.status === 403) {
          setProfileError('Access denied. You may not have permission to view this profile.');
        } else {
          setProfileError('Failed to load profile from server. Using default values.');
        }
      }
    };
    fetchProfile();
  }, [user]);

  // Handles changes in input fields and textareas
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Resets changes and exits edit mode
  const handleCancel = () => {
    setEditMode(false);
    // Revert to original profile data
    if (user) {
      const savedProfile = localStorage.getItem(`customerProfile_${user.email}`);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setTempProfile({
          fullName: parsedProfile.fullName || user.fullName || '',
          email: user.email,
          address: parsedProfile.address || '',
          phone: parsedProfile.phone || '',
        });
      } else {
        setTempProfile({
          fullName: user.fullName || '',
          email: user.email,
          address: '',
          phone: '',
        });
      }
    }
    setSaveStatus('');
  };

  // Saves data to the backend API
  const handleSave = async () => {
    if (!tempProfile || !user) return;

    setSaveStatus('Saving...');

    try {
      const updatedUser = {
        fullname: tempProfile.fullName,
        email: tempProfile.email,
        mobile: tempProfile.phone,
        // Add address if needed, assuming it's a string for now
        address: tempProfile.address,
      };

      const response = await axios.put('http://localhost:5454/api/users/profile', updatedUser, {
        headers: {
          Authorization: `Bearer ${user.jwt}`,
        },
      });

      // Update user context from backend response if available
      const data = response.data;
      const updatedFullName = data?.fullname || tempProfile.fullName;
      const updatedEmail = data?.email || user.email;
      const updatedMobile = data?.mobile || tempProfile.phone;

      const updatedUserContext = { ...user, fullName: updatedFullName, email: updatedEmail } as any;
      login(updatedUserContext);

      // Update original profile with saved data
      setOriginalProfile(tempProfile);

      setEditMode(false);
      setSaveStatus('Profile updated successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (e) {
      console.error("Error saving profile:", e);
      setSaveStatus('Failed to save profile. Please try again.');
      setTimeout(() => setSaveStatus(''), 4000);
    }
  };



  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-xl text-red-700">You must be logged in to view your profile.</div>
      </div>
    );
  }

  // Tailwind CSS classes are assumed to be available
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-start items-center">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold transition duration-300 transform hover:scale-105 shadow-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Customer Profile</h2>
        <p className="text-lg text-gray-600 mb-4">Manage your personal details and preferences.</p>
        {profileError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {profileError}
          </div>
        )}

        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100">

          <div className="flex justify-between items-start mb-6 border-b pb-4">
            <h3 className="text-2xl font-semibold text-green-700">
                {editMode ? 'Editing Profile' : 'View Details'}
            </h3>
            <button
              onClick={editMode ? handleCancel : () => setEditMode(true)}
              className={`px-4 py-2 rounded-xl font-bold transition duration-300 transform hover:scale-105 shadow-lg
                ${editMode
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }`
              }
            >
              {editMode ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* All InputField components now receive the handleChange function */}
            <InputField label="Full Name" name="fullName" value={tempProfile.fullName} disabled={!editMode} onChange={handleChange} />
            <InputField label="Email (Registration)" name="email" value={tempProfile.email} disabled={true} onChange={handleChange} />
            <InputField label="Phone Number" name="phone" value={tempProfile.phone} disabled={!editMode} onChange={handleChange} />

            {/* Address - Full Row */}
            <div className="md:col-span-2">
              <InputField label="Address" name="address" value={tempProfile.address} disabled={!editMode} rows={3} onChange={handleChange} />
            </div>

          </div>

          {editMode && (
            <div className="mt-10 flex justify-end items-center space-x-4 pt-4 border-t border-gray-100">
              <p className={`text-base font-medium transition duration-500
                ${saveStatus.includes('success') ? 'text-green-600' :
                  saveStatus.includes('failed') ? 'text-red-500' :
                  'text-gray-500'
                }`
              }>
                {saveStatus || 'Ready to save changes.'}
              </p>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-green-700 text-white font-bold rounded-xl shadow-lg hover:bg-green-800 transition duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:shadow-none"
                disabled={saveStatus === 'Saving...' || !editMode}
              >
                Save Changes
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
