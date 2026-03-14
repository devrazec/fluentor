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
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
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

  const { testResult, mobileDevice } = useContext(GlobalContext);

  const words = testResult?.[0]?.words ?? [];

  const getErrorColor = errorType => {
    switch (errorType) {
      case 'Mispronunciation':
        return '#e53935';
      case 'Omission':
        return '#fb8c00';
      case 'Insertion':
        return '#8e24aa';
      case 'UnexpectedBreak':
        return '#1e88e5';
      case 'MissingBreak':
        return '#00897b';
      case 'Monotone':
        return '#6d4c41';
      default:
        return '#4caf50'; // None / correct
    }
  };

  return (
    <Grid size={{ xs: 12, md: 6 }} sx={{ mb: mobileDevice ? 12 : 12 }}>
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
              <Divider sx={{ mb: 1.5 }} />

              <Typography
                variant="body2"
                sx={{ mb: 2, color: 'text.secondary' }}
              >
                Here is the detailed feedback on your pronunciation. Words in
                green are pronounced well, while words in red indicate
                mispronunciations. Pay attention to the mispronounced words and
                practice them to improve your pronunciation.
              </Typography>

              <TableContainer
                sx={{ width: '100%', maxHeight: 320, overflowY: 'auto' }}
              >
                <Table
                  size="small"
                  aria-label="word feedback"
                  sx={{ width: '100%', tableLayout: 'fixed' }}
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: 'primary.contrastText',
                          width: '40%',
                        }}
                      >
                        Word
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: 'primary.contrastText',
                          width: '20%',
                        }}
                      >
                        Accuracy
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: 'primary.contrastText',
                          width: '30%',
                        }}
                        align="center"
                      >
                        Error
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {words.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          align="center"
                          sx={{ color: 'text.secondary', py: 3 }}
                        >
                          No results yet. Record yourself to see feedback.
                        </TableCell>
                      </TableRow>
                    ) : (
                      words.map((w, i) => {
                        const score = w.accuracy_score ?? 0;
                        const errorType = w.error_type ?? 'None';
                        const color = getErrorColor(errorType);
                        return (
                          <TableRow key={i} hover sx={{ cursor: 'default' }}>
                            <TableCell sx={{ width: '40%' }}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color }}
                              >
                                {w.word}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ width: '20%' }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={score}
                                  sx={{
                                    flex: 1,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: `${color}22`,
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: color,
                                    },
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    minWidth: 28,
                                    textAlign: 'right',
                                    color,
                                  }}
                                >
                                  {score}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ width: '30%' }}>
                              {errorType !== 'None' && (
                                <Chip
                                  label={errorType
                                    .replace(/([A-Z])/g, ' $1')
                                    .trim()}
                                  size="small"
                                  sx={{
                                    backgroundColor: `${color}22`,
                                    color,
                                    fontWeight: 700,
                                    border: `1px solid ${color}`,
                                    fontSize: '0.65rem',
                                  }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
