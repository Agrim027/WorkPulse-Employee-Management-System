import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, textAlign: 'center', width: '100%', borderRadius: 3 }}>
        <BlockIcon color="error" sx={{ fontSize: 72, mb: 2 }} />
        <Typography variant="h4" fontWeight={700} color="textPrimary" gutterBottom>
          403 — Access Denied
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={4}>
          You do not have permission to view this resource. Please contact your system administrator if you believe this is an error.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')} sx={{ px: 4, py: 1, fontWeight: 600 }}>
          Back to Dashboard
        </Button>
      </Paper>
    </Container>
  );
}
