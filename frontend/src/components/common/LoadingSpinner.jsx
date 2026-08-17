import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="300px"
      width="100%"
      py={4}
    >
      <CircularProgress size={48} thickness={4} color="primary" />
      {message && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2, fontWeight: 500 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}
