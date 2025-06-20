// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress, Divider } from '@mui/material'; // Tambah Divider
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { styled, useTheme } from '@mui/material/styles';
import { GoogleLogin } from '@react-oauth/google'; // <<< PENTING
import { googleLoginAuthCode } from '../api/auth.js'; // <<< PENTING

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
    maxWidth: 400,
    width: '100%',
}));

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser, isAuthenticated, user, setUser, setIsAuthenticated } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        if (isAuthenticated) {
            if (user && user.isAdmin) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await loginUser({ email, password });
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const googleSuccess = async (response) => { // <<< Callback sukses Google
        try {
            setError(null);
            console.log('Google login success response:', response);
            const res = await googleLoginAuthCode(response.code); // Kirim code ke backend
            
            localStorage.setItem('access_token', res.data.token);
            setUser(res.data.user); // Update user di context dengan data dari backend
            setIsAuthenticated(true);
            // Redirection akan ditangani oleh useEffect
        } catch (err) {
            setError(err.response?.data?.message || 'Login dengan Google gagal. Coba lagi.');
            console.error("Google Login Error:", err);
        }
    };

    const googleError = (errorResponse) => { // <<< Callback error Google
        console.error('Google login error:', errorResponse);
        setError('Login dengan Google dibatalkan atau gagal.');
    };

    if (isAuthenticated) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'text.primary' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Mengarahkan...</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.palette.background.default,
                padding: theme.spacing(2),
            }}
        >
            <StyledPaper>
                <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Login
                </Typography>
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        sx={{
                            '& .MuiInputBase-input': { color: theme.palette.text.primary },
                            '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.grey[700] },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                        }}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        sx={{
                            '& .MuiInputBase-input': { color: theme.palette.text.primary },
                            '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.grey[700] },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                    </Button>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                    Belum punya akun? <Link to="/register" style={{ color: theme.palette.primary.light, textDecoration: 'none' }}>Daftar di sini</Link>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                    <Link to="/verify-email" style={{ color: theme.palette.primary.light, textDecoration: 'none' }}>Verifikasi Email</Link>
                </Typography>

                <Divider sx={{ my: 3, width: '100%', bgcolor: 'text.secondary' }}>OR</Divider>

                <Box sx={{ mt: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={googleSuccess}
                        onError={googleError}
                        text="signin_with"
                        size="large"
                        width="250px"
                        theme="filled_blue"
                        type="standard"
                        ux_mode="popup"
                        flow="auth-code"
                    />
                </Box>
            </StyledPaper>
        </Box>
    );
}

export default LoginPage;