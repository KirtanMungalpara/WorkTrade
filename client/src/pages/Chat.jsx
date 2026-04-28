import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import io from 'socket.io-client';
import { Send, User as UserIcon, ArrowLeft, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
  const { user, token } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const messagesEndRef = useRef(null);

  // Initialize Socket
  useEffect(() => {
    if (token) {
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });
      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [token]);

  // Fetch conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/messages/conversations/all');
        setConversations(res.data.conversations);
      } catch (err) {
        console.error("Error fetching conversations", err);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages for active chat
  useEffect(() => {
    if (activeChatId) {
      const fetchMessages = async () => {
        try {
          const res = await api.get(`/messages/${activeChatId}`);
          setMessages(res.data.messages);
          scrollToBottom();
        } catch (err) {
          console.error("Error fetching messages", err);
        }
      };
      fetchMessages();
    }
  }, [activeChatId]);

  // Listen for socket events
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (msg) => {
        if (msg.senderId === activeChatId || msg.receiverId === activeChatId) {
          setMessages(prev => [...prev, msg]);
          scrollToBottom();
        }
      });
      socket.on('message_sent', (msg) => {
        if (msg.receiverId === activeChatId) {
          setMessages(prev => [...prev, msg]);
          scrollToBottom();
        }
      });
      return () => {
        socket.off('receive_message');
        socket.off('message_sent');
      };
    }
  }, [socket, activeChatId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId || !socket) return;
    socket.emit('send_message', {
      receiverId: activeChatId,
      content: newMessage
    });
    setNewMessage('');
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setIsMobileListVisible(false); // Hide list on mobile when chat selected
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true);
    setActiveChatId(null);
  };

  return (
    <div className="min-h-screen bg-[#09071a] p-4 md:p-6 lg:p-8 flex justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[800px] bg-[#6d44ff]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl rounded-2xl md:rounded-3xl overflow-hidden flex h-[calc(100vh-8rem)] md:h-[85vh] relative z-10"
        style={{ background: '#0c0a1e', border: '1px solid rgba(109,68,255,0.18)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        
        {/* Sidebar (Conversations List) */}
        <div className={`${isMobileListVisible ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-[rgba(109,68,255,0.12)] bg-[#100e25]`}>
          <div className="p-5 md:p-6 border-b border-[rgba(109,68,255,0.1)] flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#6d44ff]" /> Messages
            </h2>
            <div className="w-8 h-8 rounded-lg bg-[rgba(109,68,255,0.1)] flex items-center justify-center text-[#6d44ff] font-bold text-xs border border-[rgba(109,68,255,0.2)]">
              {conversations.length}
            </div>
          </div>
          
          <div className="overflow-y-auto flex-grow p-4 space-y-2">
            {conversations.length === 0 && (
              <div className="text-center py-10 px-4">
                <div className="w-16 h-16 rounded-full bg-[rgba(109,68,255,0.05)] border border-[rgba(109,68,255,0.1)] flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-[rgba(200,190,255,0.3)]" />
                </div>
                <p className="text-[rgba(200,190,255,0.4)] text-sm">No active conversations.<br/>Accept a job to start chatting!</p>
              </div>
            )}
            {conversations.map(convUser => {
              const isActive = activeChatId === convUser._id;
              return (
                <div 
                  key={convUser._id} 
                  onClick={() => handleSelectChat(convUser._id)}
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-[rgba(109,68,255,0.15)] border border-[rgba(109,68,255,0.3)] shadow-[0_0_15px_rgba(109,68,255,0.1)]' 
                      : 'hover:bg-[rgba(109,68,255,0.05)] border border-transparent'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mr-3 shrink-0 font-bold ${isActive ? 'bg-[#6d44ff] shadow-[0_0_10px_rgba(109,68,255,0.4)]' : 'bg-[#1a1736] border border-[rgba(109,68,255,0.2)]'}`}>
                    {convUser.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">{convUser.name}</h3>
                    <p className="text-[rgba(200,190,255,0.4)] text-xs flex items-center gap-1">
                      <span className="text-amber-400">⭐</span> {convUser.rating || 'New'} rating
                    </p>
                  </div>
                  {isActive && <div className="w-2 h-2 rounded-full bg-[#10b981] ml-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${!isMobileListVisible ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-[#0c0a1e] relative`}>
          {activeChatId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-[rgba(109,68,255,0.1)] flex items-center bg-[rgba(16,14,37,0.8)] backdrop-blur-md z-10">
                <button 
                  onClick={handleBackToList}
                  className="md:hidden mr-3 p-2 rounded-lg bg-[rgba(109,68,255,0.1)] text-[rgba(200,190,255,0.8)]"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center text-white font-bold mr-3 border border-[rgba(109,68,255,0.3)]">
                  {conversations.find(c => c._id === activeChatId)?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white leading-tight">
                    {conversations.find(c => c._id === activeChatId)?.name || 'Loading...'}
                  </h3>
                  <span className="text-[10px] md:text-xs text-[#10b981] flex items-center gap-1 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></div>
                    Active Trade Partner
                  </span>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4" style={{ backgroundImage: 'radial-gradient(rgba(109,68,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                    <div className="w-16 h-16 rounded-full bg-[#1a1736] flex items-center justify-center border border-[rgba(109,68,255,0.1)]">
                      <MessageSquare className="w-6 h-6 text-[#6d44ff]" />
                    </div>
                    <div>
                      <p className="text-white font-bold">Start the conversation</p>
                      <p className="text-sm text-[rgba(200,190,255,0.5)]">Discuss project details and share updates.</p>
                    </div>
                  </div>
                )}
                {messages.map((msg, index) => {
                  const isMine = msg.senderId === user?._id;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={index} 
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] md:max-w-[70%] px-4 py-2.5 text-sm ${
                        isMine 
                          ? 'bg-[#6d44ff] text-white rounded-2xl rounded-br-sm shadow-[0_4px_15px_rgba(109,68,255,0.25)]' 
                          : 'bg-[#1a1736] text-[rgba(240,236,255,0.9)] rounded-2xl rounded-bl-sm border border-[rgba(109,68,255,0.15)]'
                      }`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 md:p-4 bg-[rgba(16,14,37,0.9)] backdrop-blur-md border-t border-[rgba(109,68,255,0.1)] z-10">
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow bg-[#0d0b20] border border-[rgba(109,68,255,0.2)] text-white rounded-xl px-4 py-3 md:py-3.5 focus:outline-none focus:border-[#6d44ff] focus:shadow-[0_0_0_3px_rgba(109,68,255,0.15)] transition-all placeholder:text-[rgba(200,190,255,0.3)] text-sm"
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()} 
                    className="bg-[#6d44ff] hover:bg-[#5a35e6] text-white rounded-xl px-4 md:px-6 flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-[#6d44ff] shadow-[0_4px_15px_rgba(109,68,255,0.3)] disabled:shadow-none shrink-0"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="hidden md:flex flex-grow items-center justify-center flex-col text-[rgba(200,190,255,0.4)]">
              <div className="w-24 h-24 rounded-full bg-[rgba(109,68,255,0.05)] flex items-center justify-center mb-5 border border-[rgba(109,68,255,0.1)] shadow-[inset_0_0_20px_rgba(109,68,255,0.05)]">
                <Send className="w-10 h-10 text-[rgba(109,68,255,0.3)]" />
              </div>
              <p className="font-medium text-lg">Select a conversation</p>
              <p className="text-sm mt-1">Choose a chat from the sidebar to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
