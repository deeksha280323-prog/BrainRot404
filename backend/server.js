const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup for real-time chat
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes (will create more later)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/hackathon', require('./routes/hackathonRoutes'));

// Socket.io integration
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_team_room', (teamId) => {
    socket.join(teamId);
    console.log(`User mapped to team room: ${teamId}`);
  });

  socket.on('send_message', (data) => {
    // Expected data format: { teamId, sender, content, timestamp }
    // Broadcast to everyone in the room except sender
    socket.to(data.teamId).emit('receive_message', data);
    
    // In a full implementation, you'd ALSO save this to MongoDB Message model here
    // But since we want rapid feedback, we emit first.
  });

  socket.on('typing', (data) => {
     socket.to(data.teamId).emit('user_typing', { userId: data.userId, isTyping: data.isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware (basic)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
