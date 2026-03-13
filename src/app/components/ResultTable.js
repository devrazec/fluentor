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
import Popover from '@mui/material/Popover';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Play,
  Pause,
  DocumentDownload,
  ArrowDown2,
  ArrowUp2,
} from 'iconsax-reactjs';

export default function ScoreTable() {
  const [minimizedResult, setMinimizedResult] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverText, setPopoverText] = useState('');

  const { testResult } = useContext(GlobalContext);

  const value = testResult?.[0]?.pronunciation ?? 0;
  const color = value >= 80 ? '#4caf50' : value >= 60 ? '#ffc107' : '#f44336';

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
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ borderRadius: 1, boxShadow: 2, mb: 3, height: '100%' }}>
          <CardContent>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: minimizedResult ? 0 : 1 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Your Speaking Test Result
              </Typography>
              <IconButton
                size="small"
                onClick={() => setMinimizedResult(v => !v)}
                sx={{ color: 'text.secondary' }}
              >
                {minimizedResult ? (
                  <ArrowUp2 size={18} />
                ) : (
                  <ArrowDown2 size={18} />
                )}
              </IconButton>
            </Stack>
            {!minimizedResult && (
              <>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: 'text.secondary' }}
                >
                  {value >= 80
                    ? 'Based on your performance, your speaking skills are at the advanced level. You communicate clearly and confidently in a wide range of situations, with good control of vocabulary and pronunciation. To continue improving, focus on refining your fluency, using more nuanced expressions.'
                    : value >= 60
                      ? 'Based on your performance, your speaking skills are at the intermediate level. You have a good grasp of basic pronunciation and can communicate effectively in familiar situations. To reach the advanced level, focus on improving your fluency, expanding your vocabulary.'
                      : 'Based on your performance, your speaking skills are at the basic level. You are able to use simple words and phrases to communicate in familiar situations. To reach the intermediate level, focus on expanding your vocabulary, practicing sentence structure, and improving pronunciation.'}
                </Typography>

                {/* Gauge + Legend table */}
                <Grid
                  container
                  spacing={3}
                  alignItems="center"
                  justifyContent="center"
                >
                  {/* Gauge */}
                  <Grid
                    size={{ xs: 12, sm: 4 }}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Gauge
                      value={value}
                      startAngle={0}
                      endAngle={360}
                      innerRadius="72%"
                      outerRadius="95%"
                      sx={{
                        [`& .${gaugeClasses.valueText}`]: {
                          fontSize: 36,
                          fontWeight: 700,
                          fill: color,
                          filter: `drop-shadow(0px 1px 3px rgba(0,0,0,0.35))`,
                        },
                        [`& .${gaugeClasses.valueArc}`]: {
                          fill: color,
                          filter: `drop-shadow(0px 0px 6px ${color}) drop-shadow(0px 2px 4px rgba(0,0,0,0.3))`,
                          strokeLinecap: 'round',
                        },
                        [`& .${gaugeClasses.referenceArc}`]: {
                          fill: '#c8cdd8',
                          filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.18))',
                        },
                      }}
                      text={({ value }) => `${value}`}
                    />
                    {/* </Box> */}
                  </Grid>

                  {/* Legend table */}
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                      <Table size="small" aria-label="score legend">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'primary.main' }}>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                color: 'primary.contrastText',
                              }}
                            >
                              Score
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                color: 'primary.contrastText',
                              }}
                            >
                              Level
                            </TableCell>
                            {/* <TableCell
                          sx={{ fontWeight: 700, whiteSpace: 'nowrap', color: 'primary.contrastText' }}
                        >
                          CEFR
                        </TableCell> */}
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: 'primary.contrastText',
                              }}
                              align="center"
                            >
                              Notes
                            </TableCell>
                            {/* <TableCell
                          sx={{ fontWeight: 700, whiteSpace: 'nowrap', color: 'primary.contrastText' }}
                        >
                          IELTS
                        </TableCell> */}
                            {/* <TableCell
                          sx={{ fontWeight: 700, whiteSpace: 'nowrap', color: 'primary.contrastText' }}
                        >
                          TOEFL
                        </TableCell> */}
                            {/* <TableCell /> */}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* 0–59 Basic */}
                          {(() => {
                            const active = value < 60;
                            return (
                              <TableRow
                                hover={!active}
                                sx={{
                                  cursor: 'default',
                                  ...(active && {
                                    backgroundColor: '#f4433622',
                                    outline: '2px solid #f44336',
                                    outlineOffset: '-2px',
                                    '& td': { fontWeight: 700 },
                                  }),
                                }}
                              >
                                <TableCell>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Box
                                      sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: '#f44336',
                                        flexShrink: 0,
                                      }}
                                    />
                                    0–59
                                  </Box>
                                </TableCell>
                                <TableCell>Basic</TableCell>
                                <TableCell align="center">
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
                                        'Speech has many pronunciation errors. Listeners may struggle to understand without repetition. Limited fluency and accuracy.'
                                      )
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })()}

                          {/* 60–79 Intermediate */}
                          {(() => {
                            const active = value >= 60 && value < 80;
                            return (
                              <TableRow
                                hover={!active}
                                sx={{
                                  cursor: 'default',
                                  ...(active && {
                                    backgroundColor: '#ffc10722',
                                    outline: '2px solid #ffc107',
                                    outlineOffset: '-2px',
                                    '& td': { fontWeight: 700 },
                                  }),
                                }}
                              >
                                <TableCell>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Box
                                      sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: '#ffc107',
                                        flexShrink: 0,
                                      }}
                                    />
                                    60–79
                                  </Box>
                                </TableCell>
                                <TableCell>Intermediate</TableCell>
                                <TableCell align="center">
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
                                        'Pronunciation is generally understandable but contains noticeable errors. Fluency is moderate. Communication works but with some effort.'
                                      )
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })()}

                          {/* 80–100 Advanced */}
                          {(() => {
                            const active = value >= 80;
                            return (
                              <TableRow
                                hover={!active}
                                sx={{
                                  cursor: 'default',
                                  ...(active && {
                                    backgroundColor: '#4caf5022',
                                    outline: '2px solid #4caf50',
                                    outlineOffset: '-2px',
                                    '& td': { fontWeight: 700 },
                                  }),
                                }}
                              >
                                <TableCell>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Box
                                      sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: '#4caf50',
                                        flexShrink: 0,
                                      }}
                                    />
                                    80–100
                                  </Box>
                                </TableCell>
                                <TableCell>Advanced</TableCell>
                                <TableCell align="center">
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
                                        'Clear pronunciation close to native-like patterns. High fluency and accuracy. Easy to understand.'
                                      )
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })()}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
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
