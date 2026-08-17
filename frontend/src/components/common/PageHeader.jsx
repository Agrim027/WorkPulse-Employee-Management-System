import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function PageHeader({ title, subtitle, actionText, onActionClick, actionIcon }) {
  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      mb={3}
      gap={2}
    >
      <Box>
        <Typography variant="h4" component="h1" fontWeight={700} color="textPrimary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {actionText && (
        <Button
          variant="contained"
          color="primary"
          startIcon={actionIcon}
          onClick={onActionClick}
          sx={{ px: 3, py: 1, fontWeight: 600 }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
}
