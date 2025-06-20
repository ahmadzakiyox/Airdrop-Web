// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client'; // Import socket.io-client
import { Box, TextField, Button, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '@mui/material/styles';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', ''); // URL Server Socket.IO

function ChatPage() {
    const { user } = useAuth();
    const theme = useTheme();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef(null); // Ref untuk menyimpan instance socket
    const messagesEndRef = useRef(null); // Ref untuk scroll ke bawah

    useEffect(() => {
        // Inisialisasi koneksi Socket.IO
        socketRef.current = io(SOCKET_SERVER_URL, {
            // Konfigurasi otentikasi jika diperlukan (misal: kirim token JWT)
            // auth: { token: localStorage.getItem('access_token') }
        });

        // Event listener untuk menerima riwayat pesan
        socketRef.current.on('chat_history', (history) => {
            setMessages(history);
        });

        // Event listener untuk menerima pesan baru
        socketRef.current.on('receive_message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Minta riwayat pesan saat terhubung
        socketRef.current.emit('request_chat_history');

        // Cleanup function saat komponen di-unmount
        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    // Scroll ke bawah setiap kali ada pesan baru
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && user) {
            const messageData = {
                userId: user.id,
                username: user.username,
                content: newMessage.trim(),
            };
            socketRef.current.emit('send_message', messageData);
            setNewMessage('');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.light', fontWeight: 'bold' }}>
                Real-time Chat
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mt: 3, height: '70vh', display: 'flex', flexDirection: 'column', background: theme.palette.background.paper }}>
                <List sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                    {messages.map((msg) => (
                        <ListItem key={msg._id} sx={{ mb: 1, pr: 0 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: msg.sender === user.id ? theme.palette.secondary.light : theme.palette.primary.light }}>
                                        {msg.username}
                                        <Typography component="span" variant="caption" sx={{ ml: 1, color: theme.palette.text.secondary }}>
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </Typography>
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body1" sx={{ color: theme.palette.text.primary, wordBreak: 'break-word' }}>
                                        {msg.content}
                                    </Typography>
                                }
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor: msg.sender === user.id ? theme.palette.primary.dark + '30' : theme.palette.grey[800], // Background pesan
                                    border: `1px solid ${msg.sender === user.id ? theme.palette.primary.dark : theme.palette.grey[700]}`,
                                }}
                            />
                        </ListItem>
                    ))}
                    <div ref={messagesEndRef} /> {/* Elemen untuk scroll */}
                </List>

                <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Ketik pesan..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        sx={{
                            '& .MuiInputBase-input': { color: theme.palette.text.primary },
                            '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.grey[700] },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                        }}
                    />
                    <Button type="submit" variant="contained" color="secondary">
                        Kirim
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default ChatPage;