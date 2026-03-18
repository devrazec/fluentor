'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/* const marqueeText =
  '🎤 English class  •  AI-powered feedback  •  Build fluency  •  Practice anytime  •  ';
 */
export default function CardAlert() {
  return (
    <Box
      sx={{
        mx: 1.5,
        mb: 1.5,
        borderRadius: 1,
        overflow: 'hidden',
        height: 120,
        position: 'relative',
        boxShadow: 2,
        backgroundImage: 'url(/img/banner/4.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.50)',
          borderRadius: 'inherit',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100%',
          overflow: 'hidden',
          px: 1.5,
          gap: 0.5,
        }}
      >
        {/* <Typography
          variant="caption"
          sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}
        >
          Fluentor
        </Typography> */}
        <Box
          sx={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              animation: 'sidebarFlow 14s linear infinite',
              '@keyframes sidebarFlow': {
                from: { transform: 'translateX(100%)' },
                to: { transform: 'translateX(-100%)' },
              },
            }}
          >
            {/* <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem' }}
            >
              {marqueeText.repeat(2)}
            </Typography> */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
