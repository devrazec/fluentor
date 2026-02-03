'use client';

import React, { useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalContext';

import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const Header = () => {
  const { darkMode, setDarkMode } = useContext(GlobalContext);

  const toggleMode = React.useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode, setDarkMode]);

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
    >
      <Stack direction="row" sx={{ gap: 1, ml: 'auto' }}>
        <IconButton
          size="small"
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          onClick={toggleMode}
        >
          <LightModeIcon sx={{ display: darkMode ? 'inline' : 'none' }} />
          <DarkModeIcon sx={{ display: darkMode ? 'none' : 'inline' }} />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default React.memo(Header);
