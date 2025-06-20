// src/pages/UserProfilePage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Box, Paper, TextField, Button, CircularProgress, Alert, Avatar, FormControlLabel, Checkbox, Grid, Chip } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import { updateUserProfile } from '../api/auth.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@mui/material/styles';

function UserProfilePage() {
    const { user, setUser } = useAuth();
    const queryClient = useQueryClient();
    const theme = useTheme();

    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [clearProfilePicture, setClearProfilePicture] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm({
        defaultValues: {
            username: user?.username || '',
            email: user?.email || '',
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            profilePicture: null,
        },
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const newPassword = watch('newPassword');
    const profilePictureFile = watch('profilePicture'); // watch ini untuk input file

    // Hitung `canSubmit` di sini menggunakan `useMemo`
    const canSubmit = useMemo(() => {
        if (isDirty) return true; // Jika ada perubahan di field form biasa
        
        // Perubahan khusus untuk file atau password (yang mungkin tidak selalu memicu isDirty)
        if (newPassword && newPassword.length > 0) return true; // Jika password baru diisi
        if (profilePictureFile && profilePictureFile.length > 0) return true; // Jika file baru dipilih
        if (clearProfilePicture && user?.profilePicture) return true; // Jika opsi hapus foto dicentang
        
        return false;
    }, [isDirty, newPassword, profilePictureFile, clearProfilePicture, user?.profilePicture]);


    // Update preview gambar saat file dipilih atau status hapus berubah
    useEffect(() => {
        if (profilePictureFile && profilePictureFile.length > 0) {
            const file = profilePictureFile[0];
            setProfilePicturePreview(URL.createObjectURL(file));
        } else if (user?.profilePicture && !clearProfilePicture) {
            setProfilePicturePreview(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${user.profilePicture}`);
        } else {
            setProfilePicturePreview(null);
        }
    }, [profilePictureFile, user?.profilePicture, clearProfilePicture]);


    // Reset form dengan data user saat ini jika user berubah atau komponen dimuat
    useEffect(() => {
        if (user) {
            reset({
                username: user.username,
                email: user.email,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
                profilePicture: null,
            });
            setProfilePicturePreview(null);
            setClearProfilePicture(false);
        }
    }, [user, reset]);

    const updateProfileMutation = useMutation({
        mutationFn: updateUserProfile, // Fungsi API yang akan mengirim FormData
        onSuccess: (data) => {
            setUser(data.user); // Update user di AuthContext
            queryClient.invalidateQueries(['userProfile']);
            alert('Profil berhasil diperbarui!');
            reset({ ...data.user, currentPassword: '', newPassword: '', confirmNewPassword: '', profilePicture: null });
            setProfilePicturePreview(null);
            setClearProfilePicture(false);
        },
        onError: (err) => {
            console.error('Update Profile Error:', err.response?.data || err.message);
            alert('Gagal memperbarui profil: ' + (err.response?.data?.message || err.message));
        }
    });

    // Fungsi onSubmit ini yang paling KRITIS
    const onSubmit = (data) => {
        const payload = {};
        // isAnySpecialFieldChanged sekarang digantikan oleh canSubmit

        // Cek perubahan username
        if (data.username !== user?.username) {
            payload.username = data.username;
        }

        // Cek perubahan password
        if (data.newPassword) { 
            if (!data.currentPassword) {
                alert('Kata sandi saat ini diperlukan.');
                return;
            }
            if (data.newPassword !== data.confirmNewPassword) {
                alert('Kata sandi tidak cocok.');
                return;
            }
            payload.currentPassword = data.currentPassword;
            payload.newPassword = data.newPassword;
        }

        // Cek perubahan foto profil
        // PENTING: Kirim `profilePictureFile` yang merupakan FileList dari watch()
        if (profilePictureFile && profilePictureFile.length > 0) {
            payload.profilePicture = profilePictureFile; // Ini adalah FileList
        } else if (clearProfilePicture && user?.profilePicture) {
            payload.clearProfilePicture = 'true';
        }

        console.log('Frontend: Final Payload yang akan dikirim:', payload); // LOG PAYLOAD FINAL
        console.log('Frontend: isDirty dari form:', isDirty);
        console.log('Frontend: canSubmit (dari useMemo):', canSubmit); // Log status tombol

        // Kirim hanya jika `canSubmit` adalah true
        if (canSubmit) {
            updateProfileMutation.mutate(payload);
        } else {
            alert('Tidak ada perubahan untuk disimpan.');
        }
    };

    const currentProfilePictureUrl = profilePicturePreview || (user?.profilePicture ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${user.profilePicture}` : '/default-avatar.png');


    // Dapatkan string Role yang deskriptif
    const getUserRoleString = () => {
        if (user?.isAdmin) return 'Admin';
        if (user?.emailVerified) return 'Pengguna Terverifikasi';
        return 'Pengguna Biasa';
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.light', fontWeight: 'bold' }}>
                Edit Profil
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                    <Grid container spacing={3} alignItems="center">
                        {/* Avatar dan Upload Foto */}
                        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Avatar
                                src={currentProfilePictureUrl}
                                sx={{ width: 120, height: 120, mb: 2, border: `2px solid ${theme.palette.primary.main}` }}
                            />
                            <Button
                                variant="contained"
                                component="label"
                                color="secondary"
                                sx={{ mb: 1 }}
                            >
                                {profilePicturePreview || (user?.profilePicture && !clearProfilePicture) ? 'Ganti Foto' : 'Upload Foto'}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    {...register("profilePicture")}
                                />
                            </Button>
                            {(user?.profilePicture || profilePicturePreview) && (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={clearProfilePicture}
                                            onChange={(e) => {
                                                setClearProfilePicture(e.target.checked);
                                                if (e.target.checked) {
                                                    setProfilePicturePreview(null);
                                                } else if (profilePictureFile && profilePictureFile.length > 0) {
                                                     setProfilePicturePreview(URL.createObjectURL(profilePictureFile[0]));
                                                } else if (user?.profilePicture) {
                                                    setProfilePicturePreview(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${user.profilePicture}`);
                                                }
                                            }}
                                            color="error"
                                        />
                                    }
                                    label="Hapus Foto Profil Saat Ini"
                                    sx={{ color: theme.palette.text.secondary }}
                                />
                            )}
                            {errors.profilePicture && <Alert severity="error">{errors.profilePicture.message}</Alert>}
                        </Grid>

                        {/* Detail Profil, Password, Role, Level */}
                        <Grid item xs={12} md={8}>
                            <TextField
                                label="Username"
                                fullWidth
                                margin="normal"
                                {...register("username", { required: 'Username diperlukan' })}
                                error={!!errors.username}
                                helperText={errors.username?.message}
                            />
                            <TextField
                                label="Email"
                                fullWidth
                                margin="normal"
                                value={user?.email || ''}
                                disabled
                                sx={{ '& .MuiInputBase-input': { color: theme.palette.text.secondary + ' !important' } }}
                            />
                            {/* Menampilkan Role */}
                            <Typography variant="body1" sx={{ mt: 2, color: 'text.primary' }}>
                                Role: <Chip label={getUserRoleString()} color={user?.isAdmin ? 'primary' : 'default'} size="small" />
                            </Typography>
                            {/* Menampilkan Level */}
                            <Typography variant="body1" sx={{ mt: 1, color: 'text.primary' }}>
                                Level: <Chip label={`Level ${user?.level || 1}`} color="secondary" size="small" />
                            </Typography>


                            <Typography variant="h6" sx={{ mt: 3, mb: 1, color: 'text.primary' }}>Ubah Kata Sandi (opsional)</Typography>
                            <TextField
                                label="Kata Sandi Saat Ini"
                                type="password"
                                fullWidth
                                margin="normal"
                                {...register("currentPassword", {
                                    validate: (value) => {
                                        if (newPassword && !value) return 'Kata sandi saat ini diperlukan.';
                                        return true;
                                    }
                                })}
                                error={!!errors.currentPassword}
                                helperText={errors.currentPassword?.message}
                            />
                            <TextField
                                label="Kata Sandi Baru"
                                type="password"
                                fullWidth
                                margin="normal"
                                {...register("newPassword", {
                                    minLength: { value: 6, message: 'Kata sandi baru minimal 6 karakter.' },
                                })}
                                error={!!errors.newPassword}
                                helperText={errors.newPassword?.message}
                            />
                            <TextField
                                label="Konfirmasi Kata Sandi Baru"
                                type="password"
                                fullWidth
                                margin="normal"
                                {...register("confirmNewPassword", {
                                    validate: (value) => {
                                        if (newPassword && value !== newPassword) return 'Kata sandi tidak cocok.';
                                        return true;
                                    }
                                })}
                                error={!!errors.confirmNewPassword}
                                helperText={errors.confirmNewPassword?.message}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ mr: 2 }}
                            disabled={updateProfileMutation.isPending || !canSubmit}
                        >
                            {updateProfileMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Simpan Perubahan'}
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => reset()}
                        >
                            Reset
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default UserProfilePage;