'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlobalContext } from '../context/GlobalContext';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Checkbox,
} from '@mui/material';

import {
  Home,
  ShoppingCart,
  Chart2,
  Bank,
  ArrowUp2,
  ArrowDown2,
  Profile,
  Setting2,
  Moon,
  Sun1,
  HamburgerMenu,
  ArrowLeft2,
  ArrowRight2,
  Edit,
  Save,
  Close,
  Trash,
  Lock,
  Copy,
  User,
  UserMinus,
  Calendar,
  Clock,
  TickCircle,
  CloseCircle,
  Eye,
  Camera,
  Scan,
  NotificationStatus,
  House,
  Category,
  Chart21,
  Translate,
  Notepad2,
  MessageQuestion,
  Microphone2,
  DocumentText,
  EmojiHappy,
} from 'iconsax-reactjs';

import CardAlert from './CardAlert';

const drawerWidth = 260;
const collapsedWidth = 80;

export default function DashboardLayout({ children }) {
  const {
    darkMode,
    setDarkMode,
    mobileDevice,
    setMobileDevice,
    dbCategory,
    setDbCategory,
    dbTense,
    setDbTense,
    dbQuestion,
    setDbQuestion,
    dbAnswer,
    setDbAnswer,
    selectedPage,
    setSelectedPage,
    selectedCategory,
    setSelectedCategory,
    selectedTense,
    setSelectedTense,
    selectedQuestion,
    setSelectedQuestion,
    selectedAnswer,
    setSelectedAnswer,
  } = useContext(GlobalContext);
  //const theme = useTheme();
  //const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(true);

  const pathname = usePathname();

  const pageTitles = {
    '/': 'Home',
    '/pages/Category/': 'Category',
    '/pages/Tense/': 'Tense',
    '/pages/Question/': 'Question',
    '/pages/Answer/': 'Answer',
    '/pages/Practice/': 'Practice',
  };
  const pageTitle = pageTitles[pathname] ?? '';

  const toggleMode = () => setDarkMode(!darkMode);

  const drawerOpen = mobileDevice ? mobileOpen : desktopOpen;
  const currentWidth = desktopOpen ? drawerWidth : collapsedWidth;

  const drawerContent = (
    <Box sx={{ pl: 2, pr: 2, position: 'relative', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: desktopOpen ? 'space-between' : 'center',
          mb: 0,
          px: 1,
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sizes="small"
            alt="Fluentor User"
            src="/img/logo3-500x500.png"
            sx={{ width: 48, height: 48 }}
          />
          <Typography variant="h6" fontWeight={700} sx={{ pl: 1 }}>
            {desktopOpen ? 'Fluentor' : ''}
          </Typography>
        </Box>

        {/* Only show close icon on mobile */}
        {mobileDevice && (
          <IconButton onClick={() => setMobileOpen(false)}>
            <CloseCircle variant="Bulk" color="#00a76f" size={36} />
          </IconButton>
        )}
      </Box>

      {/* {pathname === '/pages/Category/' && (
                <Divider />
            )} */}
      {/* <SectionTitle>OVERVIEW</SectionTitle> */}

      <NavItem
        icon={<House variant="Bulk" color="#00a76f" />}
        text="Home"
        open={desktopOpen}
        href="/"
        active={pathname === '/'}
      />
      <NavItem
        icon={<Category variant="Bulk" color="#00a76f" />}
        text="Category"
        open={desktopOpen}
        href="/pages/Category/"
        active={pathname === '/pages/Category/'}
      />
      <NavItem
        icon={<DocumentText variant="Bulk" color="#00a76f" />}
        text="Tense"
        open={desktopOpen}
        href="/pages/Tense/"
        active={pathname === '/pages/Tense/'}
      />
      <NavItem
        icon={<MessageQuestion variant="Bulk" color="#00a76f" />}
        text="Question"
        open={desktopOpen}
        href="/pages/Question/"
        active={pathname === '/pages/Question/'}
      />
      <NavItem
        icon={<Microphone2 variant="Bulk" color="#00a76f" />}
        text="Answer"
        open={desktopOpen}
        href="/pages/Answer/"
        active={pathname === '/pages/Answer/'}
      />
{/*       <NavItem
        icon={<EmojiHappy variant="Bulk" color="#00a76f" />}
        text="Practice"
        open={desktopOpen}
        href="/pages/Practice/"
        active={pathname === '/pages/Practice/'}
      /> */}

      {/* <NavItem icon={<Chart21 variant="Bulk" color="#00a76f" />} text="Analytics" open={desktopOpen} /> */}

      {/* <SectionTitle sx={{ mt: 4 }}>Exams</SectionTitle> */}

      {/* <ListItemButton onClick={() => setUserOpen(!userOpen)} sx={menuButtonStyle}>
                <ListItemIcon><Notepad2 variant="Bulk" color="#00a76f" /></ListItemIcon>
                {desktopOpen && <ListItemText primary="Tense" />}
                {desktopOpen && (userOpen ? <ArrowUp2 variant="Bulk" color="#00a76f" size={36} /> : <ArrowDown2 variant="Bulk" color="#00a76f" size={36} />)}
            </ListItemButton> */}

      {/* <Collapse in={userOpen && desktopOpen}>
                <List disablePadding>
                    {dbTense.map((item) => {
                        const checked = selectedTense.includes(item.id);
                        const handleToggle = () =>
                            setSelectedTense((prev) =>
                                checked
                                    ? prev.filter((id) => id !== item.id)
                                    : [...prev, item.id]
                            );
                        return (
                            <ListItemButton key={item.id} onClick={handleToggle} sx={{ pl: 4, borderRadius: 2 }}>
                                <Checkbox
                                    edge="start"
                                    checked={checked}
                                    disableRipple
                                    size="small"
                                    sx={{ color: '#00a76f', '&.Mui-checked': { color: '#00a76f' } }}
                                />
                                <ListItemText primary={item.name} />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Collapse> */}
      {desktopOpen && (
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2 }}>
          <CardAlert />
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{ position: 'relative' }}>
        <Drawer
          variant={mobileDevice ? 'temporary' : 'permanent'}
          open={drawerOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            width: !mobileDevice ? currentWidth : drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: !mobileDevice ? currentWidth : drawerWidth,
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
              //borderRight: '1px solid #e5e7eb',
              //backgroundColor: '#00a76f',
              //backgroundColor: '#00a76f1f',
              //backdropFilter: 'blur(4px)',
              borderRadius: 1,
              boxShadow: 1,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 4 },
          //pt: 1,
          transition: 'margin 0.3s ease',
          position: 'relative',
        }}
      >
        {/* Topbar */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
            gap: 1,
            bgcolor: darkMode ? '#121212' : '#ffffff',
            zIndex: 100,
            backgroundColor: '#00a76f1f',
            backdropFilter: 'blur(4px)',
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {mobileDevice && (
              <IconButton onClick={() => setMobileOpen(true)} size="small">
                <HamburgerMenu variant="Bulk" color="#00a76f" size={32} />
              </IconButton>
            )}
            {!mobileDevice && (
              <IconButton
                onClick={() => setDesktopOpen(!desktopOpen)}
                size="small"
                color="primary"
                sx={{
                  //position: 'absolute',
                  //left: -20,
                  //top: '40%',
                  ///transform: 'translateY(-50%)',
                  zIndex: 1,
                  //backgroundColor: 'background.paper',
                  //boxShadow: 2,
                  //'&:hover': { backgroundColor: 'background.paper' },
                }}
              >
                {desktopOpen ? (
                  <ArrowLeft2 variant="Bulk" color="#00a76f" size={36} />
                ) : (
                  <ArrowRight2 variant="Bulk" color="#00a76f" size={36} />
                )}
              </IconButton>
            )}
          </Box>

          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
          >
            {pageTitle}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={toggleMode}
              sx={{
                //position: 'absolute',
                //right: -10,
                //top: '40%',
                //transform: 'translateY(-100%)',
                zIndex: 1,
                //backgroundColor: 'background.paper',
                //boxShadow: 2,
                //'&:hover': { backgroundColor: 'background.paper' },
              }}
            >
              {darkMode ? (
                <Sun1 variant="Bulk" color="#00a76f" />
              ) : (
                <Moon variant="Bulk" color="#00a76f" />
              )}
            </IconButton>
            {/* <IconButton>
                        <Setting2 variant="Bulk" color="#00a76f" />
                        </IconButton> */}
          </Box>
        </Box>

        {children}
      </Box>
    </Box>
  );
}

/* ---------- Reusable Components ---------- */

function NavItem({ icon, text, open, href, active }) {
  return (
    <ListItemButton
      component={href ? Link : 'div'}
      href={href ?? undefined}
      sx={{
        ...menuButtonStyle,
        borderRadius: 1,
        boxShadow: 1,
        mb: 2,
        justifyContent: open ? 'flex-start' : 'center',
        backgroundColor: active ? 'rgba(0, 167, 111, 0.12)' : 'transparent',
        color: active ? '#00a76f' : 'inherit',
        '& .MuiListItemIcon-root': {
          color: active ? '#00a76f' : 'inherit',
          minWidth: open ? undefined : 0,
        },
        '&:hover': {
          backgroundColor: active ? 'rgba(0, 167, 111, 0.18)' : undefined,
        },
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      {open && (
        <ListItemText
          primary={text}
          primaryTypographyProps={{ fontWeight: active ? 700 : 400 }}
        />
      )}
    </ListItemButton>
  );
}

function SectionTitle({ children, sx }) {
  return (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 700,
        color: '#94a3b8',
        letterSpacing: 1,
        mb: 1,
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

const menuButtonStyle = {
  borderRadius: 1,
  mb: 0.5,
};
