'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Question from '../../components/Question';
import RecordPlayer from '../../components/RecordPlayer';

import { GlobalContext } from '../../context/GlobalContext';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import {
  Play,
  Pause,
  DocumentDownload,
  ArrowDown2,
  ArrowUp2,
} from 'iconsax-reactjs';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';

export default function ResultPage() {
  const value = 64;
  const color = getGaugeColor(value);

  const [popoverAnchor, setPopoverAnchor] = React.useState(null);
  const [popoverText, setPopoverText] = React.useState('');
  const [minimizedResult, setMinimizedResult] = useState(false);
  const [minimizedError, setMinimizedError] = useState(false);
  const [minimizedScore, setMinimizedScore] = useState(false);
  const [minimizedFeedback, setMinimizedFeedback] = useState(false);

  const {
    dbQuestion,
    dbCategory,
    dbTense,
    dbAnswer,
    selectedQuestion,
    currentAnswer,
    selectedAnswer,
    setSelectedAnswer,
    mobileDevice,
    filterQuestion,
    setFilterQuestion,
  } = useContext(GlobalContext);

  const handlePopoverOpen = (event, description) => {
    setPopoverAnchor(event.currentTarget);
    setPopoverText(description);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverText('');
  };

  const legendItems = [
    {
      label: '0–59',
      color: '#f44336',
      level: 'Basic',
      cefr: 'A1–A2',
      ielts: '0–3.5',
      toefl: '0–40',
      description:
        'Speech has many pronunciation errors. Listeners may struggle to understand without repetition. Limited fluency and accuracy.',
    },
    {
      label: '60–79',
      color: '#ffc107',
      level: 'Intermediate',
      cefr: 'B1–B2',
      ielts: '4.0–6.0',
      toefl: '41–90',
      description:
        'Pronunciation is generally understandable but contains noticeable errors. Fluency is moderate. Communication works but with some effort.',
    },
    {
      label: '80–100',
      color: '#4caf50',
      level: 'Advanced',
      cefr: 'C1–C2',
      ielts: '6.5–9.0',
      toefl: '91–120',
      description:
        'Clear pronunciation close to native-like patterns. High fluency and accuracy. Easy to understand.',
    },
  ];

  const errorItems = [
    {
      label: 'Mispronunciations',
      value: 3,
      color: '#e53935',
      description:
        'The words that are spoken incorrectly. This can include wrong vowel or consonant sounds, stress on the wrong syllable, or incorrect intonation patterns.',
    },
    {
      label: 'Omissions',
      value: 9,
      color: '#fb8c00',
      description:
        'The words that are provided in the script but are not spoken. This can indicate difficulty in recalling or pronouncing certain words, or it may reflect a lack of familiarity with the vocabulary.',
    },
    {
      label: 'Insertions',
      value: 8,
      color: '#8e24aa',
      description:
        'The words that are not in the script but are detected in the recording. This can indicate overcompensation or misunderstanding of the content.',
    },
    {
      label: 'Unexpected breaks',
      value: 7,
      color: '#1e88e5',
      description:
        'Improperly paused in between words within same sentence. This can indicate hesitation, difficulty in recalling the next word, or uncertainty in pronunciation.',
    },
    {
      label: 'Missing breaks',
      value: 6,
      color: '#00897b',
      description:
        'Missing pauses between words when there is a punctuation in present between them. This can indicate a lack of awareness of natural speech patterns or difficulty in controlling the flow of speech.',
    },
    {
      label: 'Monotone',
      value: 4,
      color: '#6d4c41',
      description:
        'The words are being read in a flat and unexciting tone, without any rhythm or expression. This can indicate a lack of engagement with the content or difficulty in conveying emotions through speech.',
    },
  ];

  const scoreItems = [
    {
      label: 'Accuracy',
      value: 44,
      description:
        'Pronunciation accuracy of the speech. Accuracy indicates how closely the phonemes match a native speaker`s pronunciation. Word and full text accuracy scores are aggregated from phoneme-level accuracy score.',
    },
    {
      label: 'Fluency',
      value: 64,
      description:
        'Fluency of the given speech. Fluency indicates how closely the speech matches a native speaker`s use of silent breaks between words.',
    },
    {
      label: 'Completeness',
      value: 78,
      description:
        'Completeness of the speech, calculated by the ratio of pronounced words to the input reference text.',
    },
    {
      label: 'Prosody',
      value: 90,
      description:
        'Prosody of the given speech. Prosody indicates how nature of the given speech, including stress, intonation, speaking speed and rhythm.',
    },
  ];

  function getGaugeColor(value) {
    if (value >= 80) return '#4caf50';
    if (value >= 60) return '#ffc107';
    return '#f44336';
  }

  function isActiveRow(item, value) {
    if (item.color === '#4caf50') return value >= 80;
    if (item.color === '#ffc107') return value >= 60 && value < 80;
    return value < 60;
  }

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
        <Question />

        <RecordPlayer />
        <Grid container spacing={2} alignItems="stretch">
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
                      sx={{ mb: 2, color: 'text.secondary' }}
                    >
                      Based on your performance, your speaking skills are at the
                      intermediate level. You have a good grasp of basic
                      pronunciation and can communicate effectively in familiar
                      situations. To reach the advanced level, focus on
                      improving your fluency and reducing pronunciation errors.
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
                        {/* <Box
                  sx={{
                    width: 200,
                    height: 200,
                    mx: 'auto',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle at 35% 30%, #f5f5f5, #dde1ea)',
                    boxShadow:
                      '10px 10px 24px rgba(0,0,0,0.22), -6px -6px 16px rgba(255,255,255,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                  }}
                > */}
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
                              filter:
                                'drop-shadow(0px 2px 3px rgba(0,0,0,0.18))',
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
                              <TableRow
                                sx={{ backgroundColor: 'primary.main' }}
                              >
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
                              {legendItems.map(item => {
                                const active = isActiveRow(item, value);
                                return (
                                  <TableRow
                                    key={item.label}
                                    hover={!active}
                                    sx={{
                                      cursor: 'default',
                                      ...(active && {
                                        backgroundColor: `${item.color}22`,
                                        outline: `2px solid ${item.color}`,
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
                                            backgroundColor: item.color,
                                            flexShrink: 0,
                                          }}
                                        />
                                        {item.label}
                                      </Box>
                                    </TableCell>
                                    <TableCell>{item.level}</TableCell>
                                    {/* <TableCell>{item.cefr}</TableCell> */}
                                    <TableCell align="center" sx={{}}>
                                      <InfoOutlinedIcon
                                        fontSize="small"
                                        sx={{
                                          color: 'text.secondary',
                                          display: 'block',
                                          cursor: 'pointer',
                                          mx: 'auto',
                                        }}
                                        onClick={e =>
                                          handlePopoverOpen(e, item.description)
                                        }
                                      />
                                    </TableCell>
                                    {/* <TableCell>{item.ielts}</TableCell> */}
                                    {/* <TableCell>{item.toefl}</TableCell> */}
                                    {/* <TableCell sx={{ px: 0.5 }}>
                              <Tooltip
                                title={
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      fontWeight={700}
                                      gutterBottom
                                    >
                                      {item.level}
                                    </Typography>
                                    <Typography variant="caption">
                                      {item.description}
                                    </Typography>
                                  </Box>
                                }
                                arrow
                                placement="right"
                              >
                                <InfoOutlinedIcon
                                  fontSize="small"
                                  sx={{
                                    color: 'text.secondary',
                                    display: 'block',
                                    cursor: 'help',
                                  }}
                                />
                              </Tooltip>
                            </TableCell> */}
                                  </TableRow>
                                );
                              })}
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
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, color: 'text.secondary' }}
                    >
                      This value indicates the error type compared to the
                      reference text. Options include whether a word is omitted,
                      inserted, or improperly inserted with a break. It also
                      indicates a missing break at punctuation. It also
                      indicates whether a word is badly pronounced, or
                      monotonically rising, falling, or flat on the utterance.
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
                          {errorItems.map(item => (
                            <TableRow
                              key={item.label}
                              hover
                              sx={{ cursor: 'default' }}
                            >
                              <TableCell sx={{ width: '80%' }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Chip
                                    label={item.value}
                                    size="small"
                                    sx={{
                                      backgroundColor: `${item.color}22`,
                                      color: item.color,
                                      fontWeight: 700,
                                      border: `1px solid ${item.color}`,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {item.label}
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
                                    handlePopoverOpen(e, item.description)
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
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
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, color: 'text.secondary' }}
                    >
                      Overall score of the pronunciation quality of the given
                      speech. Score is calculated from Accuracy, Fluency,
                      Completeness, and Prosody with weight, provided that
                      Prosody and Completeness are available.
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
                          {scoreItems.map(item => {
                            const itemColor = getGaugeColor(item.value);
                            return (
                              <TableRow
                                key={item.label}
                                hover
                                sx={{ cursor: 'default' }}
                              >
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
                                      {item.label}
                                    </Typography>
                                  </Box>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <Box sx={{ flex: 1, minWidth: 60 }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={item.value}
                                        sx={{
                                          height: 8,
                                          borderRadius: 4,
                                          backgroundColor: `${itemColor}22`,
                                          '& .MuiLinearProgress-bar': {
                                            borderRadius: 4,
                                            backgroundColor: itemColor,
                                          },
                                        }}
                                      />
                                    </Box>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontWeight: 700,
                                        color: itemColor,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {item.value} / 100
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
                                      handlePopoverOpen(e, item.description)
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

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
                      Here is the detailed feedback on your pronunciation. Words
                      in green are pronounced well, while words in red indicate
                      mispronunciations. Pay attention to the mispronounced
                      words and practice them to improve your pronunciation
                      skills.
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

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
    </DashboardLayout>
  );
}
