'use client';

import React, { useContext, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Avatar from '@mui/material/Avatar';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import MenuButton from './MenuButton';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import { GlobalContext } from '../context/GlobalContext';

function SideMenuMobile({ open, toggleDrawer }) {
  const { darkMode, setDarkMode } = useContext(GlobalContext);

  const toggleMode = React.useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode, setDarkMode]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: theme => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt="Fluentor User"
              src="/img/logo3-500x500.png"
              sx={{ width: 48, height: 48 }}
            />
            <Typography component="p" variant="h6">
              Fluentor
            </Typography>
          </Stack>
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
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <CardAlert />
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
};

export default SideMenuMobile;
