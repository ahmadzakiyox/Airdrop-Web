// src/pages/AdminDashboardPage.jsx
import React from 'react';
import { Typography, Box, Paper, CircularProgress, Alert, Grid, Button, Card, CardContent, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../api/axiosConfig';
import { getAirdrops } from '../api/airdrops.js';
import { useTheme } from '@mui/material/styles';

// Import komponen Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Daftarkan komponen Chart.js yang dibutuhkan
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const getAdminDashboardStats = async () => {
    // Fetches all users and airdrops
    const [usersRes, airdropsRes] = await Promise.all([
        axios.get('/admin/users'), // <<< Pastikan ini '/admin/users', BUKAN '/api/admin/users'
        getAirdrops(), // As admin, this will fetch all airdrops
    ]);

    const totalUsers = usersRes.data.length;
    const verifiedUsers = usersRes.data.filter(u => u.emailVerified).length;
    const adminUsers = usersRes.data.filter(u => u.isAdmin).length;

    const totalAirdrops = airdropsRes.length;
    const globalAirdropStatusSummary = airdropsRes.reduce((acc, airdrop) => {
        acc[airdrop.status] = (acc[airdrop.status] || 0) + 1;
        return acc;
    }, {});

    const allStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CLAIMED', 'MISSED', 'RESEARCH'];
    allStatuses.forEach(status => {
        if (!globalAirdropStatusSummary[status]) {
            globalAirdropStatusSummary[status] = 0;
        }
    });

    return {
        totalUsers, verifiedUsers, adminUsers, totalAirdrops,
        globalAirdropStatusSummary,
    };
};

// Helper untuk warna Chip di Dashboard
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

function AdminDashboardPage() {
    const theme = useTheme();
    const { data: stats, isLoading, isError, error } = useQuery({
        queryKey: ['adminDashboardStats'],
        queryFn: getAdminDashboardStats,
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2, color: 'text.primary' }}>Memuat data admin...</Typography>
            </Box>
        );
    }
    if (isError) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="error">Gagal memuat data admin: {error.message}. Pastikan Anda login sebagai admin.</Alert>
                <Button onClick={() => window.location.reload()} sx={{ mt: 2 }} variant="contained">Coba Lagi</Button>
            </Box>
        );
    }

    // --- Data dan Opsi untuk Grafik ---
    // Data Placeholder mirip CoreUI
    const trafficChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Views',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                borderColor: theme.palette.primary.light,
                backgroundColor: theme.palette.primary.light,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: theme.palette.primary.main,
                pointBorderColor: theme.palette.background.paper,
                pointHoverRadius: 7,
            },
            {
                label: 'Unique',
                data: [20, 30, 45, 40, 50, 45, 30],
                fill: false,
                borderColor: theme.palette.success.main,
                backgroundColor: theme.palette.success.main,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: theme.palette.success.main,
                pointBorderColor: theme.palette.background.paper,
                pointHoverRadius: 7,
            },
        ],
    };

    const trafficChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: theme.palette.text.secondary,
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: theme.palette.background.paper,
                titleColor: theme.palette.text.primary,
                bodyColor: theme.palette.text.secondary,
                borderColor: theme.palette.grey[700],
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                ticks: { color: theme.palette.text.secondary },
                grid: { color: theme.palette.grey[800] },
                border: { color: theme.palette.grey[700] },
            },
            y: {
                ticks: { color: theme.palette.text.secondary },
                grid: { color: theme.palette.grey[800] },
                border: { color: theme.palette.grey[700] },
            },
        },
    };

    const userOverviewChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'New Users',
                backgroundColor: theme.palette.info.main,
                borderColor: theme.palette.info.main,
                borderWidth: 1,
                data: [20, 30, 25, 40, 35, 50, 45, 60, 55, 70, 65, 80],
            },
        ],
    };

    const userOverviewChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: theme.palette.text.secondary,
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: theme.palette.background.paper,
                titleColor: theme.palette.text.primary,
                bodyColor: theme.palette.text.secondary,
                borderColor: theme.palette.grey[700],
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                ticks: { color: theme.palette.text.secondary },
                grid: { color: theme.palette.grey[800] },
                border: { color: theme.palette.grey[700] },
            },
            y: {
                ticks: { color: theme.palette.text.secondary },
                grid: { color: theme.palette.grey[800] },
                border: { color: theme.palette.grey[700] },
            },
        },
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.light', fontWeight: 'bold', mb: 4 }}>
                Dashboard Admin
            </Typography>

            {/* Bagian Kartu Statistik Atas (mirip CoreUI) */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ ...theme.components.MuiCard.styleOverrides.root, background: theme.palette.primary.dark }}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Total Pengguna
                            </Typography>
                            <Typography variant="h5" sx={{ color: 'common.white', fontWeight: 'bold' }}>
                                {stats.totalUsers}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                <span style={{ color: theme.palette.success.main }}>+12.4%</span> Sejak Bulan Lalu
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ ...theme.components.MuiCard.styleOverrides.root, background: theme.palette.info.dark }}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Airdrop Total
                            </Typography>
                            <Typography variant="h5" sx={{ color: 'common.white', fontWeight: 'bold' }}>
                                {stats.totalAirdrops}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                <span style={{ color: theme.palette.error.main }}>-5.1%</span> Dibanding Bulan Lalu
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ ...theme.components.MuiCard.styleOverrides.root, background: theme.palette.success.dark }}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Airdrop Selesai
                            </Typography>
                            <Typography variant="h5" sx={{ color: 'common.white', fontWeight: 'bold' }}>
                                {stats.globalAirdropStatusSummary['COMPLETED']}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                <span style={{ color: theme.palette.success.main }}>+8.2%</span> Minggu Ini
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ ...theme.components.MuiCard.styleOverrides.root, background: theme.palette.error.dark }}>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Airdrop Terlewat
                            </Typography>
                            <Typography variant="h5" sx={{ color: 'common.white', fontWeight: 'bold' }}>
                                {stats.globalAirdropStatusSummary['MISSED']}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                <span style={{ color: theme.palette.error.main }}>+1.5%</span> Hari Ini
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Bagian Grafik Traffic */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom color="text.primary">
                    Traffic (Placeholder Data)
                </Typography>
                <Box sx={{ height: 350, width: '100%' }}>
                    <Line data={trafficChartData} options={trafficChartOptions} />
                </Box>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom color="text.primary">
                            Ringkasan Pengguna (Placeholder Data)
                        </Typography>
                        <Box sx={{ height: 300, width: '100%' }}>
                            <Bar data={userOverviewChartData} options={userOverviewChartOptions} />
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom color="text.primary">
                            Ringkasan Status Airdrop Global
                        </Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {stats.totalAirdrops > 0 ? (
                                <Pie data={
                                    {
                                        labels: Object.keys(stats.globalAirdropStatusSummary).map(s => s.replace('_', ' ')),
                                        datasets: [{
                                            data: Object.values(stats.globalAirdropStatusSummary),
                                            backgroundColor: [
                                                theme.palette.primary.main, // TODO
                                                theme.palette.info.main, // IN_PROGRESS
                                                theme.palette.success.main, // COMPLETED
                                                theme.palette.secondary.main, // CLAIMED
                                                theme.palette.error.main, // MISSED
                                                theme.palette.warning.main, // RESEARCH
                                            ],
                                            borderColor: theme.palette.background.default,
                                            borderWidth: 2,
                                        }],
                                    }
                                } options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                            labels: {
                                                color: theme.palette.text.secondary,
                                            },
                                        },
                                        tooltip: {
                                            backgroundColor: theme.palette.background.paper,
                                            titleColor: theme.palette.text.primary,
                                            bodyColor: theme.palette.text.secondary,
                                            borderColor: theme.palette.grey[700],
                                            borderWidth: 1,
                                        },
                                    },
                                }} />
                            ) : (
                                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                                    Belum ada data airdrop global untuk ditampilkan di grafik.
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Tombol navigasi ke halaman manajemen */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 4 }}>
                <Button variant="contained" color="primary" component={Link} to="/admin/users" sx={{ flex: 1 }}>
                    Kelola Pengguna
                </Button>
                <Button variant="contained" color="secondary" component={Link} to="/admin/airdrops" sx={{ flex: 1 }}>
                    Kelola Semua Airdrop
                </Button>
            </Box>
        </Box>
    );
}

export default AdminDashboardPage;