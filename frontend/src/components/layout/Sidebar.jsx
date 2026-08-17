import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const DRAWER_WIDTH = 260;

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRoles = user?.roles || [];
  const isAdminOrHr = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_HR');

  const navItems = isAdminOrHr
    ? [
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        { label: 'Employees', path: '/employees', icon: <PeopleIcon /> },
        { label: 'Departments', path: '/departments', icon: <BusinessIcon /> },
        { label: 'Roles', path: '/roles', icon: <SecurityIcon /> },
        { label: 'Attendance', path: '/attendance', icon: <EventAvailableIcon /> },
        { label: 'Salaries', path: '/salaries', icon: <PaymentsIcon /> },
        { label: 'My Profile', path: '/profile', icon: <AccountCircleIcon /> },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        { label: 'My Profile', path: '/profile', icon: <AccountCircleIcon /> },
        { label: 'My Attendance', path: '/my-attendance', icon: <EventAvailableIcon /> },
        { label: 'My Salaries', path: '/my-salaries', icon: <PaymentsIcon /> },
      ];

  const handleNavClick = (path) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto', py: 2 }}>
      <Toolbar />
      <Box px={3} py={1}>
        <Typography variant="caption" fontWeight={700} color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Navigation
        </Typography>
      </Box>
      <List component="nav" sx={{ px: 1.5 }}>
        {navItems.map((item) => {
          const isSelected = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <ListItemButton
              key={item.path}
              selected={isSelected}
              onClick={() => handleNavClick(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: isSelected ? 'primary.main' : 'text.primary',
                bgcolor: isSelected ? 'primary.50' : 'transparent',
                '&.Mui-selected': {
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(25, 118, 210, 0.12)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: isSelected ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isSelected ? 600 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ my: 2 }} />
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
