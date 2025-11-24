import React, { useState, useEffect, useRef } from 'react';
import { LogIn, UserPlus, Briefcase, Loader2, AlertTriangle, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { sellerAuthService } from '../services/authService';

const SellerAuth = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();

    // State to toggle between 'login' and 'createAccount' views
    const [view, setView] = useState('login');

    // Form States
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpField, setShowOtpField] = useState(false);

    // NEW: State for OTP Resend Logic
    const [otpResendCount, setOtpResendCount] = useState(0);
    const [resendTimer, setResendTimer] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const role = 'seller'; // Role is fixed for this file

    // Validation: requires Email, and Password OR OTP to submit (but for login, OTP is required after sent)
    const isLoginValid = email && (showOtpField ? otp : password);
    const isCreateAccountValid = fullName && email && password && otp;
    const isFormValid = view === 'login' ? isLoginValid : isCreateAccountValid;

    // Effect to handle the resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            if (!timerRef.current) {
                timerRef.current = setInterval(() => {
                    setResendTimer(prev => {
                        if (prev <= 1) {
                            if (timerRef.current) {
                                clearInterval(timerRef.current);
                                timerRef.current = null;
                            }
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        // Cleanup function
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [resendTimer]);

    const startResendTimer = () => {
        // Clear any existing timer just in case
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setResendTimer(30); // Start the 30-second cooldown
    };

    const handleSendOtp = async (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent default only if event object exists
        if (e) e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address first.');
            return;
        }

        setIsLoading(true);
        console.log(`Sending OTP to ${email} for ${role}...`);

        try {
            // Use the auth service to send OTP
            await sellerAuthService.sendOtp({ email, role: 'ROLE_SELLER' });
            setShowOtpField(true);
            setOtpResendCount(c => c + 1); // Increment count
            startResendTimer(); // Start the 30-second timer

            // Dynamic message based on whether this is the first send or a resend
            const message = otpResendCount === 0
                ? `OTP sent to ${email}. Please enter it below.`
                : `New OTP resent to ${email}. Check your inbox for the latest code.`;
            setError(message);
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError('Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!isFormValid) {
            if (!email) {
                setError('Please enter your Email Address.');
                return;
            }
            if (view === 'login' && !showOtpField && !password) {
                setError('Please enter your Password.');
                return;
            }
            if (view === 'login' && showOtpField && !otp) {
                setError('Please enter the OTP to proceed.');
                return;
            }
            if (view === 'createAccount' && !password) {
                setError('Please enter your Password.');
                return;
            }
            if (!showOtpField) {
                 setError('Please click "Send OTP" to verify your email.');
                 return;
            }
            if (view === 'createAccount' && !otp) {
                setError('Please enter the OTP to proceed.');
                return;
            }
            if (view === 'createAccount' && !fullName) {
                setError('Please enter your Full Name.');
                return;
            }
            return;
        }

        setIsLoading(true);

        const actionType = view === 'login' ? 'Login' : 'Create Account';
        const payload = {
            role: role,
            email: email,
            password: password,
            otp: otp,
            ...(view === 'createAccount' && { fullName: fullName })
        };

        console.log(`Attempting ${actionType} with payload:`, payload);

        // Use actual backend authentication
        const performAuth = async () => {
            try {
                if (view === 'login') {
                    // For login, use the auth service
                    const response = await sellerAuthService.login({
                        email,
                        password: showOtpField ? undefined : password,
                        otp: showOtpField ? otp : undefined
                    });

                    console.log(`${actionType} Successful!`);
                    // Update auth context with response data (include jwt so API calls work)
                    login({
                        email,
                        role: 'seller',
                        password: password || '',
                        fullName: (response as any).fullName || (response as any).fullname || '',
                        jwt: response.jwt
                    } as any);
                    // Redirect seller to profile to complete details
                    navigate('/seller-profile');
                } else {
                    // For createAccount, use signup then verify
                    const signupResponse = await sellerAuthService.signup({
                        email,
                        fullName,
                        password,
                        otp
                    });

                    console.log(`${actionType} Successful!`);
                    // Update auth context with jwt
                    login({
                        email,
                        fullName,
                        role: 'seller',
                        password,
                        jwt: signupResponse.jwt
                    } as any);
                    // Redirect to profile for completing seller details
                    navigate('/seller-profile');
                }
            } catch (error: any) {
                console.error('Auth error:', error);
                setError(error.response?.data?.message || 'Authentication failed. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        performAuth();
    };

    // Determine the text and state for the primary "Send OTP" button
    const primaryButtonDisabled = isLoading || !email || otpResendCount > 0;
    const primaryButtonText = isLoading && otpResendCount === 0
        ? <Loader2 size={16} className="animate-spin" />
        : otpResendCount > 0 ? 'OTP Sent' : 'Send OTP';


    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 mr-2 md:hidden text-gray-700 hover:text-green-700">
                                <Menu size={24} />
                            </button>
                            {!user ? (
                                <button onClick={() => navigate('/')} className="flex items-center text-4xl font-extrabold text-green-700 tracking-tight hover:text-green-800">
                                    <img src="/PestoFarm-logo.png" alt="PestoFarm Logo" className="h-10 mr-2" />
                                    PestoFarm
                                </button>
                            ) : (
                                <span className="flex items-center text-4xl font-extrabold text-green-700 tracking-tight">
                                    <img src="/PestoFarm-logo.png" alt="PestoFarm Logo" className="h-10 mr-2" />
                                    PestoFarm
                                </span>
                            )}
                        </div>




                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <nav className={`fixed inset-0 bg-white z-20 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
                <div className="p-4 border-b flex justify-between items-center h-16">
                    <span className="text-xl font-bold text-green-700">PestoFarm Menu</span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-700">
                        &times;
                    </button>
                </div>
                <div className="flex flex-col p-4 space-y-2">
                    {['About'].map(label => (
                        <button key={label} className="text-gray-700 hover:text-green-700 font-medium py-2 border-b">
                            {label}
                        </button>
                    ))}
                </div>
            </nav>


            {/* Main Auth Content */}
            <main className="flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-10 border border-gray-200">

                    <div className="flex flex-col items-center mb-8">
                        {view === 'login' ? (
                            <LogIn size={40} className="text-green-600 mb-3" />
                        ) : (
                            <UserPlus size={40} className="text-green-600 mb-3" />
                        )}
                        <h2 className="text-3xl font-bold text-gray-900 text-center">
                            {view === 'login' ? 'Seller Sign In' : 'Seller Account Registration'}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            Access the PestoFarm Seller Dashboard.
                        </p>
                    </div>

                    {/* View Switcher Toggle */}
                    <div className="flex space-x-3 mb-6 p-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => {
                                setView('login');
                                setError('');
                                setShowOtpField(false);
                                setOtp('');
                                setOtpResendCount(0);
                                setResendTimer(0);
                                // FIX: Clear form fields when switching views
                                setFullName('');
                                setEmail('');
                                setPassword('');
                            }}
                            className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                                view === 'login' ? 'bg-green-700 text-white shadow-md' : 'text-gray-700 hover:bg-white'
                            }`}
                        >
                            <LogIn size={18} className="mr-2" />
                            Seller Login
                        </button>
                        <button
                            onClick={() => {
                                setView('createAccount');
                                setError('');
                                setShowOtpField(false);
                                setOtp('');
                                setOtpResendCount(0);
                                setResendTimer(0);
                                // FIX: Clear form fields when switching views
                                setFullName('');
                                setEmail('');
                                setPassword('');
                            }}
                            className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                                view === 'createAccount' ? 'bg-green-700 text-white shadow-md' : 'text-gray-700 hover:bg-white'
                            }`}
                        >
                            <Briefcase size={18} className="mr-2" />
                            Seller Register
                        </button>
                    </div>

                    <form onSubmit={handleAction} className="space-y-6">
                        {/* Error/Success Message */}
                        {error && (
                            <div className={`flex items-center p-3 text-sm rounded-lg ${error.includes('OTP sent') || error.includes('New OTP resent') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Full Name Input (Only for Create Account) */}
                        {view === 'createAccount' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Your full legal name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500 transition"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        )}

                        {/* Email Input with Send OTP Button */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="e.g., yourname@domain.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    className="w-full p-3 pr-28 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500 transition"
                                    // Only disable if loading or OTP has already been sent (preventing editing email after verification starts)
                                    disabled={isLoading || otpResendCount > 0}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={primaryButtonDisabled}
                                    className={`absolute right-1 top-1 h-10 px-3 text-white text-xs font-semibold rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center ${
                                        otpResendCount > 0 ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    {primaryButtonText}
                                </button>
                            </div>
                        </div>

                        {/* Password Input Field - Hidden after OTP is sent for login view to enforce OTP-only verification, always shown for create account */}
                        {(view === 'createAccount' || !showOtpField) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your secret password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500 transition"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        )}

                        {/* OTP Input (Conditionally Rendered) */}
                        {showOtpField && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="otp">
                                        OTP (6 Digits) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="otp"
                                        type="text"
                                        maxLength={6}
                                        placeholder="Enter your verification code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500 transition"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>

                                {/* Resend OTP Button - Appears after the first OTP is sent */}
                                {otpResendCount >= 1 && (
                                    <div className="text-sm text-right pt-1">
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={isLoading || resendTimer > 0}
                                            className={`font-semibold transition-colors flex items-center justify-end w-full ${
                                                resendTimer > 0
                                                    ? 'text-gray-500 cursor-not-allowed'
                                                    : 'text-green-600 hover:text-green-800'
                                            }`}
                                        >
                                            {isLoading && resendTimer === 0 ? (
                                                <span className="flex items-center justify-end">
                                                    <Loader2 size={16} className="animate-spin mr-1" />
                                                    Resending...
                                                </span>
                                            ) : resendTimer > 0 ? (
                                                `Resend OTP in ${resendTimer}s`
                                            ) : (
                                                'Resend OTP'
                                            )}
                                        </button>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {`You have requested OTP ${otpResendCount} time${otpResendCount > 1 ? 's' : ''}.`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* Action Button */}
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center p-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                            disabled={isLoading || (view === 'login' ? !isLoginValid : !showOtpField || !isCreateAccountValid)}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {view === 'login' ? <LogIn size={20} className="mr-2" /> : <UserPlus size={20} className="mr-2" />}
                                    {view === 'login' ? 'Login to Seller Portal' : 'Create Seller Account'}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default SellerAuth;
