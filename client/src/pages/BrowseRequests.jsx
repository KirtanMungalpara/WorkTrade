import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Search, Tag, CheckCircle, Handshake } from 'lucide-react';

const BrowseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/requests');
        setRequests(res.data.requests);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleApply = async (id) => {
    try {
      await api.post(`/requests/${id}/apply`);
      alert("Successfully applied! The requester will review your profile.");
      const res = await api.get('/requests');
      setRequests(res.data.requests);
    } catch (err) {
      alert(err.response?.data?.message || "Error applying for request");
    }
  };

  const filtered = requests.filter(r =>
    !searchQuery ||
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09071a] flex justify-center items-center">
        <div className="w-10 h-10 border-2 border-[rgba(109,68,255,0.3)] border-t-[#6d44ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09071a] px-4 md:px-8 lg:px-12 py-6 md:py-10">
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 tracking-tight">Browse Requests</h1>
          
          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(160,148,220,0.4)]" />
            <input
              type="text"
              placeholder="Search skills, projects, or artisans..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#100e25] border border-[rgba(109,68,255,0.18)] text-[#f0ecff] rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#6d44ff] focus:shadow-[0_0_0_3px_rgba(109,68,255,0.15)] transition-all text-sm placeholder:text-[rgba(160,148,220,0.35)]"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((req, i) => {
            const hasApplied = req.applicants?.some(a => (typeof a === 'string' ? a : a._id) === user?._id);
            const isOwner = req.userId?._id === user?._id;

            return (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="job-card p-6 flex flex-col"
              >
                {/* Poster info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(109,68,255,0.4)]">
                      {req.userId?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold leading-tight">{req.userId?.name || 'Unknown'}</p>
                      <p className="text-[rgba(160,148,220,0.45)] text-xs">Elite Trader</p>
                    </div>
                  </div>
                  <span className="badge-pts">{req.pointsOffered} PTS</span>
                </div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold text-white leading-snug mb-2 md:mb-3">{req.title}</h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge-tag">{req.category}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-[rgba(200,190,255,0.45)] leading-relaxed mb-4 flex-grow line-clamp-3">
                  {req.description}
                </p>

                {/* Attached images */}
                {req.images && req.images.length > 0 && (
                  <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                    {req.images.map((imgUrl, idx) => (
                      <a key={idx} href={imgUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img
                          src={imgUrl}
                          alt={`Attachment ${idx + 1}`}
                          className="w-14 h-14 object-cover rounded-xl border border-[rgba(109,68,255,0.2)] hover:border-[rgba(109,68,255,0.5)] transition-all"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* CTA */}
                {req.status === 'open' && !isOwner ? (
                  <button
                    onClick={() => handleApply(req._id)}
                    disabled={hasApplied}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      hasApplied
                        ? 'bg-[rgba(109,68,255,0.1)] text-[rgba(109,68,255,0.4)] cursor-not-allowed border border-[rgba(109,68,255,0.15)]'
                        : 'text-white'
                    }`}
                    style={!hasApplied ? {background: '#6d44ff', boxShadow: '0 4px 15px rgba(109,68,255,0.45)'} : {}}
                  >
                    {hasApplied
                      ? <><CheckCircle className="w-4 h-4" /> Applied</>
                      : <><Handshake className="w-4 h-4" /> Apply for Job</>
                    }
                  </button>
                ) : req.status !== 'open' ? (
                  <div className="w-full py-3 rounded-xl font-semibold text-sm text-center text-[rgba(160,148,220,0.35)] bg-[rgba(109,68,255,0.05)] border border-[rgba(109,68,255,0.1)]">
                    <CheckCircle className="w-4 h-4 inline mr-2" />{req.status}
                  </div>
                ) : null}
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg text-[rgba(200,190,255,0.4)]">No requests found. Check back later!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseRequests;

