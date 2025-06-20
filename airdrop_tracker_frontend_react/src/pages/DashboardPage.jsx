// src/pages/DashboardPage.jsx
import React from 'react';
import { Typography, Box, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getAirdropStatusSummary } from '../api/airdrops.js';
import { PieChart, BarChart } from '../components/dashboard/Charts.jsx'; // Nanti kita buat file ini

function DashboardPage() {
    const { data: summary, isLoading, isError, error } = useQuery({
        queryKey: ['airdropStatusSummary'],
        queryFn: getAirdropStatusSummary,
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Memuat ringkasan dashboard...</Typography>
            </Box>
        );
    }

    if (isError) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="error">Gagal memuat ringkasan: {error.message}</Alert>
            </Box>
        );
    }

    // Ubah data summary menjadi format yang bisa digunakan oleh Chart.js
    const chartData = {
        labels: Object.keys(summary),
        datasets: [{
            data: Object.values(summary),
            backgroundColor: [
                '#673ab7', // deepPurple (TODO)
                '#2196f3', // blue (IN_PROGRESS)
                '#4caf50', // green (COMPLETED)
                '#00bcd4', // cyan (CLAIMED)
                '#f44336', // red (MISSED)
                '#ff9800', // orange (RESEARCH)
            ],
            borderColor: '#121212',
            borderWidth: 1,
        }],
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.light', fontWeight: 'bold' }}>
                Dashboard Anda
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>Ringkasan Status Airdrop</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {summary && Object.values(summary).some(count => count > 0) ? (
                                <PieChart data={chartData} />
                            ) : (
                                <Typography variant="body1" color="text.secondary">
                                    Belum ada data airdrop untuk ditampilkan di grafik.
                                </Typography>
                            )}
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Ini adalah ringkasan visual dari airdrop Anda berdasarkan status.
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {Object.keys(summary).map(status => (
                                <Typography key={status} variant="body2" color="text.secondary">
                                    {status.replace('_', ' ')}: {summary[status]}
                                </Typography>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
            {/* Anda bisa menambahkan bagian lain seperti airdrop terbaru di sini */}
        </Box>
    );
}

export default DashboardPage;