'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlobalContext } from '../context/GlobalContext';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Play,
  Pause,
  DocumentDownload,
  ArrowDown2,
  ArrowUp2,
} from 'iconsax-reactjs';

export default function WordTable() {
  const [minimizedFeedback, setMinimizedFeedback] = useState(false);

  const { testResult, setTestResult } = useContext(GlobalContext);

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{ borderRadius: 1, boxShadow: 2, mb: 3, height: '100%' }}>
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: minimizedFeedback ? 0 : 1 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Detailed Feedback
            </Typography>
            <IconButton
              size="small"
              onClick={() => setMinimizedFeedback(v => !v)}
              sx={{ color: 'text.secondary' }}
            >
              {minimizedFeedback ? (
                <ArrowUp2 size={18} />
              ) : (
                <ArrowDown2 size={18} />
              )}
            </IconButton>
          </Stack>
          {!minimizedFeedback && (
            <>
              <Typography
                variant="body2"
                sx={{ mb: 2, color: 'text.secondary' }}
              >
                Here is the detailed feedback on your pronunciation. Words in
                green are pronounced well, while words in red indicate
                mispronunciations. Pay attention to the mispronounced words and
                practice them to improve your pronunciation skills.
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
