import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { User, Star, MapPin, Award, CheckCircle, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchReviews = async () => {
        try {
          const res = await api.get(`/reviews/user/${user._id}`);
          setReviews(res.data.reviews);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchReviews();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#09071a] flex overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <div className="hidden md:flex flex-col w-56 shrink-0 border-r border-[rgba(109,68,255,0.12)] bg-[#0c0a1e] relative z-20">
        <div className="p-5 border-b border-[rgba(109,68,255,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg">
              {user.name?.charAt(0)}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{user.name}</p>
              <p className="text-[rgba(160,148,220,0.4)] text-xs">⭐ {user.rating || 'New'} rating</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: 'Dashboard', icon: '📊', action: () => navigate('/dashboard') },
            { label: 'Browse Jobs', icon: '🔍', action: () => navigate('/browse') },
            { label: 'Messages', icon: '💬', action: () => navigate('/chat') },
            { label: 'Profile', icon: '👤', active: true, action: () => navigate('/profile') },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${item.active ? 'text-white bg-[rgba(109,68,255,0.15)] border border-[rgba(109,68,255,0.25)]' : 'text-[rgba(200,190,255,0.4)] hover:text-[rgba(200,190,255,0.8)] hover:bg-[rgba(109,68,255,0.07)]'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4">
          <Link to="/create-request" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
            style={{background:'#6d44ff',boxShadow:'0 2px 15px rgba(109,68,255,0.5)'}}>
            <Briefcase className="w-4 h-4" /> Post a Bounty
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Background Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6d44ff]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#f59e0b]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative z-10">
          <div className="w-full max-w-4xl mx-auto space-y-6 md:space-y-8">
            
            {/* Profile Header Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start text-center md:text-left"
              style={{ background: '#100e25', border: '1px solid rgba(109,68,255,0.18)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
            >
              {/* Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center border-2 border-[rgba(109,68,255,0.3)] shadow-[0_0_20px_rgba(109,68,255,0.3)] mb-5 md:mb-0 md:mr-8 shrink-0 relative">
                <span className="text-4xl md:text-5xl font-black text-white">{user.name?.charAt(0)}</span>
                <div className="absolute -bottom-2 -right-2 bg-[#10b981] w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-[#100e25] flex items-center justify-center" title="Verified Member">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">{user.name}</h1>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-[rgba(200,190,255,0.6)] text-xs md:text-sm mb-6">
                  <span className="flex items-center text-amber-400 font-bold bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20">
                    <Star className="w-4 h-4 mr-1.5 fill-current" /> {user.rating || 'New'} Rating
                  </span>
                  <span className="flex items-center bg-[rgba(109,68,255,0.08)] px-3 py-1.5 rounded-xl border border-[rgba(109,68,255,0.15)] text-white font-medium">
                    <MapPin className="w-4 h-4 mr-1.5 text-[rgba(109,68,255,0.8)]" /> {user.location || 'Remote'}
                  </span>
                  <span className="flex items-center text-[#a78bfa] font-bold bg-[rgba(109,68,255,0.15)] px-3 py-1.5 rounded-xl border border-[rgba(109,68,255,0.3)] shadow-[0_0_10px_rgba(109,68,255,0.2)]">
                    <Award className="w-4 h-4 mr-1.5" /> {user.points} Points
                  </span>
                </div>

                <div>
                  <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider text-[rgba(200,190,255,0.5)]">Skills & Expertise</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {user.skillsOffered?.length > 0 ? user.skillsOffered.map(skill => (
                      <span key={skill} className="bg-[#151232] border border-[rgba(109,68,255,0.2)] text-[rgba(200,190,255,0.9)] text-xs md:text-sm px-4 py-2 rounded-xl font-medium">
                        {skill}
                      </span>
                    )) : (
                      <span className="text-[rgba(200,190,255,0.4)] text-sm italic">No skills listed yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white">Client Reviews</h2>
                <div className="px-3 py-1 rounded-full bg-[rgba(109,68,255,0.15)] text-[#a78bfa] text-xs font-bold border border-[rgba(109,68,255,0.25)]">
                  {reviews.length} total
                </div>
              </div>
              
              {loading ? (
                <div className="text-[rgba(200,190,255,0.4)] text-center py-10">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl p-10 text-center text-[rgba(200,190,255,0.4)]" style={{ background: '#100e25', border: '1px dashed rgba(109,68,255,0.2)' }}>
                  <Star className="w-12 h-12 text-[rgba(109,68,255,0.2)] mx-auto mb-3" />
                  <p>No reviews yet. Complete a trade to start building your reputation!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {reviews.map((review, i) => (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      key={review._id} 
                      className="rounded-2xl p-5 md:p-6"
                      style={{ background: '#100e25', border: '1px solid rgba(109,68,255,0.15)' }}
                    >
                      <div className="flex justify-between items-start mb-4 border-b border-[rgba(109,68,255,0.1)] pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[rgba(109,68,255,0.15)] flex items-center justify-center border border-[rgba(109,68,255,0.2)]">
                            <User className="w-5 h-5 text-[#a78bfa]" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-sm">{review.reviewerId?.name || 'Anonymous Client'}</h4>
                            <p className="text-[rgba(200,190,255,0.3)] text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                          {[...Array(5)].map((_, index) => (
                            <Star key={index} className={`w-3 h-3 ${index < review.rating ? 'fill-current' : 'text-[rgba(245,158,11,0.2)]'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[rgba(200,190,255,0.7)] text-sm italic leading-relaxed">"{review.comment}"</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
