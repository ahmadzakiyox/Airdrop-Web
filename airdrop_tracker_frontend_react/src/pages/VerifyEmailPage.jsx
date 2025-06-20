// airdrop_tracker_frontend_react/src/pages/VerifyEmailPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../api/auth.js';
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTheme } from '@mui/material/styles'; // Import useTheme

function VerifyEmailPage() {
    const [verificationStatus, setVerificationStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme(); // Panggil useTheme

    useEffect(() => {
        const verifyUserEmail = async () => {
            const queryParams = new URLSearchParams(location.search);
            const token = queryParams.get('token');
            const email = queryParams.get('email');

            if (!token || !email) {
                setVerificationStatus('error');
                setMessage('Tautan verifikasi tidak lengkap atau tidak valid.');
                return;
            }

            try {
                const response = await verifyEmail(token, email);
                setVerificationStatus('success');
                setMessage(response.message || 'Email Anda berhasil diverifikasi!');
            } catch (err) {
                setVerificationStatus('error');
                setMessage(err.response?.data?.message || 'Gagal memverifikasi email Anda. Tautan mungkin tidak valid atau sudah kedaluwarsa.');
                console.error("Verification Error (frontend):", err);
            }
        };

        verifyUserEmail();
    }, [location]);

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 4,
                    // Pastikan warna kontainer menonjol dari background gelap
                    backgroundColor: theme.palette.background.paper,
                    border: '1px solid ' + theme.palette.grey[800],
                    borderRadius: '8px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                }}
            >
                {verificationStatus === 'loading' && (
                    <>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography variant="h6" color="text.primary">Memverifikasi email Anda...</Typography>
                    </>
                )}
                {verificationStatus === 'success' && (
                    <>
                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" color="success.main" sx={{ mb: 2 }}>
                            Verifikasi Berhasil!
                        </Typography>
                        <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>
                        <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 2 }} color="primary">
                            Login Sekarang
                        </Button>
                    </>
                )}
                {verificationStatus === 'error' && (
                    <>
                        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" color="error.main" sx={{ mb: 2 }}>
                            Verifikasi Gagal!
                        </Typography>
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{message}</Alert>
                        <Button variant="contained" onClick={() => navigate('/register')} sx={{ mt: 2 }} color="primary">
                            Coba Daftar Ulang
                        </Button>
                    </>
                )}
            </Box>
        </Container>
    );
}

export default VerifyEmailPage;