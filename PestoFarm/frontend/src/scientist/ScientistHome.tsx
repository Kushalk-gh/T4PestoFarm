import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../AuthContext';
import Footer from '../Footer';
import {
User,
MessageSquare,
LayoutDashboard,
LogOut,
CheckCircle,
Settings,
ArrowLeft,
Briefcase,
} from "lucide-react";


// --- INTERFACE DEFINITIONS (Scientist Specific) ---
interface Chat {
id: string;
customerName: string;
lastMessage: string;
lastMessageAt: string;
hasNewMessageForScientist?: boolean;
status: "active" | "completed";
messages?: { text: string; sender: string; timestamp: string }[];
}

interface Profile {
fullName: string;
email: string;
specialization: string;
experience: string;
description: string;
}

type View = "dashboard" | "live-chats" | "profile";

// --- COMPONENT PROP INTERFACES ---
interface NavItemProps {
  label: string;
  view: View;
  activeView: View;
  setActiveView: (view: View) => void;
  icon: React.ComponentType<any>;
}

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  isText?: boolean;
}

interface QuickActionButtonProps {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  color: string;
}



interface DashboardViewProps {
  profile: Profile;
  chats: Chat[];
  setActiveView: (view: View) => void;
}

interface LiveChatsViewProps {
  profile: Profile;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setActiveView: (view: View) => void;
}

interface ProfileSetupViewProps {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  setActiveView: (view: View) => void;
}

// --- MOCK DATA ---
const DEFAULT_PROFILE: Profile = {
fullName: "Dr. Jane Do",
email: "jane.doe@example.com",
specialization: "Agricultural Biotechnology",
experience: "7 years",
description: "Specialist in sustainable agriculture, crop protection, and plant innovation.",
};

const DEFAULT_CHATS: Chat[] = [
{
id: "1",
customerName: "Ravi Kumar",
lastMessage: "Thanks for your advice!",
lastMessageAt: "10:45 AM",
hasNewMessageForScientist: false,
status: "completed",
messages: [
{ text: "Hi, Doctor!", sender: "Ravi Kumar", timestamp: "10:00 AM" },
{ text: "Please share your crop details.", sender: DEFAULT_PROFILE.fullName, timestamp: "10:10 AM" },
{ text: "Thanks for your advice!", sender: "Ravi Kumar", timestamp: "10:45 AM" },
],
},
{
id: "2",
customerName: "Priya Patel",
lastMessage: "Can I use organic fertilizer for paddy?",
lastMessageAt: "11:30 AM",
hasNewMessageForScientist: true,
status: "active",
messages: [
{ text: "Hi, Doctor! Can I use organic fertilizer for paddy?", sender: "Priya Patel", timestamp: "11:30 AM" },
],
},
];

// --- HELPER COMPONENTS (Adapted from previous App.jsx but styled to match SellerHome) ---

