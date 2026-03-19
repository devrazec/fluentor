'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const banners = [
  {
    src: '/img/banner/1.jpg',
    href: 'https://www.instagram.com/ana_englishclub/',
    label: 'Learn More',
  },
  {
    src: '/img/banner/4.jpg',
    href: 'https://www.youtube.com/watch?v=g_d6VZnaWwA&list=PLbArmOUBFBgUXVuHQzoFgNpCO2w8U7FsE',
    label: 'Learn More',
  },
  {
    src: '/img/banner/5.jpg',
    href: 'https://www.youtube.com/watch?v=1tcsjmFBoNA&pp=ygUOZW5nbGlzaCBicmFzaWw%3D',
    label: 'Learn More',
  },
  {
    src: '/img/banner/6.jpg',
    href: 'https://www.youtube.com/watch?v=fHSi9Adg2LE',
    label: 'Learn More',
  },
  {
    src: '/img/banner/7.jpg',
    href: 'https://www.youtube.com/watch?v=g6eC2MQ1Kv8&list=PLZ65xj2SRHQB0T2GGk-R7bYxorKUkcyoj',
    label: 'Learn More',
  },
];

const INTERVAL = 4000;

export default function CardAlert() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % banners.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const current = banners[active];

  return (
    <Box
      sx={{
        mx: 1.5,
        mb: 1.5,
        borderRadius: 1,
        overflow: 'hidden',
        height: 120,
        position: 'relative',
        boxShadow: '0 4px 14px rgba(0,167,111,0.45)',
      }}
    >
      {/* Slides */}
      {banners.map((banner, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${banner.src})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            transition: 'opacity 0.6s ease',
            opacity: i === active ? 1 : 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.40)',
            },
          }}
        />
      ))}

      {/* External link button */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 28,
          right: 10,
          zIndex: 2,
        }}
      >
        <Button
          component="a"
          href={current.href}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          variant="contained"
          endIcon={<OpenInNewIcon sx={{ fontSize: '0.75rem !important' }} />}
          sx={{
            fontSize: '0.65rem',
            py: 0.3,
            px: 1,
            minWidth: 0,
            textTransform: 'none',
            backgroundColor: 'rgba(0,167,111,0.75)',
            color: '#fff',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(0,167,111,0.90)',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'rgba(0,134,89,0.90)',
              boxShadow: 'none',
            },
          }}
        >
          {current.label}
        </Button>
      </Box>

      {/* Dot navigation */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 0.75,
          zIndex: 2,
        }}
      >
        {banners.map((_, i) => (
          <Box
            key={i}
            onClick={() => setActive(i)}
            sx={{
              width: i === active ? 16 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === active ? '#fff' : 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              transition: 'width 0.3s ease, background-color 0.3s ease',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
