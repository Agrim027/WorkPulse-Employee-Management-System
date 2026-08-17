import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, textAlign: 'center', width: '100%', borderRadius: 3 }}>
        <ErrorOutlineIcon color="warning" sx={{ fontSize: 72, mb: 2 }} />
        <Typography variant="h4" fontWeight={700} color="textPrimary" gutterBottom>
          404 — Page Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={4}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')} sx={{ px: 4, py: 1, fontWeight: 600 }}>
          Back to Dashboard
        </Button>
      </Paper>
    </Container>
  );
}
