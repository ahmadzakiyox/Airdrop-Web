// src/pages/AirdropDetailPage.jsx
import React from 'react';
import { Typography, Box, Paper, Button, Grid, Chip, CircularProgress, Alert } from '@mui/material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAirdropDetail, deleteAirdrop } from '../api/airdrops.js';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LinkIcon from '@mui/icons-material/Link';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles'; // Import useTheme

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

function AirdropDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const theme = useTheme(); // Panggil useTheme

    const backendBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

    const { data: airdrop, isLoading, isError, error } = useQuery({
        queryKey: ['airdrop', id],
        queryFn: () => getAirdropDetail(id),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAirdrop,
        onSuccess: () => {
            queryClient.invalidateQueries(['airdrops']);
            navigate('/airdrops'); // Redirect setelah hapus
        },
        onError: (err) => {
            console.error("Delete Airdrop Error:", err.response?.data || err.message);
            alert("Gagal menghapus airdrop: " + (err.response?.data?.message || err.message));
        }
    });

    const handleDelete = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus airdrop ini?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.primary' }}>Memuat detail airdrop...</Typography>
            </Box>
        );
    }

    if (isError) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="error">Gagal memuat detail airdrop: {error.message}</Alert>
            </Box>
        );
    }

    if (!airdrop) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="warning">Airdrop tidak ditemukan.</Alert>
                <Button onClick={() => navigate('/airdrops')} sx={{ mt: 2 }}>Kembali ke Daftar Airdrop</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.light', fontWeight: 'bold' }}>
                Detail Airdrop: {airdrop.name}
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={airdrop.screenshot ? 7 : 12}>
                        <Typography variant="h6" sx={{ mb: 1, color: 'primary.light' }}>{airdrop.name}</Typography>
                        <Chip
                            label={airdrop.status.replace('_', ' ')}
                            color={getStatusColor(airdrop.status)}
                            size="small"
                            sx={{ textTransform: 'uppercase', fontWeight: 'bold', mb: 2 }}
                        />
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            {airdrop.description || 'Tidak ada deskripsi.'}
                        </Typography>

                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                Tanggal: {airdrop.startDate ? format(new Date(airdrop.startDate), 'dd MMM yyyy') : 'N/A'}
                                {airdrop.endDate && ` - ${format(new Date(airdrop.endDate), 'dd MMM yyyy')}`}
                            </Typography>
                        </Box>
                        {airdrop.claimDate && (
                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                <CalendarTodayIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Tanggal Klaim: {format(new Date(airdrop.claimDate), 'dd MMM yyyy')}
                                </Typography>
                            </Box>
                        )}

                        {airdrop.expectedValue && (
                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                <AttachMoneyIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Perkiraan Nilai: ${airdrop.expectedValue.toLocaleString()}
                                </Typography>
                            </Box>
                        )}
                        {airdrop.claimedAmount && (
                            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                <AttachMoneyIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Jumlah Diklaim: ${airdrop.claimedAmount.toLocaleString()}
                                </Typography>
                            </Box>
                        )}

                        {airdrop.blockchain && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Blockchain: {airdrop.blockchain}
                            </Typography>
                        )}
                        {airdrop.tokenSymbol && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Simbol Token: {airdrop.tokenSymbol}
                            </Typography>
                        )}
                        {airdrop.contractAddress && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Alamat Kontrak: {airdrop.contractAddress}
                            </Typography>
                        )}
                        {airdrop.link && (
                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                <LinkIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                                <Button
                                    component="a"
                                    href={airdrop.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="small"
                                    variant="text"
                                    color="secondary"
                                    sx={{ textTransform: 'none' }}
                                >
                                    Kunjungi Link Garapan
                                </Button>
                            </Box>
                        )}
                        {airdrop.notes && (
                            <Box sx={{ mt: 2, p: 1.5, bgcolor: theme.palette.grey[900], borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="text.primary">Catatan:</Typography>
                                <Typography variant="body2" color="text.secondary">{airdrop.notes}</Typography>
                            </Box>
                        )}
                    </Grid>
                    {airdrop.screenshot && (
                        <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Box
                                component="img"
                                src={`${backendBaseUrl}${airdrop.screenshot}`}
                                alt="Airdrop Screenshot"
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: '400px',
                                    borderRadius: 2,
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                    objectFit: 'contain'
                                }}
                            />
                        </Grid>
                    )}
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="secondary" component={Link} to={`/airdrops/edit/${airdrop._id}`} sx={{ mr: 2 }}>
                        Edit Airdrop
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleDelete} disabled={deleteMutation.isPending}>
                        Hapus Airdrop
                        {deleteMutation.isPending && <CircularProgress size={20} sx={{ ml: 1 }} />}
                    </Button>
                </Box>
            </Paper>
            <Button variant="text" onClick={() => navigate('/airdrops')} sx={{ mt: 3 }}>
                Kembali ke Daftar Airdrop
            </Button>
        </Box>
    );
}

export default AirdropDetailPage;