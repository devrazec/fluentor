'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Result from '../../components/Result';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { Play, Pause, DocumentDownload } from 'iconsax-reactjs';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function TestPage() {
  return (
    <DashboardLayout>
      <Box
        sx={{
          width: '100%',
          //maxWidth: 700,
          mx: 'auto',
          px: { xs: 2, sm: 0 },
          mt: 2,
        }}
      >
        <Card sx={{ borderRadius: 1, boxShadow: 2, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Your Speaking Test Result
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Based on your performance, your speaking skills are at the
              intermediate level. You have a good grasp of basic pronunciation
              and can communicate effectively in familiar situations. To reach
              the advanced level, focus on improving your fluency and reducing
              pronunciation errors.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
