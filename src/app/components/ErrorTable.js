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
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Play,
  Pause,
  DocumentDownload,
  ArrowDown2,
  ArrowUp2,
} from 'iconsax-reactjs';

export default function ErrorTable() {
  const [minimizedError, setMinimizedError] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverText, setPopoverText] = useState('');

  const { testResult } = useContext(GlobalContext);

  useEffect(() => {
    // runs whenever testResult is updated from any page or component
  }, [testResult]);

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
              sx={{ mb: minimizedError ? 0 : 1 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Error
              </Typography>
              <IconButton
                size="small"
                onClick={() => setMinimizedError(v => !v)}
                sx={{ color: 'text.secondary' }}
              >
                {minimizedError ? (
                  <ArrowUp2 size={18} />
                ) : (
                  <ArrowDown2 size={18} />
                )}
              </IconButton>
            </Stack>
            {!minimizedError && (
              <>
                <Divider sx={{ mb: 1.5 }} />

                <Typography
                  variant="body2"
                  sx={{ mb: 2, color: 'text.secondary' }}
                >
                  This table indicates the error type compared to the reference
                  text. Options include whether a word is omitted, inserted, or
                  improperly inserted with a break. It also indicates a missing
                  break at punctuation. It also indicates whether a word is
                  badly pronounced.
                </Typography>

                {/* Error Type + Legend table */}
                <TableContainer sx={{ width: '100%' }}>
                  <Table
                    size="small"
                    aria-label="error legend"
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
                          Errors
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
                      {/* Mispronunciation */}
                      <TableRow hover sx={{ cursor: 'default' }}>
                        <TableCell sx={{ width: '80%' }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={testResult?.[0]?.mispronunciation ?? 0}
                              size="small"
                              sx={{
                                backgroundColor: '#e5393522',
                                color: '#e53935',
                                fontWeight: 700,
                                border: '1px solid #e53935',
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Mispronunciation
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
                                'The words that are spoken incorrectly. This can include wrong vowel or consonant sounds, stress on the wrong syllable, or incorrect intonation patterns.'
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>

                      {/* Omission */}
                      <TableRow hover sx={{ cursor: 'default' }}>
                        <TableCell sx={{ width: '80%' }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={testResult?.[0]?.omission ?? 0}
                              size="small"
                              sx={{
                                backgroundColor: '#fb8c0022',
                                color: '#fb8c00',
                                fontWeight: 700,
                                border: '1px solid #fb8c00',
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Omission
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
                                'The words that are provided in the script but are not spoken. This can indicate difficulty in recalling or pronouncing certain words, or it may reflect a lack of familiarity with the vocabulary.'
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>

                      {/* Insertion */}
                      <TableRow hover sx={{ cursor: 'default' }}>
                        <TableCell sx={{ width: '80%' }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={testResult?.[0]?.insertion ?? 0}
                              size="small"
                              sx={{
                                backgroundColor: '#8e24aa22',
                                color: '#8e24aa',
                                fontWeight: 700,
                                border: '1px solid #8e24aa',
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Insertion
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
                                'The words that are not in the script but are detected in the recording. This can indicate overcompensation or misunderstanding of the content.'
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>

                      {/* Unexpected break */}
                      {/* <TableRow hover sx={{ cursor: 'default' }}>
                        <TableCell sx={{ width: '80%' }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={testResult?.[0]?.unexpected_break ?? 0}
                              size="small"
                              sx={{
                                backgroundColor: '#1e88e522',
                                color: '#1e88e5',
                                fontWeight: 700,
                                border: '1px solid #1e88e5',
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Unexpected break
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
                                'Improperly paused in between words within same sentence. This can indicate hesitation, difficulty in recalling the next word, or uncertainty in pronunciation.'
                              )
                            }
                          />
                        </TableCell>
                      </TableRow> */}

                      {/* Missing break */}
                      {/* <TableRow hover sx={{ cursor: 'default' }}>
                        <TableCell sx={{ width: '80%' }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={testResult?.[0]?.missing_break ?? 0}
                              size="small"
                              sx={{
                                backgroundColor: '#00897b22',
                                color: '#00897b',
                                fontWeight: 700,
                                border: '1px solid #00897b',
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Missing break
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
                                'Missing pauses between words when there is a punctuation in present between them. This can indicate a lack of awareness of natural speech patterns or difficulty in controlling the flow of speech.'
                              )
                            }
                          />
                        </TableCell>
                      </TableRow> */}

                      {/* Monotone */}
                      {/* <TableRow hover sx={{ cursor: 'default' }}>
                        <TableCell sx={{ width: '80%' }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={testResult?.[0]?.monotone ?? 0}
                              size="small"
                              sx={{
                                backgroundColor: '#6d4c4122',
                                color: '#6d4c41',
                                fontWeight: 700,
                                border: '1px solid #6d4c41',
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Monotone
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
                                'The words are being read in a flat and unexciting tone, without any rhythm or expression. This can indicate a lack of engagement with the content or difficulty in conveying emotions through speech.'
                              )
                            }
                          />
                        </TableCell>
                      </TableRow> */}
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
