// airdrop_tracker_backend_nodejs/server.js
const express = require('express');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import Server dari socket.io
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const airdropRoutes = require('./routes/airdropRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');
const Message = require('./models/Message'); // Import Message Model

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Buat server HTTP dari aplikasi Express

// Inisialisasi Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL, // Izinkan dari frontend React
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rute API
app.use('/api/auth', authRoutes);
app.use('/api/airdrops', airdropRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('Airdrop Tracker API is running...');
});

// --- LOGIKA SOCKET.IO ---
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Kirim riwayat pesan saat user pertama kali terhubung
    // Bisa juga hanya panggil API HTTP untuk riwayat pesan di frontend
    socket.on('request_chat_history', async () => {
        try {
            const messages = await Message.find()
                                            .sort({ timestamp: 1 })
                                            .limit(50) // Ambil 50 pesan terakhir
                                            // .populate('sender', 'username') // Jika tidak menyimpan username langsung di message
                                            .lean(); // Untuk mendapatkan objek JS biasa
            socket.emit('chat_history', messages);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    });


    // Handle pesan baru dari client
    socket.on('send_message', async (data) => {
        const { userId, username, content } = data; // Data dari client

        if (!userId || !username || !content) {
            console.warn('Invalid message data received:', data);
            return;
        }

        try {
            const newMessage = new Message({
                sender: userId,
                username: username,
                content: content,
            });
            await newMessage.save();

            // Siarkan pesan ke semua client yang terhubung
            io.emit('receive_message', {
                _id: newMessage._id,
                sender: newMessage.sender,
                username: newMessage.username,
                content: newMessage.content,
                timestamp: newMessage.timestamp,
            });
            console.log(`Message from ${username}: ${content}`);

        } catch (error) {
            console.error('Error saving or broadcasting message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
// --- AKHIR LOGIKA SOCKET.IO ---

const PORT = process.env.PORT || 5000;

// Ganti app.listen dengan server.listen
server.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});