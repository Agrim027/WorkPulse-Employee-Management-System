import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

export default function ErrorMessage({ title = 'Error', message }) {
  if (!message) return null;

  return (
    <Box mb={3} width="100%">
      <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
        {title && <AlertTitle fontWeight={600}>{title}</AlertTitle>}
        {message}
      </Alert>
    </Box>
  );
}
