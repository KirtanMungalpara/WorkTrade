import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, Briefcase, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', skillsOffered: '', servicesNeeded: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { ...formData, skillsOffered: formData.skillsOffered.split(',').map(s => s.trim()), servicesNeeded: formData.servicesNeeded.split(',').map(s => s.trim()) };
      const res = await api.post(endpoint, payload);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#0d0b20] border border-[rgba(109,68,255,0.2)] text-[#f0ecff] rounded-xl py-3 px-12 focus:outline-none focus:border-[#6d44ff] focus:shadow-[0_0_0_3px_rgba(109,68,255,0.15)] transition-all placeholder:text-[rgba(160,148,220,0.35)] font-['Outfit'] text-sm";

  return (
    <div className="min-h-screen bg-[#09071a] flex" style={{height:'100vh'}}>
      
      {/* === LEFT PANEL — Form === */}
      <div className="w-full lg:w-[42%] flex flex-col justify-between p-8 lg:p-12 relative z-10"
        style={{background: 'linear-gradient(160deg, #100e25 0%, #0c0a1e 100%)', borderRight: '1px solid rgba(109,68,255,0.12)'}}>
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6d44ff] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(109,68,255,0.5)]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">WORKTRADE</span>
        </div>

        {/* Form Body */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col justify-center max-w-sm"
        >
          <AnimatePresence mode="wait">
            <motion.div key={isLogin ? 'login' : 'signup'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-5xl font-black text-white mb-3 leading-tight">
                {isLogin ? <>Welcome<br/>Back</> : <>Join the<br/>Network</>}
              </h1>
              <p className="text-[rgba(200,190,255,0.5)] text-sm mb-8">
                {isLogin ? 'The next generation of high-value skill exchange awaits.' : 'Create your account and start trading skills.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-5 text-sm text-center">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-[rgba(200,190,255,0.6)] uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-[rgba(109,68,255,0.5)]" />
                  <input type="text" name="name" placeholder="Your Name" required value={formData.name} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[rgba(200,190,255,0.6)] uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[rgba(109,68,255,0.5)]" />
                <input type="email" name="email" placeholder="name@company.com" required value={formData.email} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-[rgba(200,190,255,0.6)] uppercase tracking-wider">Password</label>
                {isLogin && <button type="button" className="text-xs text-[#6d44ff] hover:text-[#a78bfa] transition-colors">Forgot password?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-[rgba(109,68,255,0.5)]" />
                <input type="password" name="password" placeholder="••••••••" required value={formData.password} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[rgba(200,190,255,0.6)] uppercase tracking-wider mb-2">Skills Offered</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-[rgba(109,68,255,0.5)]" />
                    <input type="text" name="skillsOffered" placeholder="e.g. Web Dev, Design" required value={formData.skillsOffered} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[rgba(200,190,255,0.6)] uppercase tracking-wider mb-2">Services Needed</label>
                  <div className="relative">
                    <Zap className="absolute left-4 top-3.5 w-4 h-4 text-[rgba(109,68,255,0.5)]" />
                    <input type="text" name="servicesNeeded" placeholder="e.g. Plumbing, Marketing" required value={formData.servicesNeeded} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </>
            )}

            {isLogin && (
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded accent-[#6d44ff]" />
                <label htmlFor="remember" className="text-xs text-[rgba(200,190,255,0.5)]">Keep me signed in for 30 days</label>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-white transition-all mt-2"
              style={{background: '#6d44ff', boxShadow: '0 4px 20px rgba(109,68,255,0.5)'}}>
              {loading ? 'Processing...' : <>{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[rgba(109,68,255,0.15)]" />
                <span className="text-xs text-[rgba(200,190,255,0.3)] font-medium tracking-widest">OR CONTINUE WITH</span>
                <div className="flex-1 h-px bg-[rgba(109,68,255,0.15)]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Google', 'GitHub'].map(p => (
                  <button key={p} className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-[rgba(200,190,255,0.7)] transition-all"
                    style={{background: '#0d0b20', border: '1px solid rgba(109,68,255,0.2)'}}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div>
          <p className="text-sm text-[rgba(200,190,255,0.4)]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#a78bfa] font-semibold hover:text-white transition-colors">
              {isLogin ? 'Join the Network' : 'Sign In'}
            </button>
          </p>
          <p className="text-xs text-[rgba(200,190,255,0.2)] mt-4">© 2024 WorkTrade. High-Value Skill Exchange.</p>
        </div>
      </div>

      {/* === RIGHT PANEL — Hero === */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden"
        style={{background: 'linear-gradient(160deg, #0c0a1e 0%, #09071a 60%, #0d0820 100%)'}}>
        
        {/* Glow blobs */}
        <div className="absolute top-[10%] left-[20%] w-80 h-80 rounded-full animate-blob pointer-events-none"
          style={{background: 'radial-gradient(circle, rgba(109,68,255,0.25) 0%, transparent 70%)', filter: 'blur(60px)'}} />
        <div className="absolute bottom-[20%] right-[10%] w-60 h-60 rounded-full animate-blob animation-delay-2000 pointer-events-none"
          style={{background: 'radial-gradient(circle, rgba(99,50,220,0.2) 0%, transparent 70%)', filter: 'blur(60px)'}} />

        {/* Hero Image */}
        <div className="flex-1 flex items-center justify-center p-12">
          <img 
            src="/hero-illustration.png" 
            alt="WorkTrade — Trade Expertise"
            className="max-w-lg w-full object-contain animate-float drop-shadow-[0_0_40px_rgba(109,68,255,0.3)]"
          />
        </div>

        {/* Hero Text */}
        <div className="p-12 pt-0 text-center">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Trade Expertise, Not Just Time.
          </h2>
          <p className="text-[rgba(200,190,255,0.5)] text-sm max-w-md mx-auto leading-relaxed">
            WorkTrade is the premium ecosystem where top-tier developers, designers, and artisans exchange high-value skills through secure, verified protocols.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex -space-x-2">
              {['#7c3aed','#4f46e5','#7c3aed'].map((c,i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#09071a] flex items-center justify-center text-xs font-bold text-white"
                  style={{background: c, zIndex: 3-i}}>
                  {['A','B','C'][i]}
                </div>
              ))}
            </div>
            <span className="text-sm text-[rgba(200,190,255,0.5)]">+2.4k experts active now</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
