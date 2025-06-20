// src/components/layout/AdminLayout.jsx
import React, { useState } from 'react';
import {
    Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Typography, IconButton, Container, Button // <--- TAMBAHKAN BUTTON DI SINI
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: `-${drawerWidth}px`,
        ...(open && {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
        }),
    }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        ...(open && {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: `${drawerWidth}px`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }),
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.components.MuiAppBar.styleOverrides.root.boxShadow,
        borderBottom: theme.components.MuiAppBar.styleOverrides.root.borderBottom,
    }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));


function AdminLayout({ children }) {
    const theme = useTheme();
    const [open, setOpen] = useState(true);
    const location = useLocation();

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const { user, logout } = useAuth();

    if (!user || !user.isAdmin) {
        return <Typography variant="h6" color="error" sx={{m: 3}}>Akses ditolak. Anda bukan admin.</Typography>;
    }

    const adminNavItems = [
        { text: 'Dashboard Admin', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Kelola Pengguna', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Kelola Semua Airdrop', icon: <CloudDownloadIcon />, path: '/admin/airdrops' },
    ];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
            <AppBarStyled position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(open && { display: 'none' }) }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: theme.palette.text.primary }}>
                        Admin Panel
                    </Typography>
                    <Typography variant="body1" sx={{ mr: 2, color: theme.palette.text.secondary }}>
                        Halo, {user.username} (Admin)
                    </Typography>
                    <Button color="inherit" onClick={logout} sx={{ color: theme.palette.secondary.main }}>Logout</Button>
                </Toolbar>
            </AppBarStyled>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: theme.palette.background.paper,
                        borderRight: `1px solid ${theme.palette.grey[800]}`,
                        boxShadow: '4px 0px 15px rgba(0,0,0,0.3)',
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1, color: theme.palette.primary.main, ml: 2 }}>
                        Admin Menu
                    </Typography>
                    <IconButton onClick={handleDrawerClose} sx={{ color: theme.palette.text.secondary }}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </DrawerHeader>
                <List>
                    {adminNavItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                selected={location.pathname === item.path}
                                sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: theme.palette.primary.dark,
                                        color: theme.palette.common.white,
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.main,
                                        }
                                    },
                                    '&:hover': {
                                        backgroundColor: theme.palette.grey[800],
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.common.white : theme.palette.text.secondary }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} sx={{ color: location.pathname === item.path ? theme.palette.common.white : theme.palette.text.primary }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Main open={open} sx={{ mt: '64px', width: '100%' }}>
                <Container maxWidth="xl" sx={{ p: { xs: 2, md: 3 } }}>
                    {children}
                </Container>
            </Main>
        </Box>
    );
}

export default AdminLayout;