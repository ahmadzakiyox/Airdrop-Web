// src/components/layout/Navbar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '@mui/material/styles';

function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();
    const theme = useTheme();

    // URL untuk foto profil di navbar (prioritas: dari profil aplikasi, lalu dari Google jika tidak ada)
    const profilePictureUrl = user?.profilePicture ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${user.profilePicture}` : '/default-avatar.png';
    // Jika tidak ada foto profil aplikasi, coba gunakan foto Google dari user object (jika ada dan Anda menyimpannya dari payload Google)
    const displayAvatarUrl = profilePictureUrl !== '/default-avatar.png' ? profilePictureUrl : (user?.picture || '/default-avatar.png');


    return (
        <AppBar position="static">
            <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
                <Typography variant="h6" component="div">
                    <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center',
                            background: theme.palette.metallicGold.gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: `0 0 5px ${theme.palette.metallicGold.main}80`,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                textShadow: `0 0 10px ${theme.palette.metallicGold.main}`,
                            }
                        }}>
                            Airdrop Tracker
                        </Box>
                    </Link>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isAuthenticated ? (
                        <>
                            <Button color="inherit" component={Link} to="/" sx={{ mx: { xs: 0.5, md: 1 }, fontSize: { xs: '0.8rem', md: '1rem' } }}>Dashboard</Button>
                            <Button color="inherit" component={Link} to="/airdrops" sx={{ mx: { xs: 0.5, md: 1 }, fontSize: { xs: '0.8rem', md: '1rem' } }}>Airdrops</Button>
                            <Button color="inherit" component={Link} to="/chat" sx={{ mx: { xs: 0.5, md: 1 }, fontSize: { xs: '0.8rem', md: '1rem' } }}>Chat</Button>
                            <Button color="inherit" component={Link} to="/profile" sx={{ mx: { xs: 0.5, md: 1 }, fontSize: { xs: '0.8rem', md: '1rem' } }}>
                                {displayAvatarUrl && displayAvatarUrl !== '/default-avatar.png' ? (
                                    <Avatar src={displayAvatarUrl} sx={{ width: 24, height: 24, mr: 0.5 }} />
                                ) : (
                                    'Profil' // Atau ikon default jika tidak ada foto
                                )}
                            </Button>
                            
                            {user && user.isAdmin && (
                                <Button color="inherit" component={Link} to="/admin/dashboard" sx={{ mx: { xs: 0.5, md: 1 }, fontSize: { xs: '0.8rem', md: '1rem' }, color: theme.palette.info.light }}>Admin</Button>
                            )}

                            <Button
                                color="inherit"
                                onClick={logout}
                                sx={{
                                    mx: { xs: 0.5, md: 1 },
                                    fontSize: { xs: '0.8rem', md: '1rem' },
                                    '&:hover': {
                                        color: theme.palette.secondary.main,
                                        textShadow: `0 0 8px ${theme.palette.neonGlow.main}`,
                                    }
                                }}
                            >
                                Logout ({user?.username})
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={Link} to="/login" sx={{ mx: { xs: 0.5, md: 1 }, fontSize: { xs: '0.8rem', md: '1rem' } }}>Login</Button>
                            <Button color="inherit" component={Link} to="/register" sx={{ mx: { xs: 0.5, md: 1 }, fontSize: { xs: '0.8rem', md: '1rem' } }}>Register</Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;