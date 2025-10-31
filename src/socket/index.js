const { Server } = require('socket.io');
const ConversationModel = require('../features/conversation/conversation.model');
const Message = require('../features/conversation/message.model');
const { verifyToken } = require('../shared/helpers/utils');

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ["GET", "POST", "PATCH"],
        },
        path: '/socket.io',
        transports: ['websocket', 'polling']
    });

    console.log("Socket.IO initialized");

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        console.log("Received token:", token);

        if (!token) return next(new Error('Unauthorized'));

        try {
            const user = verifyToken(token);
            socket.user = user;
            next();
        } catch(e) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);
    });

    io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("Received token:", token); // should now log your hardcoded token
  next();
});


    io.on('connection', (socket) => {
        console.log('Socket connected: ', socket.user._id);

        socket.on('joinRoom', async ({ conversationId }) => {
            try {
                if (!conversationId) return socket.emit('error', 'Conversation not found');

                const conversation = await ConversationModel.findById(conversationId);
                if (!conversation) return socket.emit('error', 'Conversation not found');

                if (!conversation.participants.some(p => p.equals(socket.user._id))) {
                    return socket.emit('error', 'Unauthorized room access');
                }

                socket.join(conversationId.toString());
                console.log(`User ${socket.user._id} joined room ${conversationId}`);
            } catch (e) {
                console.error(e);
                socket.emit('error', 'Internal server error');
            }
        });

        socket.on('message', async ({ conversationId, message }) => {
            try {
                const conversation = await ConversationModel.findById(conversationId);
                if (!conversation) return socket.emit('error', 'Conversation not found');

                if (!conversation.participants.some(p => p.equals(socket.user._id))) {
                    return socket.emit('error', 'Unauthorized room access');
                }

                const recipientId = conversation.participants.find(p => !p.equals(socket.user._id));

                const newMessage = new Message({
                    conversationId,
                    senderId: socket.user._id,
                    recipientId,
                    content: message,
                });
                await newMessage.save();

                conversation.lastMessage = message;
                conversation.lastTimeStamp = new Date();

                const unreadCounts = conversation.unreadCounts || new Map();
                const prevCount = unreadCounts.get(recipientId.toString()) || 0;
                unreadCounts.set(recipientId.toString(), prevCount + 1);
                conversation.unreadCounts = unreadCounts;

                await conversation.save();

                io.to(conversationId.toString()).emit('newMessage', newMessage);
            } catch (e) {
                console.error(e);
                socket.emit('error', 'Internal server error');
            }
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected: ', socket.user._id);
        });
    });
}

function getIO() {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
}

module.exports = { initSocket, getIO };