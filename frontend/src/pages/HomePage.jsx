import React from 'react';
import { Container, Typography, Box, Paper, Chip, Stack } from '@mui/material';

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary" sx={{ fontWeight: 700 }}>
          WorkPulse
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Employee Management System
        </Typography>
        <Box sx={{ my: 3 }}>
          <Chip label="Phase 2: Project Setup Active" color="primary" variant="filled" />
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Frontend application foundation successfully initialized with React, Vite, Material UI, React Router, and Axios.
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
          <Chip label="React 18" size="small" />
          <Chip label="Vite" size="small" />
          <Chip label="Material UI v5" size="small" />
          <Chip label="React Router v6" size="small" />
          <Chip label="Axios" size="small" />
        </Stack>
      </Paper>
    </Container>
  );
}