const NavItem: React.FC<NavItemProps> = ({ label, view, activeView, setActiveView, icon: Icon }) => {
const isActive = activeView === view;
return (
<a
href="#"
onClick={() => setActiveView(view)}
className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition duration-150 ease-in-out ${
isActive
? 'border-b-2 border-green-500 text-green-700 font-bold'
: 'text-gray-500 hover:text-green-700 hover:border-gray-300'
}`}
>
<Icon className="w-5 h-5 mr-1" />
{label}
</a>
);
};

// Card Helper (used in DashboardView)
const Card: React.FC<CardProps> = ({ title, value, icon, color, onClick, isText = false }) => (
<motion.div
whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
className={`p-6 bg-white rounded-xl shadow transition border-l-4 border-${color}-500 cursor-pointer`}
onClick={onClick}
>
<div className="flex justify-between items-start">
<div className={`p-2 rounded-full bg-${color}-100`}>{icon}</div>
<p className="text-xs font-semibold text-gray-400 uppercase">{title}</p>
</div>
<div className="mt-4">
{isText ? (
<p className={`text-xl font-extrabold text-${color}-700 truncate`}>{value}</p>
) : (
<p className={`text-4xl font-extrabold text-${color}-700`}>{value}</p>
)}
</div>
</motion.div>
);

// Quick Action Button Helper (used in DashboardView)
const QuickActionButton: React.FC<QuickActionButtonProps> = ({ label, onClick, icon, color }) => (
<button
onClick={onClick}
className={`flex items-center px-4 py-2 ${color} text-white font-semibold rounded-lg transition shadow-md`}
>
{icon} {label}
</button>
);




// --- VIEW COMPONENTS (Scientist Specific Content) ---

const DashboardView: React.FC<DashboardViewProps> = ({ profile, chats, setActiveView }) => {
const activeChatsCount = chats.filter(c => c.status === 'active').length;
const completedChatsCount = chats.filter(c => c.status === 'completed').length;

return (
<motion.div
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
className="p-8 bg-gray-50 rounded-xl shadow-inner min-h-full"
>
<h1 className="text-3xl font-semibold text-green-700 mb-4">
Scientist Dashboard
</h1>

<p className="text-gray-600 mb-8">
Welcome, **{profile.fullName}**. Manage your consultations and earnings here.
</p>

{/* Dashboard Summary Cards */}
<div className="grid md:grid-cols-4 gap-6 mb-8">
<Card
title="Active Consultations"
value={activeChatsCount}
icon={<MessageSquare className="text-blue-600" />}
color="blue"
onClick={() => setActiveView('live-chats')}
/>
<Card
title="Completed Consultations"
value={completedChatsCount}
icon={<CheckCircle className="text-green-600" />}
color="green"
onClick={() => setActiveView('live-chats')}
/>

<Card
title="Your Specialization"
value={profile.specialization}
icon={<Briefcase className="text-purple-600" />}
color="purple"
isText={true}
onClick={() => setActiveView('profile')}
/>
</div>

{/* Quick Access Section */}
<div className="p-6 bg-green-700 text-white rounded-xl shadow-lg mt-10">
<h2 className="text-2xl font-semibold mb-3">Quick Actions</h2>
<p className="mb-4 opacity-90">Manage your profile or jump into live chats.</p>
<div className="flex flex-wrap gap-4">
<QuickActionButton
label="View Live Chats"
onClick={() => setActiveView('live-chats')}
icon={<MessageSquare className="mr-2" />}
color="bg-green-500 hover:bg-green-600"
/>
<QuickActionButton
label="Edit Profile"
onClick={() => setActiveView('profile')}
icon={<Settings className="mr-2" />}
color="bg-green-500 hover:bg-green-600"
/>
</div>
</div>
</motion.div>
);
};

const LiveChatsView: React.FC<LiveChatsViewProps> = ({ profile, chats, setChats, setActiveView }) => {
const [activeChat, setActiveChat] = useState<Chat | null>(null);
const [messageText, setMessageText] = useState("");

useEffect(() => {
if (activeChat) {
const updatedActiveChat = chats.find((c: Chat) => c.id === activeChat.id);
setActiveChat(updatedActiveChat || null);
}
}, [chats]); // eslint-disable-line react-hooks/exhaustive-deps

const handleSendMessage = useCallback(() => {
if (!activeChat || !messageText.trim()) return;
const newMessage = {
text: messageText,
sender: profile.fullName,
timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

setChats((prev) =>
prev.map((chat) =>
chat.id === activeChat.id
? {
...chat,
lastMessage: newMessage.text,
lastMessageAt: newMessage.timestamp,
hasNewMessageForScientist: false,
messages: [...(chat.messages || []), newMessage],
}
: chat
)
);
setMessageText("");
}, [activeChat, messageText, profile.fullName, setChats]);

const handleEndConsultation = useCallback((chatId: string) => {
console.log(`Consultation ${chatId} ended.`);
setChats((prev) =>
prev.map((chat) =>
chat.id === chatId ? { ...chat, status: "completed" } : chat
)
);
setActiveChat(null);
}, [setChats]);

return (
<motion.div
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
className="p-4 bg-gray-50 min-h-full rounded-xl shadow-inner"
>
<h1 className="text-2xl font-semibold text-green-700 mb-6 flex items-center">
<MessageSquare className="mr-3" size={28} /> Live Consultations
</h1>
<div className="grid md:grid-cols-3 gap-6">
{/* Chat List */}
<div className="md:col-span-1 bg-white rounded-xl shadow-lg p-5">
<h2 className="text-lg font-semibold text-green-700 mb-4 border-b pb-2">
Consultation List
</h2>
<div className="space-y-3 max-h-[70vh] overflow-y-auto">
{chats
.sort((a, b) => (b.status === 'active' ? 1 : -1) - (a.status === 'active' ? 1 : -1))
.map((chat) => (
<motion.div
key={chat.id}
whileHover={{ scale: 1.01 }}
onClick={() => setActiveChat(chat)}
className={`p-3 rounded-lg cursor-pointer transition ${
activeChat?.id === chat.id ? "bg-green-200 border-l-4 border-green-700 shadow-md" :
chat.hasNewMessageForScientist
? "bg-green-100 border-l-4 border-green-600 font-semibold hover:bg-green-200"
: "bg-gray-50 hover:bg-gray-100"
}`}
>
<p className="font-semibold flex justify-between items-center">
{chat.customerName}
<span className={`text-xs font-normal px-2 py-0.5 rounded-full ${
chat.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
}`}>
{chat.status.toUpperCase()}
</span>
</p>
<p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
<p className="text-xs text-gray-500 mt-1 text-right">{chat.lastMessageAt}</p>
</motion.div>
))}
</div>
</div>

{/* Active Chat View */}
<div className="md:col-span-2">
{activeChat ? (
<div className="bg-white rounded-xl shadow-lg p-5 flex flex-col h-full min-h-[70vh]">
<div className="flex justify-between items-center border-b pb-3 mb-3">
<h2 className="text-xl font-semibold text-green-700">
Chat with {activeChat.customerName}
</h2>
{activeChat.status === 'active' && (
<button
onClick={() => handleEndConsultation(activeChat.id)}
className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
>
End Consultation
</button>
)}
</div>

<div className="flex-1 overflow-y-auto border rounded-lg bg-gray-50 p-3 mb-4 space-y-3">
{activeChat.messages?.map((msg, i) => (
<div
key={i}
className={`flex ${
msg.sender === profile.fullName
? "justify-end"
: "justify-start"
}`}
>
<div
className={`max-w-[80%] px-3 py-2 rounded-xl shadow-sm text-sm ${
msg.sender === profile.fullName
? "bg-green-100 text-green-800 rounded-br-none"
: "bg-white text-gray-800 rounded-tl-none border"
}`}
>
<p>{msg.text}</p>
<div className={`text-xs mt-1 ${
msg.sender === profile.fullName ? 'text-green-600 text-right' : 'text-gray-500 text-left'
}`}>
{msg.timestamp}
</div>
</div>
</div>
))}
</div>

{activeChat.status === 'active' ? (
<div className="flex gap-2">
<input
type="text"
value={messageText}
onChange={(e) => setMessageText(e.target.value)}
onKeyDown={(e) => {
if (e.key === 'Enter') handleSendMessage();
}}
placeholder="Type message..."
className="flex-1 border rounded-lg p-3 focus:ring-green-500 focus:border-green-500"
/>
<button
onClick={handleSendMessage}
className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:bg-gray-400"
disabled={!messageText.trim()}
>
Send
</button>
</div>
) : (
<div className="text-center p-4 bg-gray-100 rounded-lg text-gray-500 font-semibold">
Consultation completed. This chat is read-only.
</div>
)}
</div>
) : (
<div className="bg-white rounded-xl shadow-lg flex items-center justify-center text-xl text-gray-500 p-8 min-h-[70vh]">
<MessageSquare className="mr-2" size={36} /> Select a consultation to view the chat history.
</div>
)}
</div>
</div>
</motion.div>
);
};


const ProfileSetupView: React.FC<ProfileSetupViewProps> = ({ profile, setProfile, setActiveView }) => {
const handleSave = () => {
localStorage.setItem("scientistProfile", JSON.stringify(profile));
console.log("Profile saved:", profile);
setActiveView('dashboard');
};

return (
<motion.div
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
className="p-10 bg-white rounded-xl shadow-2xl m-4 max-w-4xl mx-auto border-t-4 border-green-500"
>
<h2 className="text-3xl font-bold text-green-700 mb-6 flex items-center">
<Settings className="mr-3" size={32} /> Edit Professional Profile
</h2>

<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-gray-700">Full Name</label>
<input
type="text"
value={profile.fullName}
onChange={(e) => setProfile(p => ({ ...p, fullName: e.target.value }))}
className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700">Specialization</label>
<input
type="text"
value={profile.specialization}
onChange={(e) => setProfile(p => ({ ...p, specialization: e.target.value }))}
className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700">Bio / Description</label>
<textarea
value={profile.description}
onChange={(e) => setProfile(p => ({ ...p, description: e.target.value }))}
rows={3}
className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 resize-none"
></textarea>
</div>
</div>

<div className="flex justify-between mt-8">
<button
onClick={() => setActiveView('dashboard')}
className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
>
<ArrowLeft className="mr-2" size={18} /> Cancel
</button>
<button
onClick={handleSave}
className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-md"
>
Save Profile
</button>
</div>
</motion.div>
);
};


// --- MAIN APPLICATION COMPONENT (Structure mirrors SellerHome.tsx) ---
const App = () => {
// --- STATE AND HOOKS (Matching SellerHome structure) ---
const { user, logout, isLoading } = useAuth();
const navigate = useNavigate();
const [activeView, setActiveView] = useState<View>("dashboard");

const handleLogout = () => {
    logout();
    navigate('/');
};

// Use local storage for initial state (as commonly done in these examples)
const [profile, setProfile] = useState<Profile>(() => {
try {
const saved = localStorage.getItem("scientistProfile");
return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
} catch (e) {
console.error("Error loading profile from localStorage", e);
return DEFAULT_PROFILE;
}
});

const [chats, setChats] = useState<Chat[]>(() => {
try {
const saved = localStorage.getItem("scientistChats");
return saved ? JSON.parse(saved) : DEFAULT_CHATS;
} catch (e) {
console.error("Error loading chats from localStorage", e);
return DEFAULT_CHATS;
}
});

// Persistence Effect
useEffect(() => {
localStorage.setItem("scientistProfile", JSON.stringify(profile));
}, [profile]);

useEffect(() => {
localStorage.setItem("scientistChats", JSON.stringify(chats));
}, [chats]);

// --- RENDER LOGIC FUNCTIONS ---
const renderContent = () => {
// Only render content if user is logged in (mocked to always be true)
if (!user) {
return (
<div className="text-center p-20 text-gray-600">
Please log in to access the Scientist Dashboard.
</div>
);
}

switch (activeView) {
case 'dashboard':
return <DashboardView profile={profile} chats={chats} setActiveView={setActiveView} />;
case 'live-chats':
return <LiveChatsView profile={profile} chats={chats} setChats={setChats} setActiveView={setActiveView} />;
case 'profile':
return <ProfileSetupView profile={profile} setProfile={setProfile} setActiveView={setActiveView} />;
default:
return <DashboardView profile={profile} chats={chats} setActiveView={setActiveView} />;
}
};

if (isLoading) {
return (
<div className="flex justify-center items-center min-h-screen bg-green-50">
<h1 className="text-green-700 text-xl font-semibold animate-pulse">
Authenticating Scientist...
</h1>
</div>
);
}

return (
<div className="min-h-screen bg-gray-100 font-sans">
{/* Top Navigation Bar (Exactly matches SellerHome.tsx structure) */}
<nav className="bg-white shadow-lg sticky top-0 z-10">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between h-16">
{/* Logo/App Name */}
<div className="flex items-center">
<Link to="/scientist-home" onClick={() => setActiveView('dashboard')} className="text-2xl font-extrabold text-green-700 flex items-center">
<img
src="/PestoFarm-logo.png"
alt="PestoFarm Logo"
className="w-10 h-10 rounded-full border-2 border-green-600 mr-2 object-cover shadow-sm"
onError={(e) => {
e.currentTarget.onerror = null;
e.currentTarget.src = "https://placehold.co/40x40/2a5a2a/ffffff?text=PF";
}}
/>
PestoFarm
</Link>
</div>

{/* Desktop Navigation Links */}
<div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
{user && (
<>
<NavItem
label="Dashboard"
view="dashboard"
activeView={activeView}
setActiveView={setActiveView}
icon={LayoutDashboard}
/>
<NavItem
label="Live Chats"
view="live-chats"
activeView={activeView}
setActiveView={setActiveView}
icon={MessageSquare}
/>
<NavItem
label="Profile"
view="profile"
activeView={activeView}
setActiveView={setActiveView}
icon={Settings}
/>
</>
)}
</div>

{/* Profile/Logout Area */}
<div className="flex items-center space-x-4">
{user ? (
<>
<div className="text-sm font-medium text-gray-700 flex items-center hidden sm:flex">
<User className="w-5 h-5 mr-1 text-green-500" />
{profile.fullName}
</div>
<button
onClick={handleLogout}
className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition duration-150 ease-in-out flex items-center"
>
<LogOut className="w-4 h-4 mr-1" />
LOGOUT
</button>
</>
) : (
<Link to="/login" className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150 ease-in-out">
LOGIN
</Link>
)}
</div>
</div>
</div>
</nav>

{/* Banner Image below menu bar (Exactly matches SellerHome.tsx structure) */}
{activeView === 'dashboard' && (
<div className="max-w-7xl mx-auto rounded-3xl overflow-hidden mb-0 p-4 sm:p-6">
<img
src="/Seller front-page-image.png"
alt="Scientist Dashboard Banner"
className="w-full h-auto max-h-[1250px] object-cover rounded-2xl shadow-xl"
/>
</div>
)}

{/* Main Content Area Container (Exactly matches SellerHome.tsx structure) */}
<div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">

{/* Inner Content Area */}
<div className="mt-4">
{/* Back button for internal views (Exactly matches SellerHome.tsx structure) */}
{activeView !== 'dashboard' && (
<button
onClick={() => setActiveView('dashboard')}
className="mb-6 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150 ease-in-out flex items-center shadow-md"
>
<ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
</button>
)}

{/* Render the Active Content */}
{renderContent()}
</div>
</div>

{/* Footer only for Dashboard section */}
{activeView === 'dashboard' && <Footer />}
</div>
);
};


export default App;
