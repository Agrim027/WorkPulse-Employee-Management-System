import React, { useState } from 'react';
import { Box, Toolbar, Container, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar onMobileDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />

        <Container maxWidth="xl" sx={{ flexGrow: 1, py: 2 }}>
          <Outlet />
        </Container>

        <Box component="footer" sx={{ py: 2, textAlign: 'center', mt: 'auto', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Typography variant="caption" color="textSecondary">
            © {new Date().getFullYear()} WorkPulse — Employee Management System. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
