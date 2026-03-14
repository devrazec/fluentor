'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import { flushSync } from 'react-dom';
import { GlobalContext } from '../context/GlobalContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Play,
  Pause,
  Record,
  Trash,
  TickCircle,
  ArrowDown2,
  ArrowUp2,
} from 'iconsax-reactjs';

export default function RecognizedText() {
  const { currentAnswer, selectedAnswer, testResult, setTestResult } =
    useContext(GlobalContext);

  const timed =
    currentAnswer?.find(a => a.id === selectedAnswer)?.timed ?? null;

  // State
  const [minimized, setMinimized] = useState(false);

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 2, mb: 3, height: '100%' }}>
      <CardContent>
        {/* Header row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: minimized ? 0 : 2 }}
        >
          <Typography variant="h6" fontWeight={600}>
            Recognized Text
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* {timed && (
              <Chip
                label={`${timed}s limit`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )} */}
            <IconButton
              size="small"
              onClick={() => setMinimized(v => !v)}
              sx={{ color: 'text.secondary' }}
            >
              {minimized ? <ArrowUp2 size={18} /> : <ArrowDown2 size={18} />}
            </IconButton>
          </Stack>
        </Stack>

        {/* Recordings list */}
        {!minimized && (
          <>
            <Divider sx={{ mb: 1.5 }} />

            {testResult?.[0]?.recognized_text && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {testResult[0].recognized_text}
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
