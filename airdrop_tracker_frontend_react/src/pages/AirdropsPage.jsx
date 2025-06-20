// src/pages/AirdropsPage.jsx
import React from 'react';
import { Typography, Box, Button, Grid, CircularProgress, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAirdrops } from '../api/airdrops.js';
import AirdropCard from '../components/airdrops/AirdropCard.jsx';
import { useTheme } from '@mui/material/styles'; // Import useTheme

function AirdropsPage() {
    const theme = useTheme(); // Panggil useTheme
    const { data: airdrops, isLoading, isError, error } = useQuery({
        queryKey: ['airdrops'],
        queryFn: getAirdrops,
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.primary' }}>Memuat airdrop...</Typography>
            </Box>
        );
    }

    if (isError) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="error">Gagal memuat airdrop: {error.message}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.light', fontWeight: 'bold' }}>
                    Daftar Airdrop Anda
                </Typography>
                <Button variant="contained" color="secondary" component={Link} to="/airdrops/add">
                    Tambah Airdrop Baru
                </Button>
            </Box>

            {airdrops.length === 0 ? (
                <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>
                    Anda belum mencatat airdrop apapun. Mulailah dengan menambahkan yang pertama!
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {airdrops.map((airdrop) => (
                        <Grid item xs={12} sm={6} md={4} key={airdrop._id}>
                            <AirdropCard airdrop={airdrop} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

export default AirdropsPage;