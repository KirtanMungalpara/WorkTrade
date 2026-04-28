import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Coins, Star, Activity, ArrowRight, UserCheck, Inbox, MessageSquare, Briefcase, X, CheckCircle, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTransactions, setActiveTransactions] = useState([]);
  const [directOffers, setDirectOffers] = useState([]);
  const [myOpenRequests, setMyOpenRequests] = useState([]);
  
  // Modal States
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: '', description: '', pointsOffered: '' });
  const [loading, setLoading] = useState(false);

  // Review Viewing States
  const [viewingReviewsFor, setViewingReviewsFor] = useState(null);
  const [applicantReviews, setApplicantReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Review Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTransaction, setReviewTransaction] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [sugRes, transRes, offersRes, myRequestsRes] = await Promise.all([
        api.get('/matching/suggestions'),
        api.get('/transactions/my-active'),
        api.get('/requests/direct'),
        api.get('/requests/my-requests')
      ]);
      setSuggestions(sugRes.data.suggestions);
      setActiveTransactions(transRes.data.transactions);
      setDirectOffers(offersRes.data.requests);
      setMyOpenRequests(myRequestsRes.data.requests);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasActiveTransactionWith = (otherUserId) => {
    return activeTransactions.some(
      (t) => t.requesterId === otherUserId || t.providerId === otherUserId
    );
  };

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/requests', { ...formData, targetProviderId: targetUser._id });
      alert(`Job offer sent to ${targetUser.name}!`);
      setIsHireModalOpen(false);
      setFormData({ title: '', category: '', description: '', pointsOffered: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    } finally {
      setLoading(false);
    }
  };

  const acceptDirectOffer = async (offerId) => {
    try {
      await api.post(`/transactions/accept/${offerId}`);
      alert("Offer Accepted! You can now message them.");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error accepting offer");
    }
  };

  const handleHire = async (requestId, providerId) => {
    try {
      await api.post(`/transactions/hire/${requestId}/${providerId}`);
      alert("Provider hired successfully!");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error hiring provider");
    }
  };

  const handleViewReviews = async (applicant) => {
    setViewingReviewsFor(applicant);
    setApplicantReviews([]);
    setReviewsLoading(true);
    try {
      const res = await api.get(`/reviews/user/${applicant._id}`);
      setApplicantReviews(res.data.reviews);
    } catch (err) {
      alert("Error fetching reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  // Transaction Lifecycle Actions
  const handleUploadProof = async (transactionId, files) => {
    if (!files || files.length === 0) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(file => {
        fd.append('proofImages', file);
      });

      await api.put(`/transactions/${transactionId}/proof`, fd);
      alert("Proof uploaded successfully!");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error uploading proof");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCompletion = async (transaction) => {
    try {
      const res = await api.put(`/transactions/${transaction._id}/confirm`);
      alert(res.data.message);
      
      if (res.data.transaction.status === 'completed') {
        // Open review modal
        setReviewTransaction(res.data.transaction);
        setIsReviewModalOpen(true);
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error confirming");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/reviews/${reviewTransaction._id}`, reviewData);
      alert("Review submitted! Thank you.");
      setIsReviewModalOpen(false);
      setReviewData({ rating: 5, comment: '' });
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const mc = 'w-full bg-[#0d0b20] border border-[rgba(109,68,255,0.18)] text-[#f0ecff] rounded-xl p-3 focus:outline-none focus:border-[#6d44ff] transition-all placeholder:text-[rgba(160,148,220,0.3)] text-sm';

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#09071a] flex">

      {/* LEFT SIDEBAR */}
      <div className="hidden md:flex flex-col w-56 shrink-0 border-r border-[rgba(109,68,255,0.12)] bg-[#0c0a1e]">
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
            { label: 'Dashboard', icon: '📊', active: true, action: () => navigate('/dashboard') },
            { label: 'Browse Jobs', icon: '🔍', action: () => navigate('/browse') },
            { label: 'Messages', icon: '💬', action: () => navigate('/chat') },
            { label: 'Profile', icon: '👤', action: () => navigate('/profile') },
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

      {/* MAIN */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {[
              {label:'POINTS',value:user.points,sub:'Balance',icon:<Coins className="w-4 h-4 md:w-6 md:h-6" />,color:'#f59e0b'},
              {label:'ACTIVE JOBS',value:activeTransactions.length,sub:'In progress',icon:<Activity className="w-4 h-4 md:w-6 md:h-6" />,color:'#6d44ff'},
              {label:'RATING',value:user.rating||'New',sub:'All trades',icon:<Star className="w-4 h-4 md:w-6 md:h-6" />,color:'#f59e0b'},
            ].map(s=>(
              <div key={s.label} className="rounded-xl md:rounded-2xl p-3 md:p-5 flex flex-col items-center sm:items-start sm:flex-row sm:justify-between"
                style={{background:'#100e25',border:'1px solid rgba(109,68,255,0.18)'}}>
                <div className="text-center sm:text-left mb-2 sm:mb-0">
                  <p className="text-[9px] md:text-xs font-bold text-[rgba(200,190,255,0.4)] uppercase tracking-wider mb-0.5">{s.label}</p>
                  <p className="text-2xl md:text-4xl font-black text-white mb-0.5 leading-none">{s.value}</p>
                  <p className="hidden sm:block text-[9px] md:text-xs text-[rgba(200,190,255,0.35)]">{s.sub}</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{background:`${s.color}18`,border:`1px solid ${s.color}30`, color: s.color}}>{s.icon}</div>
              </div>
            ))}
          </div>

          {/* Active Jobs */}
          {activeTransactions.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Manage Active Jobs</h2>
                <button className="text-sm text-[#6d44ff] flex items-center gap-1">View All <ArrowRight className="w-4 h-4"/></button>
              </div>
              <div className="space-y-3">
                {activeTransactions.map(t=>{
                  const isProvider=t.providerId===user._id;
                  const isRequester=t.requesterId===user._id;
                  return(
                    <div key={t._id} className="rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      style={{background:'#100e25',border:'1px solid rgba(109,68,255,0.15)'}}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-700 to-indigo-800 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          #{t._id.slice(-3)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">Job #{t._id.slice(-6)}</h3>
                          <p className="text-xs text-[rgba(200,190,255,0.4)]">{isProvider?'Provider':'Requester'} â€¢ {t.points} pts locked</p>
                          <div className="flex gap-2 mt-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-[#a78bfa]"
                              style={{background:'rgba(109,68,255,0.12)',border:'1px solid rgba(109,68,255,0.25)'}}>{t.status}</span>
                          </div>
                          {t.proofImages?.length>0&&(
                            <div className="flex gap-2 mt-2">
                              {t.proofImages.map((url,idx)=>(
                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                                  <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover border border-[rgba(109,68,255,0.2)]"/>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap shrink-0">
                        <button onClick={()=>navigate('/chat')} className="px-4 py-2 rounded-xl text-sm font-semibold text-[rgba(200,190,255,0.5)]"
                          style={{background:'rgba(109,68,255,0.08)',border:'1px solid rgba(109,68,255,0.18)'}}>
                          <MessageSquare className="w-4 h-4 inline mr-1"/>Message Client
                        </button>
                        {isProvider&&t.status==='in-progress'&&(
                          <label className="px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer"
                            style={{background:'#6d44ff',boxShadow:'0 2px 10px rgba(109,68,255,0.4)'}}>
                            <Upload className="w-4 h-4 inline mr-1"/>Submit Assets
                            <input type="file" multiple accept="image/*" className="hidden" onChange={e=>handleUploadProof(t._id,e.target.files)}/>
                          </label>
                        )}
                        {isRequester&&!t.requesterConfirmed&&(t.status==='in-progress'||t.status==='pending_confirmation')&&(
                          <button onClick={()=>handleConfirmCompletion(t)} className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                            style={{background:'linear-gradient(135deg,#10b981,#059669)',boxShadow:'0 2px 10px rgba(16,185,129,0.3)'}}>
                            <CheckCircle className="w-4 h-4 inline mr-1"/>Confirm Done
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Open Job Postings */}
          {myOpenRequests.length>0&&(
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Your Open Job Postings</h2>
              <div className="space-y-4">
                {myOpenRequests.map(req=>(
                  <div key={req._id} className="rounded-2xl p-5"
                    style={{background:'#100e25',border:'1px solid rgba(109,68,255,0.15)'}}>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-bold text-white">{req.title}</h3>
                        <p className="text-xs text-[rgba(200,190,255,0.35)]">{req.category} â€¢ {req.pointsOffered} pts</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full text-[#a78bfa]"
                        style={{background:'rgba(109,68,255,0.12)',border:'1px solid rgba(109,68,255,0.25)'}}>
                        {req.applicants?.length||0} Applicants
                      </span>
                    </div>
                    {req.applicants?.length>0?(
                      <div className="space-y-2">
                        {req.applicants.map(applicant=>(
                          <div key={applicant._id} className="flex items-center justify-between p-3 rounded-xl"
                            style={{background:'rgba(109,68,255,0.06)',border:'1px solid rgba(109,68,255,0.12)'}}>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">
                                {applicant.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white text-sm font-semibold">{applicant.name}</p>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-400 fill-current"/>
                                  <span className="text-amber-400 text-xs font-bold">{applicant.rating||'New'}</span>
                                  <span className="text-[rgba(200,190,255,0.3)] text-xs">({applicant.skillsOffered?.join(', ')||'No skills'})</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[rgba(200,190,255,0.4)]">{req.pointsOffered} pts</span>
                              <button onClick={()=>handleViewReviews(applicant)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[rgba(200,190,255,0.5)]"
                                style={{background:'rgba(109,68,255,0.08)',border:'1px solid rgba(109,68,255,0.15)'}}>Reviews</button>
                              <button onClick={()=>handleHire(req._id,applicant._id)} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white"
                                style={{background:'#6d44ff',boxShadow:'0 2px 8px rgba(109,68,255,0.4)'}}>Hire</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ):(
                      <p className="text-sm text-[rgba(200,190,255,0.25)] pt-2 border-t border-[rgba(109,68,255,0.1)]">Waiting for applicants...</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Offers */}
          {directOffers.length>0&&(
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Inbox className="w-5 h-5 text-amber-400"/>Direct Offers</h2>
              <div className="space-y-3">
                {directOffers.map(offer=>(
                  <div key={offer._id} className="rounded-2xl p-4 flex justify-between items-center"
                    style={{background:'#100e25',border:'1px solid rgba(245,158,11,0.2)'}}>
                    <div>
                      <h3 className="font-bold text-white text-sm">{offer.title}</h3>
                      <p className="text-xs text-[rgba(200,190,255,0.35)]">From: {offer.userId.name} • {offer.pointsOffered} pts</p>
                    </div>
                    <button onClick={()=>acceptDirectOffer(offer._id)} className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                      style={{background:'#f59e0b',boxShadow:'0 2px 10px rgba(245,158,11,0.35)'}}>Accept Job</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {activeTransactions.length===0&&myOpenRequests.length===0&&directOffers.length===0&&(
            <div className="text-center py-12">
              <p className="text-5xl mb-4">🚀</p>
              <p className="text-white font-bold text-lg mb-2">Ready to start trading?</p>
              <p className="text-[rgba(200,190,255,0.35)] text-sm mb-6">Post a job or browse requests to get started.</p>
              <Link to="/browse" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
                style={{background:'#6d44ff',boxShadow:'0 4px 15px rgba(109,68,255,0.5)'}}>Browse Requests</Link>
            </div>
          )}

          {/* RECOMMENDED MATCHES — responsive grid, always visible */}
          {suggestions.length>0&&(
            <div className="pb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#6d44ff]"/>Recommended Matches
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map(sug=>{
                  const isActive=hasActiveTransactionWith(sug._id);
                  return(
                    <div key={sug._id} className="rounded-2xl p-4" style={{background:'#100e25',border:'1px solid rgba(109,68,255,0.15)'}}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold shrink-0">
                          {sug.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm truncate">{sug.name}</p>
                          <p className="text-[rgba(200,190,255,0.4)] text-xs truncate">{sug.skillsOffered?.[0]||'Freelancer'}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="w-3 h-3 text-amber-400 fill-current"/>
                          <span className="text-amber-400 text-xs font-bold">{sug.rating||'New'}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {sug.skillsOffered?.slice(0,3).map(skill=>(
                          <span key={skill} className="text-[10px] font-bold px-2 py-0.5 rounded text-[#a78bfa] uppercase"
                            style={{background:'rgba(109,68,255,0.12)',border:'1px solid rgba(109,68,255,0.25)'}}>{skill}</span>
                        ))}
                      </div>
                      {isActive?(
                        <button onClick={()=>navigate('/chat')} className="w-full py-2 rounded-xl text-sm font-semibold text-[rgba(200,190,255,0.5)] flex items-center justify-center gap-2"
                          style={{background:'rgba(109,68,255,0.08)',border:'1px solid rgba(109,68,255,0.18)'}}>
                          <MessageSquare className="w-4 h-4"/>Message
                        </button>
                      ):(
                        <button onClick={()=>{setTargetUser(sug);setIsHireModalOpen(true);}} className="w-full py-2 rounded-xl text-sm font-bold text-white"
                          style={{background:'rgba(109,68,255,0.12)',border:'1px solid rgba(109,68,255,0.25)'}}>
                          Send Trade Proposal
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isHireModalOpen&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="rounded-2xl p-6 w-full max-w-md relative" style={{background:'#120d28',border:'1px solid rgba(109,68,255,0.25)'}}>
              <button onClick={()=>setIsHireModalOpen(false)} className="absolute top-4 right-4 text-[rgba(200,190,255,0.4)] hover:text-white"><X className="w-5 h-5"/></button>
              <h2 className="text-2xl font-bold text-white mb-5">Send Direct Offer</h2>
              <form onSubmit={handleHireSubmit} className="space-y-4">
                <input type="text" placeholder="Job Title" required value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} className={mc}/>
                <input type="text" placeholder="Category" required value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} className={mc}/>
                <textarea placeholder="Description" required rows="3" value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} className={mc}/>
                <input type="number" placeholder="Points" required min="1" value={formData.pointsOffered} onChange={e=>setFormData({...formData,pointsOffered:e.target.value})} className={mc}/>
                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50"
                  style={{background:'#6d44ff',boxShadow:'0 4px 15px rgba(109,68,255,0.4)'}}>
                  {loading?'Sending...':'Send Offer'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReviewModalOpen&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="rounded-2xl p-6 w-full max-w-md relative" style={{background:'#120d28',border:'1px solid rgba(109,68,255,0.25)'}}>
              <button onClick={()=>setIsReviewModalOpen(false)} className="absolute top-4 right-4 text-[rgba(200,190,255,0.4)] hover:text-white"><X className="w-5 h-5"/></button>
              <h2 className="text-2xl font-bold text-white mb-2">Job Completed! ðŸŽ‰</h2>
              <p className="text-[rgba(200,190,255,0.4)] text-sm mb-6">Leave a review to help your partner build their reputation.</p>
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[rgba(200,190,255,0.6)] mb-2 block">Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(num=>(
                      <button type="button" key={num} onClick={()=>setReviewData({...reviewData,rating:num})}
                        className={`p-2 rounded-xl border transition-all ${reviewData.rating>=num?'bg-amber-500/20 border-amber-500 text-amber-400':'border-[rgba(109,68,255,0.2)] text-[rgba(200,190,255,0.3)]'}`}>
                        <Star className={`w-6 h-6 ${reviewData.rating>=num?'fill-current':''}`}/>
                      </button>
                    ))}
                  </div>
                </div>
                <textarea placeholder="Write a comment..." required rows="3" value={reviewData.comment} onChange={e=>setReviewData({...reviewData,comment:e.target.value})} className={mc}/>
                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50"
                  style={{background:'linear-gradient(135deg,#f59e0b,#d97706)'}}>
                  {loading?'Submitting...':'Submit Review'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingReviewsFor&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="rounded-2xl p-6 w-full max-w-lg relative max-h-[80vh] flex flex-col" style={{background:'#120d28',border:'1px solid rgba(109,68,255,0.25)'}}>
              <button onClick={()=>setViewingReviewsFor(null)} className="absolute top-4 right-4 text-[rgba(200,190,255,0.4)] hover:text-white"><X className="w-5 h-5"/></button>
              <h2 className="text-2xl font-bold text-white mb-1">Reviews for {viewingReviewsFor.name}</h2>
              <div className="flex items-center gap-2 text-amber-400 text-sm mb-5 pb-4 border-b border-[rgba(109,68,255,0.1)]">
                <Star className="w-4 h-4 fill-current"/>
                <span className="font-bold">{viewingReviewsFor.rating||'New'}</span>
                {viewingReviewsFor.rating&&<span className="text-[rgba(200,190,255,0.35)]">Average ({applicantReviews.length} reviews)</span>}
              </div>
              <div className="overflow-y-auto space-y-3 flex-grow pr-1">
                {reviewsLoading?(<p className="text-[rgba(200,190,255,0.4)] text-center py-6">Loading...</p>
                ):applicantReviews.length>0?applicantReviews.map(review=>(
                  <div key={review._id} className="p-4 rounded-xl" style={{background:'rgba(109,68,255,0.06)',border:'1px solid rgba(109,68,255,0.12)'}}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-white text-sm">{review.reviewerId?.name||'Anonymous'}</span>
                      <div className="flex text-amber-400">{[...Array(5)].map((_,i)=><Star key={i} className={`w-3 h-3 ${i<review.rating?'fill-current':'text-[rgba(109,68,255,0.2)]'}`}/>)}</div>
                    </div>
                    <p className="text-[rgba(200,190,255,0.5)] text-sm italic">"{review.comment}"</p>
                    <p className="text-[rgba(200,190,255,0.2)] text-xs mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                )):(
                  <p className="text-[rgba(200,190,255,0.3)] text-center py-8">No reviews yet.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;


