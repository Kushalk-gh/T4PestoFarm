import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { isAdminEmail } from '../../config/admins';
import AuthForm from '../components/AuthForm';

const Login = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [view, setView] = useState<'login' | 'createAccount'>('login');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleAuthSuccess = () => {
        // After successful authentication, redirect admin emails to admin home
        if (user && isAdminEmail(user.email)) {
            navigate('/admin-home');
            return;
        }
        navigate('/');
    };

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
                <AuthForm
                    view={view}
                    onViewChange={setView}
                    onSuccess={handleAuthSuccess}
                />
            </main>
        </div>
    );
};

export default Login;
