// airdrop_tracker_frontend_react/src/components/layout/Footer.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function Footer() {
    const theme = useTheme();
    return (
        <Box sx={{ p: 2, bgcolor: theme.palette.background.paper, color: 'white', textAlign: 'center', mt: 4, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="body2" color="text.secondary">
                &copy; {new Date().getFullYear()} Airdrop Tracker. All rights reserved.
            </Typography>
        </Box>
    );
}

export default Footer;