import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import WorkIcon from '@mui/icons-material/Work';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import StatusChip from '../common/StatusChip';

export default function Navbar({ onMobileDrawerToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const getHighestRole = (roles = []) => {
    if (roles.includes('ROLE_ADMIN')) return 'ROLE_ADMIN';
    if (roles.includes('ROLE_HR')) return 'ROLE_HR';
    return roles[0] || 'ROLE_EMPLOYEE';
  };

  const primaryRole = getHighestRole(user?.roles);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#ffffff',
        color: '#1e293b',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMobileDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box display="flex" alignItems="center" gap={1.5} sx={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            <WorkIcon fontSize="small" />
          </Avatar>
          <Typography variant="h6" fontWeight={700} color="primary" sx={{ tracking: '-0.02em' }}>
            WorkPulse
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {user && (
          <Box display="flex" alignItems="center" gap={2}>
            <Box display={{ xs: 'none', sm: 'block' }} textAlign="right">
              <Typography variant="subtitle2" fontWeight={600} color="textPrimary">
                {user.username}
              </Typography>
              <StatusChip label={primaryRole.replace('ROLE_', '')} statusKey={primaryRole} />
            </Box>

            <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0.5 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 3,
                sx: { borderRadius: 2, mt: 1, minWidth: 180 },
              }}
            >
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                My Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
