const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./config/config.json');

// Store user socket mappings
const userSockets = new Map();

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use((socket, next) => {
    console.log('Socket.IO authentication attempt:', {
      auth: socket.handshake.auth,
      headers: socket.handshake.headers
    });

    const token = socket.handshake.auth.token;
    if (!token) {
      console.error('Socket.IO authentication failed: No token provided');
      return next(new Error('Authentication token required'));
    }

    try {
      // Verify token format
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Decode and verify token
      const decoded = jwt.verify(token, config.development.jwtSecret);
      console.log('Socket.IO authentication successful:', {
        userId: decoded.id,
        role: decoded.role,
        exp: new Date(decoded.exp * 1000).toISOString()
      });

      socket.user = decoded;
      next();
    } catch (err) {
      console.error('Socket.IO authentication error:', {
        error: err.message,
        stack: err.stack,
        token: token.substring(0, 10) + '...',
        name: err.name
      });
      next(new Error('Invalid authentication token'));
    }
  });

  // Store active calls
  const activeCalls = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', {
      userId: socket.user.id,
      socketId: socket.id
    });

    // Store socket mapping
    userSockets.set(socket.user.id, socket.id);
    
    // Join user's room
    socket.join(socket.user.id);
    console.log('User joined room:', socket.user.id);

    // Handle room joining
    socket.on('join:room', ({ userId }) => {
      console.log('User joining room:', userId);
      socket.join(userId);
    });

    // Handle call initiation
    socket.on('call:initiate', async (data) => {
      console.log('Call initiation attempt:', {
        from: socket.user.id,
        to: data.to,
        offer: data.offer
      });

      const { offer, to, callId } = data;
      
      // Store the call information
      activeCalls.set(callId, {
        from: socket.user.id,
        to,
        offer,
        callId
      });

      console.log('Call initiated:', {
        callId,
        from: socket.user.id,
        to
      });

      // Get recipient's socket ID
      const recipientSocketId = userSockets.get(to);
      if (!recipientSocketId) {
        console.log('Recipient not found:', to);
        socket.emit('call:rejected', {
          callId,
          reason: 'Recipient not available'
        });
        return;
      }

      // Forward the offer to the recipient
      io.to(recipientSocketId).emit('call:incoming', {
        offer,
        callId,
        from: socket.user.id
      });
    });

    // Handle call acceptance
    socket.on('call:accepted', async (data) => {
      console.log('Call accepted:', {
        from: socket.user.id,
        to: data.to,
        answer: data.answer,
        callId: data.callId
      });

      const { answer, to, callId } = data;
      const call = activeCalls.get(callId);

      if (!call) {
        console.log('Call not found:', callId);
        return;
      }

      // Get caller's socket ID
      const callerSocketId = userSockets.get(to);
      if (!callerSocketId) {
        console.log('Caller not found:', to);
        return;
      }

      // Forward the answer to the caller
      io.to(callerSocketId).emit('call:accepted', {
        answer,
        callId
      });

      console.log('Call answer forwarded to caller');
    });

    // Handle ICE candidates
    socket.on('call:ice-candidate', (data) => {
      console.log('ICE candidate received:', {
        from: socket.user.id,
        to: data.to,
        candidate: data.candidate,
        callId: data.callId
      });

      const { candidate, to, callId } = data;
      const call = activeCalls.get(callId);

      if (!call) {
        console.log('Call not found:', callId);
        return;
      }

      // Get recipient's socket ID
      const recipientSocketId = userSockets.get(to);
      if (!recipientSocketId) {
        console.log('Recipient not found:', to);
        return;
      }

      // Forward the ICE candidate
      io.to(recipientSocketId).emit('call:ice-candidate', {
        candidate,
        callId,
        from: socket.user.id
      });
    });

    // Handle call end
    socket.on('call:end', (data) => {
      console.log('Call ended:', {
        from: socket.user.id,
        to: data.to,
        callId: data.callId
      });

      const { to, callId } = data;
      const call = activeCalls.get(callId);

      if (!call) {
        console.log('Call not found:', callId);
        return;
      }

      // Get recipient's socket ID
      const recipientSocketId = userSockets.get(to);
      if (!recipientSocketId) {
        console.log('Recipient not found:', to);
        return;
      }

      // Forward call end notification
      io.to(recipientSocketId).emit('call:ended', {
        callId
      });

      // Clean up the call
      activeCalls.delete(callId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', {
        userId: socket.user.id,
        socketId: socket.id
      });
      
      // Clean up socket mapping
      userSockets.delete(socket.user.id);
      
      // Clean up any active calls
      for (const [callId, call] of activeCalls.entries()) {
        if (call.from === socket.user.id || call.to === socket.user.id) {
          activeCalls.delete(callId);
        }
      }
    });
  });

  return io;
}

module.exports = initializeSocket; 