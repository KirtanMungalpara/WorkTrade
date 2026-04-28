import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Mic, Send, ShieldCheck, Zap, BadgeCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const CreateRequest = () => {
  const [formData, setFormData] = useState({ title: '', description: '', category: '', pointsOffered: '' });
  const [images, setImages] = useState([]);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    if (e.target.files) setImages(Array.from(e.target.files).slice(0, 5));
  };

  const toggleRecording = () => {
    alert("Voice recording requires browser MediaRecorder API integration.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('pointsOffered', formData.pointsOffered);
    images.forEach(img => data.append('images', img));
    if (voiceBlob) data.append('voice', voiceBlob, 'voice-note.webm');
    try {
      await api.post('/requests', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating request');
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-[#0d0b20] border border-[rgba(109,68,255,0.18)] text-[#f0ecff] rounded-xl px-4 py-3 focus:outline-none focus:border-[#6d44ff] focus:shadow-[0_0_0_3px_rgba(109,68,255,0.15)] transition-all placeholder:text-[rgba(160,148,220,0.3)] text-sm";
  const labelCls = "block text-xs font-bold text-[rgba(200,190,255,0.5)] uppercase tracking-widest mb-2";

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#09071a] flex">

      {/* === LEFT SIDEBAR === */}
      <div className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[rgba(109,68,255,0.12)] bg-[#0c0a1e] py-8 px-4">
        <div className="mb-8 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(109,68,255,0.4)]">
            <span className="text-white font-black text-sm">W</span>
          </div>
          <p className="text-white font-bold text-sm">WorkTrade</p>
          <p className="text-[rgba(160,148,220,0.4)] text-xs">Skill Exchange</p>
        </div>

        <nav className="space-y-1 flex-1">
          {[
            { label: 'Dashboard', icon: '📊', to: '/dashboard' },
            { label: 'Browse Jobs', icon: '🔍', to: '/browse' },
            { label: 'Post Request', icon: '✚', active: true, to: '/create-request' },
            { label: 'Messages', icon: '💬', to: '/chat' },
            { label: 'Profile', icon: '👤', to: '/profile' },
          ].map(item => (
            <Link key={item.label} to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.active
                  ? 'text-white'
                  : 'text-[rgba(200,190,255,0.4)] hover:text-[rgba(200,190,255,0.8)] hover:bg-[rgba(109,68,255,0.07)]'
              }`}
              style={item.active ? {background: '#6d44ff', boxShadow: '0 2px 12px rgba(109,68,255,0.4)'} : {}}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>


      {/* === MAIN CONTENT === */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-6 md:py-12 relative">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full" style={{background: 'radial-gradient(circle, rgba(109,68,255,0.12) 0%, transparent 70%)', filter: 'blur(60px)'}} />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full" style={{background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', filter: 'blur(60px)'}} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 md:mb-3 tracking-tight">Create a Request</h1>
            <p className="text-[rgba(200,190,255,0.45)] text-sm">Offer your specialized tokens in exchange for high-tier professional skills.</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-5 text-sm text-center">
              {error}
            </motion.div>
          )}

          {/* Form Card */}
          <div className="rounded-2xl p-4 md:p-8" style={{background: 'linear-gradient(160deg, #120d28 0%, #0e0b22 100%)', border: '1px solid rgba(109,68,255,0.2)'}}>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Title */}
              <div>
                <label className={labelCls}>Title</label>
                <input type="text" name="title" required value={formData.title} onChange={handleChange}
                  placeholder="e.g., Senior Full-Stack Development"
                  className={inputCls} />
              </div>

              {/* Category + Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className={labelCls}>Category</label>
                  <input type="text" name="category" required value={formData.category} onChange={handleChange}
                    placeholder="Development, Design..."
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Points Offered</label>
                  <div className="relative">
                    <input type="number" name="pointsOffered" required min="1" value={formData.pointsOffered} onChange={handleChange}
                      placeholder="500"
                      className={inputCls + ' pr-20'} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6d44ff]">WT TOKENS</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description</label>
                <textarea name="description" required rows="5" value={formData.description} onChange={handleChange}
                  placeholder="Describe the scope of work and specific requirements..."
                  className={inputCls + ' resize-none'}></textarea>
              </div>

              {/* Upload boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {/* Image Upload */}
                <div className="relative cursor-pointer group">
                  <input type="file" multiple accept="image/*" onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="rounded-xl p-6 text-center transition-all group-hover:border-[rgba(109,68,255,0.5)]"
                    style={{border: '1.5px dashed rgba(109,68,255,0.3)', background: 'rgba(109,68,255,0.04)'}}>
                    <UploadCloud className="w-7 h-7 text-[rgba(109,68,255,0.6)] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">Upload Image</p>
                    <p className="text-xs text-[rgba(160,148,220,0.35)] mt-0.5">
                      {images.length > 0 ? `✓ ${images.length} file(s)` : 'PNG, JPG UP TO 10MB'}
                    </p>
                  </div>
                </div>

                {/* Voice Record */}
                <div className="cursor-pointer group" onClick={toggleRecording}>
                  <div className="rounded-xl p-6 text-center transition-all group-hover:border-[rgba(245,158,11,0.5)]"
                    style={{border: '1.5px dashed rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.04)'}}>
                    <Mic className="w-7 h-7 text-[rgba(245,158,11,0.7)] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white">Record Voice</p>
                    <p className="text-xs text-[rgba(160,148,220,0.35)] mt-0.5">BRIEF AUDIO BRIEF</p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{background: 'linear-gradient(135deg, #6d44ff 0%, #5b32e8 100%)', boxShadow: '0 4px 20px rgba(109,68,255,0.5)'}}>
                {loading ? 'Creating...' : <><Send className="w-5 h-5" /> Post Request 🚀</>}
              </button>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 mt-6">
            {[
              { icon: ShieldCheck, label: 'Encrypted Transaction' },
              { icon: Zap, label: 'Instant Matching' },
              { icon: BadgeCheck, label: 'Artisan Verified' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-[rgba(160,148,220,0.35)]">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateRequest;

