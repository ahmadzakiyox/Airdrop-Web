// src/pages/UserManagementPage.jsx
import React from 'react';
import { Typography, Box, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Switch, FormControlLabel } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axiosConfig'; // Gunakan axios yang sudah dikonfigurasi
import { useTheme } from '@mui/material/styles';

// API Functions for User Management
const getAllUsers = async () => {
    // --- UBAH DARI '/api/admin/users' MENJADI '/admin/users' ---
    const response = await axios.get('/admin/users'); // Permintaan yang benar
    return response.data;
};

const updateUserRole = async ({ id, isAdmin, emailVerified }) => {
    const response = await axios.put(`/api/admin/users/${id}/role`, { isAdmin, emailVerified });
    return response.data;
};

const deleteUser = async (id) => {
    const response = await axios.delete(`/api/admin/users/${id}`);
    return response.data;
};


function UserManagementPage() {
    const theme = useTheme();
    const queryClient = useQueryClient();

    const { data: users, isLoading, isError, error } = useQuery({
        queryKey: ['adminAllUsers'],
        queryFn: getAllUsers,
    });

    const updateRoleMutation = useMutation({
        mutationFn: updateUserRole,
        onSuccess: () => {
            queryClient.invalidateQueries(['adminAllUsers']);
            alert('Peran pengguna berhasil diperbarui!');
        },
        onError: (err) => {
            console.error('Error updating user role:', err.response?.data || err);
            alert('Gagal memperbarui peran pengguna: ' + (err.response?.data?.message || err.message));
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['adminAllUsers']);
            alert('Pengguna berhasil dihapus!');
        },
        onError: (err) => {
            console.error('Error deleting user:', err.response?.data || err);
            alert('Gagal menghapus pengguna: ' + (err.response?.data?.message || err.message));
        }
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2, color: 'text.primary' }}>Memuat pengguna...</Typography>
            </Box>
        );
    }
    if (isError) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="error">Gagal memuat pengguna: {error.message}.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.light', fontWeight: 'bold' }}>
                Kelola Pengguna
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                {users.length === 0 ? (
                    <Typography variant="h6" color="text.secondary">Tidak ada pengguna terdaftar.</Typography>
                ) : (
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="user management table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Username</TableCell>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Admin</TableCell>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Verified</TableCell>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ color: 'text.secondary' }}>{user.username}</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>{user.email}</TableCell>
                                        <TableCell>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={user.isAdmin}
                                                        onChange={(e) => updateRoleMutation.mutate({ id: user._id, isAdmin: e.target.checked })}
                                                        color="primary"
                                                        disabled={updateRoleMutation.isPending}
                                                    />
                                                }
                                                label={user.isAdmin ? "Ya" : "Tidak"}
                                                sx={{ color: 'text.secondary' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={user.emailVerified}
                                                        onChange={(e) => updateRoleMutation.mutate({ id: user._id, emailVerified: e.target.checked })}
                                                        color="secondary"
                                                        disabled={updateRoleMutation.isPending}
                                                    />
                                                }
                                                label={user.emailVerified ? "Ya" : "Tidak"}
                                                sx={{ color: 'text.secondary' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => { if (window.confirm(`Yakin ingin menghapus ${user.username}?`)) deleteUserMutation.mutate(user._id); }}
                                                disabled={deleteUserMutation.isPending}
                                            >
                                                Hapus
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
}

export default UserManagementPage;