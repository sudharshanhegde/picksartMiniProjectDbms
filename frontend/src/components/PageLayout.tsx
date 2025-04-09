import React from 'react';
import { Box } from '@mui/material';

interface PageLayoutProps {
  children: React.ReactNode;
  disableTopPadding?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, disableTopPadding = false }) => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        pt: disableTopPadding ? 0 : '64px', // 64px is the height of the navbar
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  );
};

export default PageLayout; 