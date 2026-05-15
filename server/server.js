const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS for both development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://naija-overseas.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Socket.io — real-time whiteboard sync ──────────────────────────────────
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.on('connection', (socket) => {
  socket.on('board:join', (roomId) => socket.join(`board:${roomId}`));
  socket.on('board:leave', (roomId) => socket.leave(`board:${roomId}`));

  // Tutor drawing events → forward to everyone else in the board room
  ['board:begin', 'board:move', 'board:end', 'board:clear', 'board:text', 'board:eq'].forEach((ev) => {
    socket.on(ev, ({ roomId, ...rest }) => socket.to(`board:${roomId}`).emit(ev, rest));
  });

  // Full-canvas sync handshake: student requests → tutor responds directly to student
  socket.on('board:sync-request', ({ roomId }) => {
    socket.to(`board:${roomId}`).emit('board:sync-request', { from: socket.id });
  });
  socket.on('board:sync-response', ({ to, dataUrl }) => {
    io.to(to).emit('board:sync', { dataUrl });
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schools', require('./routes/schools'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/study-abroad', require('./routes/studyAbroad'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tutors', require('./routes/tutors'));
app.use('/api/classroom', require('./routes/classroom'));
app.use('/api/homework', require('./routes/homework'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/gcalendar', require('./routes/gcalendar'));
app.use('/api/subscriptions', require('./routes/subscriptions'));

app.get('/', (req, res) => res.json({ message: 'Naija and Overseas API running' }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    // Start reminder cron job (sends 24h and 1h email reminders for sessions)
    require('./jobs/reminders').initReminders();
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error('MongoDB connection error:', err));
