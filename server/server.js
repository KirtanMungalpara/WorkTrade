const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all for dev
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected successfully'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/matching', require('./routes/matching'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is connected and working!' });
});

// Test Database Route
const User = require('./models/User');
app.get('/api/test-db', async (req, res) => {
  try {
    // Create a dummy user
    const testUser = new User({
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "password123",
      skillsOffered: ["Plumbing"],
      servicesNeeded: ["Web Design"]
    });
    
    await testUser.save();
    
    // Fetch it from the database to confirm
    const users = await User.find();
    
    res.json({ 
      success: true, 
      message: 'Successfully saved and fetched from MongoDB!',
      totalUsersInDb: users.length,
      latestUser: testUser
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- SOCKET.IO SETUP ---
io.use((socket, next) => {
  if (socket.handshake.auth && socket.handshake.auth.token) {
    jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.user = decoded.user;
      next();
    });
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected to Socket.io: ${socket.user.id}`);
  
  // Join a personal room based on their User ID
  socket.join(socket.user.id);

  // Listen for sending a message
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, content } = data;
      
      // Save message to DB
      const newMessage = new Message({
        senderId: socket.user.id,
        receiverId,
        content
      });
      await newMessage.save();

      // Emit message to the receiver's personal room
      io.to(receiverId).emit('receive_message', newMessage);
      
      // Emit back to sender so they can update their UI if needed
      socket.emit('message_sent', newMessage);
    } catch (err) {
      console.error('Socket message error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
