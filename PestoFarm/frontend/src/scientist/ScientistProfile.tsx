import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, User } from '../AuthContext';
import axios from 'axios';

// Define the shape of the profile state for scientist (only account creation data)
interface ScientistProfileState {
    fullName: string;
    email: string;
    password: string;
    otp: string;
}

// --- DetailField Component (Adapted from SellerProfile.tsx for consistency) ---
interface DetailFieldProps {
    label: string;
    name: keyof ScientistProfileState;
    value: string;
    isEditing: boolean;
    type?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DetailField: React.FC<DetailFieldProps> = ({ label, name, value, isEditing, type = 'text', onChange }) => (
    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
        <label htmlFor={name} className="block text-sm font-medium text-gray-500 sm:mt-px sm:pt-2">
            {label}
        </label>
        <div className="mt-1 sm:mt-0 sm:col-span-2">
            {isEditing ? (
                <input
                    type={type}
                    name={name}
                    id={name}
                    value={value}
                    onChange={onChange}
                    className="max-w-lg block w-full shadow-sm focus:ring-green-500 focus:border-green-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md p-2"
                    required
                />
            ) : (
                <p className="block w-full text-gray-900 sm:text-sm sm:max-w-lg mt-2">
                    {type === 'password' || name === 'otp' ? '••••••••' : value}
                </p>
            )}
        </div>
    </div>
);

// --- Scientist Profile Component ---
const ScientistProfile = () => {
    const navigate = useNavigate();
    const { user, login, logout } = useAuth();
    // State to hold the scientist's profile data (only account creation fields)
    const [profile, setProfile] = useState<ScientistProfileState>({
        fullName: '',
        email: user?.email || '',
        password: '',
        otp: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    // Update profile state when user changes - prefer backend
    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return;
            try {
                const jwt = (user as any)?.jwt || localStorage.getItem('jwt');
                if (jwt) {
                    const res = await axios.get('http://localhost:5454/api/scientists/profile', {
                        headers: { Authorization: `${jwt}` }
                    });
                    const data = res.data;
                    setProfile({
                        fullName: data.fullname || data.fullName || user.fullName || '',
                        email: data.email || user.email || '',
                        password: '',
                        otp: ''
                    });
                    // backup locally
                    localStorage.setItem(`user_${user.email}`, JSON.stringify({ fullName: data.fullname || data.fullName || '' }));
                    return;
                }
            } catch (err) {
                console.warn('Could not fetch scientist profile, falling back to localStorage', err);
            }

            if (user?.email) {
                const storedProfile = localStorage.getItem(`user_${user.email}`);
                if (storedProfile) {
                    const parsedProfile = JSON.parse(storedProfile);
                    setProfile({
                        fullName: parsedProfile.fullName || '',
                        email: user.email,
                        password: parsedProfile.password || '',
                        otp: parsedProfile.otp || '',
                    });
                } else {
                    setProfile({ fullName: user.fullName || '', email: user.email || '', password: '', otp: '' });
                }
            }
        };
        loadProfile();
    }, [user]);

    // Handler to update state for any input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(prevProfile => ({
            ...prevProfile,
            [e.target.name]: e.target.value,
        }));
    };

    // Handler for saving the form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            fullname: profile.fullName,
            // other fields can be added as ScientistRequest expects
        };
        try {
            const jwt = (user as any)?.jwt || localStorage.getItem('jwt');
            if (jwt) {
                const res = await axios.patch('http://localhost:5454/api/scientists', payload, {
                    headers: { Authorization: `${jwt}` }
                });
                const updated = res.data;
                const updatedUser: User = { email: updated.email || profile.email, role: user?.role || 'scientist', fullName: updated.fullname || profile.fullName } as any;
                login(updatedUser);
                localStorage.setItem(`user_${profile.email}`, JSON.stringify({ fullName: profile.fullName }));
                setIsEditing(false);
                return;
            }
        } catch (err) {
            console.warn('Failed to update scientist profile on backend, saving locally', err);
        }
        // fallback local save
        localStorage.setItem(`user_${profile.email}`, JSON.stringify({ fullName: profile.fullName }));
        setIsEditing(false);
    };

    // Logout functionality: clear session and redirect to homepage
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-xl text-red-700">You must be logged in to view your profile.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="mb-4 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/scientist-home')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold transition duration-300 transform hover:scale-105 shadow-lg hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold transition duration-300 transform hover:scale-105 shadow-lg hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Scientist Profile</h2>
                <p className="text-lg text-gray-600 mb-8">Manage your account details.</p>

                <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100">

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="sm:space-y-5">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Account Information
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                View and update your account details from registration.
                            </p>

                            {/* Account Information Fields */}
                            <DetailField
                                label="Full Name"
                                name="fullName"
                                value={profile.fullName}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                            <DetailField
                                label="Email Address"
                                name="email"
                                value={profile.email}
                                isEditing={false} // Email is read-only
                                onChange={handleChange}
                            />
                            <DetailField
                                label="Password"
                                name="password"
                                value={profile.password}
                                type="password"
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                            <DetailField
                                label="OTP"
                                name="otp"
                                value={profile.otp}
                                isEditing={false} // OTP is read-only
                                onChange={handleChange}
                            />

                        </div>

                        <div className="pt-5 border-t border-gray-200">
                            <div className="flex justify-end space-x-3">
                                {isEditing ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Edit Details
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ScientistProfile;
