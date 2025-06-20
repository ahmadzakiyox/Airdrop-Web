// airdrop_tracker_frontend_react/src/components/layout/Layout.jsx
import React from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { Container, Box } from '@mui/material';

function Layout({ children }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Container
                component="main"
                maxWidth="xl" // Menggunakan 'xl' untuk lebar maksimum di layar sangat besar
                sx={{ flexGrow: 1, py: 4 }}
            >
                {children}
            </Container>
            <Footer />
        </Box>
    );
}

export default Layout;