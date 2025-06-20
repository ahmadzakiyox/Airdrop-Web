// src/components/airdrops/AirdropCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LinkIcon from '@mui/icons-material/Link';
import { format } from 'date-fns';

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  // Background dengan gradien halus atau pola abstrak
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(26,26,26,0.8) 100%)`,
  // Border tipis dengan sedikit glow
  border: `1px solid rgba(255, 255, 255, 0.08)`,
  boxShadow: '0 12px 40px rgba(0,0,0,0.6)', // Shadow lebih dalam
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)', // Efek angkat lebih jelas saat hover
    boxShadow: `0 18px 60px rgba(0,0,0,0.8), 0 0 25px ${theme.palette.neonGlow.primaryGlow}`, // Shadow & glow saat hover
    borderColor: theme.palette.primary.main, // Border berubah saat hover
  },
  // Efek kilau internal (opsional, bisa sangat subtle)
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `radial-gradient(circle at top right, ${theme.palette.primary.dark} 0%, transparent 40%)`,
    opacity: 0.05, // Sangat subtle
    zIndex: 0,
    pointerEvents: 'none',
  },
}));

// Fungsi untuk mendapatkan warna chip berdasarkan status
const getStatusColor = (status) => {
    switch (status) {
        case 'TODO': return 'default'; // Akan mengambil gaya dari theme.components.MuiChip
        case 'IN_PROGRESS': return 'info';
        case 'COMPLETED': return 'success';
        case 'CLAIMED': return 'primary';
        case 'MISSED': return 'error';
        case 'RESEARCH': return 'warning';
        default: return 'default';
    }
};

function AirdropCard({ airdrop }) {
    const theme = useTheme(); // Panggil useTheme
    const backendBaseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

    return (
        <StyledCard>
            {airdrop.screenshot && (
                <Box
                    sx={{
                        height: 150,
                        backgroundImage: `url(${backendBaseUrl}${airdrop.screenshot})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        filter: 'brightness(0.7)',
                    }}
                />
            )}
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ color: theme.palette.primary.light, fontWeight: 'bold' }}>
                        {airdrop.name}
                    </Typography>
                    <Chip
                        label={airdrop.status.replace('_', ' ')}
                        color={getStatusColor(airdrop.status)}
                        size="small"
                        sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
                    />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {airdrop.description ? airdrop.description.substring(0, 80) + (airdrop.description.length > 80 ? '...' : '') : 'Tidak ada deskripsi.'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarTodayIcon sx={{ mr: 1, fontSize: 'small', color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="text.secondary">
                        {airdrop.startDate ? format(new Date(airdrop.startDate), 'dd MMM yyyy') : 'N/A'}
                        {airdrop.endDate && ` - ${format(new Date(airdrop.endDate), 'dd MMM yyyy')}`}
                    </Typography>
                </Box>

                {airdrop.expectedValue && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AttachMoneyIcon sx={{ mr: 1, fontSize: 'small', color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary">
                            Perkiraan: ${airdrop.expectedValue.toLocaleString()}
                        </Typography>
                    </Box>
                )}

                {airdrop.blockchain && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" sx={{ mr: 1, color: theme.palette.text.secondary }}>🌐</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Blockchain: {airdrop.blockchain}
                        </Typography>
                    </Box>
                )}

                {airdrop.link && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LinkIcon sx={{ mr: 1, fontSize: 'small', color: theme.palette.text.secondary }} />
                        <Button
                            component="a"
                            href={airdrop.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            variant="text"
                            color="secondary"
                            sx={{
                                textTransform: 'none',
                                '&:hover': {
                                    textDecoration: 'underline',
                                    color: theme.palette.secondary.light,
                                    textShadow: `0 0 5px ${theme.palette.secondary.main}40`
                                }
                            }}
                        >
                            Kunjungi Link
                        </Button>
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        component={Link}
                        to={`/airdrops/${airdrop._id}`}
                        color="primary" // Menggunakan warna primary dari tema
                    >
                        Detail
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        color="secondary"
                        component={Link}
                        to={`/airdrops/edit/${airdrop._id}`}
                    >
                        Edit
                    </Button>
                </Box>
            </CardContent>
        </StyledCard>
    );
}

export default AirdropCard;