import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { User, Bell, Zap, Menu, X, LayoutDashboard, Compass, MessageSquare, PlusCircle, LogOut } from 'lucide-react';

import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CreateRequest from './pages/CreateRequest';
import BrowseRequests from './pages/BrowseRequests';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="min-h-screen bg-[#09071a] flex justify-center items-center">
      <div className="w-10 h-10 border-2 border-[rgba(109,68,255,0.3)] border-t-[#6d44ff] rounded-full animate-spin" />
    </div>
  );
  if (!token) return <Navigate to="/auth" />;
  return children;
};

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/browse', label: 'Explore', icon: <Compass className="w-4 h-4" /> },
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/chat', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <>
      <nav style={{
        background: 'rgba(9,7,26,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(109,68,255,0.12)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-[#6d44ff] rounded-lg flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(109,68,255,0.6)] transition-all">
              <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm md:text-base tracking-tight">WorkTrade</span>
          </Link>

          {/* Desktop Nav Links */}
          {token && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? 'text-white border-b-2 border-[#6d44ff]'
                      : 'text-[rgba(200,190,255,0.5)] hover:text-[rgba(200,190,255,0.9)] hover:bg-[rgba(109,68,255,0.08)]'
                  }`}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {token ? (
              <>
                {/* Desktop only */}
                <Link to="/create-request"
                  className="hidden sm:flex px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-semibold text-white transition-all"
                  style={{background: '#6d44ff', boxShadow: '0 2px 12px rgba(109,68,255,0.45)'}}>
                  Post Request
                </Link>
                <Link to="/profile"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_0_12px_rgba(109,68,255,0.4)]">
                  <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </Link>
                {/* Hamburger — mobile only */}
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden w-8 h-8 rounded-lg bg-[rgba(109,68,255,0.1)] border border-[rgba(109,68,255,0.2)] flex items-center justify-center text-[rgba(200,190,255,0.7)]">
                  {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
                {/* Desktop logout */}
                <button onClick={logout}
                  className="hidden md:block ml-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[rgba(200,190,255,0.4)] hover:text-white bg-[rgba(109,68,255,0.06)] border border-[rgba(109,68,255,0.12)] transition-all">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{background: '#6d44ff', boxShadow: '0 2px 12px rgba(109,68,255,0.45)'}}>
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Drawer */}
        {menuOpen && token && (
          <div className="md:hidden border-t border-[rgba(109,68,255,0.12)] px-4 py-4 space-y-1"
            style={{background: 'rgba(9,7,26,0.98)'}}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? 'text-white bg-[rgba(109,68,255,0.15)] border border-[rgba(109,68,255,0.25)]'
                    : 'text-[rgba(200,190,255,0.6)] hover:bg-[rgba(109,68,255,0.08)]'
                }`}>
                {link.icon}{link.label}
              </Link>
            ))}
            <Link to="/create-request" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white"
              style={{background: '#6d44ff'}}>
              <PlusCircle className="w-4 h-4" />Post Request
            </Link>
            <button onClick={() => { logout(); setMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[rgba(200,190,255,0.5)] hover:bg-[rgba(109,68,255,0.08)] transition-all">
              <LogOut className="w-4 h-4" />Logout
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Tab Bar */}
      {token && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
          style={{background: 'rgba(9,7,26,0.97)', borderTop: '1px solid rgba(109,68,255,0.12)', backdropFilter: 'blur(20px)'}}>
          {[
            { to: '/browse', icon: <Compass className="w-5 h-5" />, label: 'Explore' },
            { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Home' },
            { to: '/create-request', icon: <PlusCircle className="w-5 h-5" />, label: 'Post', primary: true },
            { to: '/chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Chat' },
            { to: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                item.primary
                  ? 'text-white -mt-4 rounded-2xl shadow-[0_0_20px_rgba(109,68,255,0.5)]'
                  : location.pathname === item.to
                    ? 'text-[#a78bfa]'
                    : 'text-[rgba(200,190,255,0.35)]'
              }`}
              style={item.primary ? {background: '#6d44ff', padding: '10px 14px'} : {}}>
              {item.icon}
              <span className="text-[9px] font-semibold">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

function AppContent() {
  const { token } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-[#09071a] text-[#e2deff] font-['Outfit']">
      <Navbar />
      {/* pb-16 on mobile to avoid bottom nav overlap */}
      <div className="md:pb-0 pb-16">
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={token ? <Navigate to="/dashboard" /> : <Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-request" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
          <Route path="/browse" element={<ProtectedRoute><BrowseRequests /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
