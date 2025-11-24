import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, User } from '../AuthContext';
import axios from 'axios';

// Define the shape of the profile state
interface ProfileState {
    fullName: string;
    contactNumber: string;
    brandName: string;
    shopAddress: string;
    email: string;
    gstNumber: string;
    accountHolderName: string;
    accountNo: string;
    bankName: string;
    ifscCode: string;

    
}

// --- DetailField Component (Now defined OUTSIDE SellerProfile for stability) ---
interface DetailFieldProps {
    label: string;
    name: keyof ProfileState;
    value: string | number;
    isEditing: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DetailField: React.FC<DetailFieldProps> = ({ label, name, value, isEditing, onChange }) => (
    <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
        <label htmlFor={name} className="block text-sm font-medium text-gray-500 sm:mt-px sm:pt-2">
            {label}
        </label>
        <div className="mt-1 sm:mt-0 sm:col-span-2">
            {isEditing ? (
                <input
                    type={name.includes('contactNumber') ? 'tel' : 'text'}
                    name={name}
                    id={name}
                    // CRITICAL: Ensure value is bound to state
                    value={value}
                    onChange={onChange}
                    className="max-w-lg block w-full shadow-sm focus:ring-green-500 focus:border-green-500 sm:max-w-xs sm:text-sm border-2 border-gray-800 rounded-md p-2 bg-white"
                    required
                />
            ) : (
                <p className="block w-full text-gray-900 sm:text-sm sm:max-w-lg mt-2">{value}</p>
            )}
        </div>
    </div>
);

// --- Seller Profile Component ---
const SellerProfile = () => {
    const navigate = useNavigate();
    const { user, login, logout } = useAuth();
    // State to hold the seller's profile data
    const [profile, setProfile] = useState<ProfileState>({
        fullName: '',
        contactNumber: '',
        brandName: '',
        shopAddress: '',
        email: user?.email || '',
        gstNumber: '',
        accountHolderName: '',
        accountNo: '',
        bankName: '',
        ifscCode: '',
        
    });
    const [isEditing, setIsEditing] = useState(false);

    // Update profile state when user changes - prefer backend, fallback to localStorage
    useEffect(() => {
        const loadSellerProfile = async () => {
            if (!user) return;
            try {
                const jwt = (user as any)?.jwt || localStorage.getItem('jwt');
                if (jwt) {
                    const res = await axios.get('http://localhost:5454/api/sellers/profile', {
                        headers: { Authorization: `${jwt}` }
                    });
                    const s = res.data;
                    setProfile({
                        fullName: s.fullname || s.fullName || user.fullName || '',
                        contactNumber: s.contactNumber || s.mobile || '',
                        brandName: s.brandName || '',
                        shopAddress: s.shopAddress || s.address || '',
                        email: s.email || user.email || '',
                        gstNumber: s.gstNumber || '',
                        accountHolderName: s.accountHolderName || '',
                        accountNo: s.accountNo || '',
                        bankName: s.bankName || '',
                        ifscCode: s.ifscCode || '',
                    });
                    // also keep a local backup
                    localStorage.setItem(`profile_${user.email}`, JSON.stringify({ ...s }));
                    return;
                }
            } catch (err) {
                console.warn('Could not fetch seller profile from backend, falling back to localStorage', err);
            }

            if (user?.email) {
                const storedProfile = localStorage.getItem(`profile_${user.email}`);
                if (storedProfile) {
                    const parsedProfile = JSON.parse(storedProfile);
                    setProfile({
                        fullName: parsedProfile.fullName || '',
                        contactNumber: parsedProfile.contactNumber || '',
                        brandName: parsedProfile.brandName || '',
                        shopAddress: parsedProfile.shopAddress || '',
                        email: user.email,
                        gstNumber: parsedProfile.gstNumber || '',
                        accountHolderName: parsedProfile.accountHolderName || '',
                        accountNo: parsedProfile.accountNo || '',
                        bankName: parsedProfile.bankName || '',
                        ifscCode: parsedProfile.ifscCode || '',
                    });
                } else {
                    setProfile(prev => ({ ...prev, fullName: user.fullName || '', email: user?.email || '' }));
                }
            }
        };

        loadSellerProfile();
    }, [user]);

    // Handler to update state for any input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // IMPROVEMENT: Use functional update for guaranteed latest state integrity
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
            contactNumber: profile.contactNumber,
            brandName: profile.brandName,
            shopAddress: profile.shopAddress,
            email: profile.email,
            gstNumber: profile.gstNumber,
            accountHolderName: profile.accountHolderName,
            accountNo: profile.accountNo,
            bankName: profile.bankName,
            ifscCode: profile.ifscCode,
        };

        try {
            const jwt = (user as any)?.jwt || localStorage.getItem('jwt');
                if (jwt) {
                const res = await axios.patch('http://localhost:5454/api/sellers', payload, {
                    headers: { Authorization: `${jwt}` }
                });
                const updated = res.data;
                // Update auth context with basic fields
                const updatedUser: User = {
                    email: updated.email || profile.email,
                    role: user?.role || 'seller',
                    fullName: updated.fullname || profile.fullName,
                    contactNumber: updated.contactNumber || profile.contactNumber,
                } as any;
                login(updatedUser);
                // Save local backup
                localStorage.setItem(`profile_${profile.email}`, JSON.stringify(payload));
                setIsEditing(false);
                return;
            }
        } catch (err) {
            console.warn('Failed to save seller profile to backend, saving locally instead', err);
        }

        // Fallback: persist locally
        localStorage.setItem(`profile_${profile.email}`, JSON.stringify(payload));
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
                        onClick={() => navigate('/seller-home')}
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
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Seller Profile</h2>
                <p className="text-lg text-gray-600 mb-8">Manage your personal, business and banking details.</p>

                <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100">

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="sm:space-y-5">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Basic Information
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                View and update your personal details.
                            </p>

                            {/* Basic Information Fields, explicitly passing props */}
                            <DetailField
                                label="Full Name"
                                name="fullName"
                                value={profile.fullName}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                            <DetailField
                                label="Contact Number"
                                name="contactNumber"
                                value={profile.contactNumber}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                            <DetailField
                                label="Email Address"
                                name="email"
                                value={profile.email}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />

                            <h3 className="text-lg leading-6 font-medium text-gray-900 pt-8">
                                Business Details
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                View and Update your business information.
                            </p>

                            {/* Business Details Fields, explicitly passing props */}
                            <DetailField
                                label="Brand Name"
                                name="brandName"
                                value={profile.brandName}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                            <DetailField
                                label="Shop Address"
                                name="shopAddress"
                                value={profile.shopAddress}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                            <DetailField
                                label="GST Number"
                                name="gstNumber"
                                value={profile.gstNumber}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                            
                            <h3 className="text-lg leading-6 font-medium text-gray-900 pt-8">
                                Bank Details
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                View and Update your bank account information.
                            </p>
                            {/* Bank Details Fields, explicitly passing props */}
                            <DetailField
                                label="Account Holder Name"
                                name="accountHolderName"
                                value={profile.accountHolderName}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                            <DetailField
                                label="Account Number"
                                name="accountNo"
                                value={profile.accountNo}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                            <DetailField
                                label="Bank Name"
                                name="bankName"
                                value={profile.bankName}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                            <DetailField
                                label="IFSC Code"
                                name="ifscCode"
                                value={profile.ifscCode}
                                isEditing={isEditing}
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

export default SellerProfile;
