// src/pages/RegisterPage.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { TextField, Button, Typography, Container, Box, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // <<< PASTIKAN INI ADA

function RegisterPage() {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const navigate = useNavigate();
    const { registerUser } = useAuth();
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(null);
    const theme = useTheme(); // <<< PASTIKAN INI ADA

    const password = watch("password");

    const onSubmit = async (data) => {
        try {
            setError(null);
            setSuccess(null);
            await registerUser(data);
            setSuccess("Registrasi berhasil! Silakan cek email Anda untuk verifikasi.");
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registrasi gagal. Coba lagi.');
            console.error("Register Error:", err);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 4,
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 3,
                    // Tambahkan safety check opsional jika theme.components atau propertinya mungkin undefined
                    boxShadow: theme.components?.MuiCard?.styleOverrides?.root?.boxShadow || '0 8px 30px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}
            >
                <Typography component="h1" variant="h5" sx={{ mb: 3, color: 'text.primary' }}>
                    Daftar Akun Baru
                </Typography>
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        {...register("username", { required: "Username diperlukan" })}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        {...register("email", { 
                            required: "Email diperlukan",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                message: "Format email tidak valid"
                            }
                        })}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        {...register("password", { 
                            required: "Password diperlukan",
                            minLength: { value: 6, message: "Password minimal 6 karakter" }
                        })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password2"
                        label="Konfirmasi Password"
                        type="password"
                        id="password2"
                        autoComplete="new-password"
                        {...register("password2", {
                            required: "Konfirmasi password diperlukan",
                            validate: value => value === password || "Password tidak cocok"
                        })}
                        error={!!errors.password2}
                        helperText={errors.password2?.message}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2, fontSize: '1.1rem',
                            // Gaya hover akan diambil dari theme.js MuiButton.containedPrimary
                        }}
                    >
                        Daftar
                    </Button>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                            Sudah punya akun? Login di sini.
                        </Typography>
                    </Link>
                </Box>
            </Box>
        </Container>
    );
}

export default RegisterPage;