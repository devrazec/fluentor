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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Popover from '@mui/material/Popover';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Play,
  Pause,
  DocumentDownload,
  ArrowDown2,
  ArrowUp2,
} from 'iconsax-reactjs';

function getGaugeColor(value) {
  if (value >= 80) return '#4caf50';
  if (value >= 60) return '#ffc107';
  return '#f44336';
}

export default function ScoreTable() {
  const [minimizedScore, setMinimizedScore] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverText, setPopoverText] = useState('');

  const { testResult, mobileDevice } = useContext(GlobalContext);

  const handlePopoverOpen = (event, note) => {
    setPopoverAnchor(event.currentTarget);
    setPopoverText(note);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverText('');
  };

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }} sx={{ mb: mobileDevice ? 0 : 12 }}>
        <Card sx={{ borderRadius: 1, boxShadow: 2, mb: 3, height: '100%' }}>
          <CardContent>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: minimizedScore ? 0 : 1 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Score
              </Typography>
              <IconButton
                size="small"
                onClick={() => setMinimizedScore(v => !v)}
                sx={{ color: 'text.secondary' }}
              >
                {minimizedScore ? (
                  <ArrowUp2 size={18} />
                ) : (
                  <ArrowDown2 size={18} />
                )}
              </IconButton>
            </Stack>
            {!minimizedScore && (
              <>
                <Divider sx={{ mb: 1.5 }} />

                <Typography
                  variant="body2"
                  sx={{ mb: 2, color: 'text.secondary' }}
                >
                  Overall score of the pronunciation quality of the given
                  speech. Score is calculated from Accuracy, Fluency,
                  Completeness, and Prosody with weight, provided that Prosody
                  and Completeness are available.
                </Typography>

                {/* Score Type + Legend table */}
                <TableContainer sx={{ width: '100%' }}>
                  <Table
                    size="small"
                    aria-label="score legend"
                    sx={{ width: '100%', tableLayout: 'fixed' }}
                  >
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.main' }}>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: 'primary.contrastText',
                            width: '80%',
                          }}
                        >
                          Scores
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: 'primary.contrastText',
                            width: '20%',
                          }}
                          align="center"
                        >
                          Notes
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Accuracy */}
                      <TableRow hover sx={{ cursor: 'default' }}>
                        <TableCell sx={{ width: '80%' }}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={0.5}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Accuracy
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ flex: 1, minWidth: 60 }}>
                              <LinearProgress
                                variant="determinate"
                                value={testResult?.[0]?.accuracy ?? 0}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: `${getGaugeColor(testResult?.[0]?.accuracy ?? 0)}22`,
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    backgroundColor: getGaugeColor(
                                      testResult?.[0]?.accuracy ?? 0
                                    ),
                                  },
                                }}
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: getGaugeColor(
                                  testResult?.[0]?.accuracy ?? 0
                                ),
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              {testResult?.[0]?.accuracy ?? 0} / 100
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ px: 0.5, width: '20%' }}
                        >
                          <InfoOutlinedIcon
                            fontSize="small"
                            sx={{
                              color: 'text.secondary',
                              display: 'block',
                              cursor: 'pointer',
                              mx: 'auto',
                            }}
                            onClick={e =>
                              handlePopoverOpen(
                                e,
                                "Pronunciation accuracy of the speech. Accuracy indicates how closely the phonemes match a native speaker's pronunciation. Word and full text accuracy scores are aggregated from phoneme-level accuracy score."
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>

                      {/* Fluency */}
                      <TableRow hover sx={{ cursor: 'default' }}>
                        <TableCell sx={{ width: '80%' }}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={0.5}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Fluency
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ flex: 1, minWidth: 60 }}>
                              <LinearProgress
                                variant="determinate"
                                value={testResult?.[0]?.fluency ?? 0}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: `${getGaugeColor(testResult?.[0]?.fluency ?? 0)}22`,
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    backgroundColor: getGaugeColor(
                                      testResult?.[0]?.fluency ?? 0
                                    ),
                                  },
                                }}
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: getGaugeColor(
                                  testResult?.[0]?.fluency ?? 0
                                ),
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              {testResult?.[0]?.fluency ?? 0} / 100
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ px: 0.5, width: '20%' }}
                        >
                          <InfoOutlinedIcon
                            fontSize="small"
                            sx={{
                              color: 'text.secondary',
                              display: 'block',
                              cursor: 'pointer',
                              mx: 'auto',
                            }}
                            onClick={e =>
                              handlePopoverOpen(
                                e,
                                "Fluency of the given speech. Fluency indicates how closely the speech matches a native speaker's use of silent breaks between words."
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>

                      {/* Completeness */}
                      <TableRow hover sx={{ cursor: 'default' }}>
                        <TableCell sx={{ width: '80%' }}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={0.5}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Completeness
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ flex: 1, minWidth: 60 }}>
                              <LinearProgress
                                variant="determinate"
                                value={testResult?.[0]?.completeness ?? 0}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: `${getGaugeColor(testResult?.[0]?.completeness ?? 0)}22`,
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    backgroundColor: getGaugeColor(
                                      testResult?.[0]?.completeness ?? 0
                                    ),
                                  },
                                }}
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: getGaugeColor(
                                  testResult?.[0]?.completeness ?? 0
                                ),
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              {testResult?.[0]?.completeness ?? 0} / 100
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ px: 0.5, width: '20%' }}
                        >
                          <InfoOutlinedIcon
                            fontSize="small"
                            sx={{
                              color: 'text.secondary',
                              display: 'block',
                              cursor: 'pointer',
                              mx: 'auto',
                            }}
                            onClick={e =>
                              handlePopoverOpen(
                                e,
                                'Completeness of the speech, calculated by the ratio of pronounced words to the input reference text.'
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>

                      {/* Prosody */}
                      <TableRow hover sx={{ cursor: 'default' }}>
                        <TableCell sx={{ width: '80%' }}>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={0.5}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Prosody
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ flex: 1, minWidth: 60 }}>
                              <LinearProgress
                                variant="determinate"
                                value={testResult?.[0]?.prosody ?? 0}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: `${getGaugeColor(testResult?.[0]?.prosody ?? 0)}22`,
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    backgroundColor: getGaugeColor(
                                      testResult?.[0]?.prosody ?? 0
                                    ),
                                  },
                                }}
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: getGaugeColor(
                                  testResult?.[0]?.prosody ?? 0
                                ),
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              {testResult?.[0]?.prosody ?? 0} / 100
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ px: 0.5, width: '20%' }}
                        >
                          <InfoOutlinedIcon
                            fontSize="small"
                            sx={{
                              color: 'text.secondary',
                              display: 'block',
                              cursor: 'pointer',
                              mx: 'auto',
                            }}
                            onClick={e =>
                              handlePopoverOpen(
                                e,
                                'Prosody of the given speech. Prosody indicates how nature of the given speech, including stress, intonation, speaking speed and rhythm.'
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { maxWidth: 320, p: 2 } } }}
      >
        <Typography variant="body2">{popoverText}</Typography>
      </Popover>
    </>
  );
}
