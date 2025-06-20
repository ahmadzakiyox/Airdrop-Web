// src/pages/AllAirdropsManagementPage.jsx
import React from 'react';
import { Typography, Box, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axiosConfig';
import { getAirdrops, deleteAirdrop } from '../api/airdrops.js'; // getAirdrops sudah diupdate di backend untuk admin
import { Link } from 'react-router-dom';
import { format } from 'date-fns'; // Import fungsi format dari date-fns
import { useTheme } from '@mui/material/styles';

const getStatusColor = (status) => {
    switch (status) {
        case 'TODO': return 'default';
        case 'IN_PROGRESS': return 'info';
        case 'COMPLETED': return 'success';
        case 'CLAIMED': return 'primary';
        case 'MISSED': return 'error';
        case 'RESEARCH': return 'warning';
        default: return 'default';
    }
};

function AllAirdropsManagementPage() {
    const theme = useTheme();
    const queryClient = useQueryClient();

    // getAirdrops di api/airdrops.js sudah diupdate untuk mengizinkan admin melihat semua
    const { data: airdrops, isLoading, isError, error } = useQuery({
        queryKey: ['adminAllAirdrops'],
        queryFn: getAirdrops,
    });

    const deleteAirdropMutation = useMutation({
        mutationFn: deleteAirdrop,
        onSuccess: () => {
            queryClient.invalidateQueries(['adminAllAirdrops']);
            alert('Airdrop berhasil dihapus!');
        },
        onError: (err) => {
            console.error('Error deleting airdrop:', err.response?.data || err);
            alert('Gagal menghapus airdrop: ' + (err.response?.data?.message || err.message));
        }
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2, color: 'text.primary' }}>Memuat semua airdrop...</Typography>
            </Box>
        );
    }
    if (isError) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="error">Gagal memuat semua airdrop: {error.message}.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.light', fontWeight: 'bold' }}>
                Kelola Semua Airdrop
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                {airdrops.length === 0 ? (
                    <Typography variant="h6" color="text.secondary">Tidak ada airdrop terdaftar.</Typography>
                ) : (
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="all airdrops management table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Nama</TableCell>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Pengguna</TableCell>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Blockchain</TableCell>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Perkiraan Nilai</TableCell>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Tanggal Berakhir</TableCell>
                                    <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {airdrops.map((airdrop) => (
                                    <TableRow key={airdrop._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ color: 'text.secondary' }}>
                                            <Link to={`/airdrops/${airdrop._id}`} style={{ color: theme.palette.primary.light, textDecoration: 'none' }}>
                                                {airdrop.name}
                                            </Link>
                                        </TableCell>
                                        {/* Untuk menampilkan username, backend perlu populate user di airdropController.js */}
                                        <TableCell sx={{ color: 'text.secondary' }}>{airdrop.user ? airdrop.user.username : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip label={airdrop.status.replace('_', ' ')} color={getStatusColor(airdrop.status)} size="small" />
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>{airdrop.blockchain || 'N/A'}</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>${airdrop.expectedValue ? airdrop.expectedValue.toLocaleString() : 'N/A'}</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>
                                            {/* --- KOREKSI PENTING DI SINI: GUNAKAN 'yyyy' --- */}
                                            {airdrop.endDate ? format(new Date(airdrop.endDate), 'dd MMM yyyy') : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                size="small"
                                                component={Link}
                                                to={`/airdrops/edit/${airdrop._id}`}
                                                sx={{ mr: 1 }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => { if (window.confirm(`Yakin ingin menghapus airdrop '${airdrop.name}'?`)) deleteAirdropMutation.mutate(airdrop._id); }}
                                                disabled={deleteAirdropMutation.isPending}
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

export default AllAirdropsManagementPage;