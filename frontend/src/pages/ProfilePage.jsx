import React from 'react';
import { Paper, Typography, Box, Avatar, Divider, Chip } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title="My Profile" subtitle="User account and profile details" />
      <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 600 }}>
        <Box display="flex" alignItems="center" gap={3} mb={3}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 72, height: 72, fontSize: '2rem', fontWeight: 700 }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {user?.username}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user?.email}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              {user?.roles?.map((role) => (
                <Chip key={role} label={role.replace('ROLE_', '')} size="small" color="primary" sx={{ fontWeight: 600 }} />
              ))}
            </Box>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" flexDirection="column" gap={1.5}>
          <Typography variant="body2" color="textSecondary">
            <strong>User ID:</strong> #{user?.id}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Employee Profile Linked:</strong> {user?.employeeId ? `#${user.employeeId}` : 'Not linked'}
          </Typography>
        </Box>
      </Paper>
    </>
  );
}
