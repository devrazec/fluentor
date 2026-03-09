'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
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
import { flushSync } from 'react-dom';

// ─── Mock pronunciation assessment result ─────────────────────────────────────
const MOCK_RESULT = {
  audioUrl: null, // replace with real URL
  overallScore: 88,
  accuracyScore: 92,
  fluencyScore: 84,
  completenessScore: 93,
  prosodyScore: 87,
  duration: 16, // seconds
  words: [
    { text: 'today', type: 'correct' },
    { text: 'was', type: 'correct' },
    { text: 'a', type: 'correct' },
    { text: 'beautiful', type: 'correct' },
    { text: 'day.', type: 'correct' },
    { text: 'we', type: 'correct' },
    { text: 'had', type: 'correct' },
    { text: 'a', type: 'correct' },
    { text: 'great', type: 'correct' },
    { text: 'time', type: 'correct' },
    { text: 'taking', type: 'correct' },
    { text: 'a', type: 'correct' },
    { text: 'long', type: 'unexpectedBreak' },
    { text: '[long]', type: 'omission' },
    { text: 'walk', type: 'correct' },
    { text: '[outside]', type: 'insertion' },
    { text: 'in', type: 'correct' },
    { text: 'the', type: 'correct' },
    { text: 'morning.', type: 'correct' },
    { text: 'the', type: 'correct' },
    { text: 'countryside', type: 'mispronunciation' },
    { text: 'was', type: 'correct' },
    { text: 'in', type: 'correct' },
    { text: 'full', type: 'correct' },
    { text: 'bloom,', type: 'correct' },
    { text: 'yet', type: 'correct' },
    { text: 'the', type: 'correct' },
    { text: 'air', type: 'correct' },
    { text: 'was', type: 'correct' },
    { text: 'crisp', type: 'correct' },
    { text: 'and', type: 'correct' },
    { text: 'cold.', type: 'correct' },
    { text: 'towards', type: 'correct' },
    { text: 'the', type: 'correct' },
    { text: 'end', type: 'correct' },
    { text: 'of', type: 'correct' },
    { text: '[the]', type: 'insertion' },
    { text: 'the', type: 'correct' },
    { text: 'day,', type: 'correct' },
    { text: 'clouds', type: 'correct' },
    { text: 'came', type: 'correct' },
    { text: 'in,', type: 'correct' },
    { text: 'forecasting', type: 'correct' },
    { text: 'much', type: 'correct' },
    { text: 'needed', type: 'correct' },
    { text: 'rain.', type: 'correct' },
  ],
  errors: {
    mispronunciation: 1,
    omission: 2,
    insertion: 1,
    unexpectedBreak: 1,
    missingBreak: 0,
    monotone: 0,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

function scoreColor(score) {
  if (score >= 80) return '#00A76F';
  if (score >= 60) return '#FFAB00';
  return '#FF5630';
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({ score, size = 160, strokeWidth = 18 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#DFE3E8"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" fontWeight={700} color={color}>
          {score}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Score bar row ────────────────────────────────────────────────────────────
function ScoreBar({ label, score }) {
  const color = scoreColor(score);
  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 0.4 }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Tooltip title={`${label}: ${score}/100`} placement="top">
            <InfoOutlinedIcon
              sx={{ fontSize: 14, color: 'text.disabled', cursor: 'pointer' }}
            />
          </Tooltip>
        </Stack>
        <Typography variant="body2" fontWeight={600}>
          {score} / 100
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: '#DFE3E8',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
        }}
      />
    </Box>
  );
}

// ─── Word rendering ───────────────────────────────────────────────────────────
function WordToken({ word, visible }) {
  const { text, type } = word;

  if (!visible) {
    // If this error type is toggled off, render as plain correct word
    return <span style={{ marginRight: 4 }}>{text} </span>;
  }

  const styles = {
    correct: { marginRight: 4 },
    mispronunciation: {
      marginRight: 4,
      color: '#B76E00',
      textDecoration: 'underline',
      textDecorationColor: '#FFAB00',
      textDecorationThickness: 2,
      fontWeight: 600,
    },
    omission: {
      marginRight: 4,
      color: '#FF5630',
      textDecoration: 'line-through',
      fontWeight: 600,
    },
    insertion: {
      marginRight: 4,
      display: 'inline-block',
      border: '1px solid #637381',
      borderRadius: 2,
      padding: '0 3px',
      color: 'text.secondary',
      fontSize: '0.95em',
    },
    unexpectedBreak: {
      marginRight: 4,
      display: 'inline-block',
      backgroundColor: 'rgba(255,86,48,0.12)',
      borderRadius: 3,
      padding: '0 3px',
      color: '#B71D18',
      fontWeight: 600,
    },
    missingBreak: {
      marginRight: 4,
      display: 'inline-block',
      backgroundColor: 'rgba(0,184,217,0.12)',
      borderRadius: 3,
      padding: '0 3px',
      color: '#006C9C',
      fontWeight: 600,
    },
    monotone: {
      marginRight: 4,
      display: 'inline-block',
      backgroundColor: 'rgba(142,51,255,0.1)',
      borderRadius: 3,
      padding: '0 3px',
      color: '#5119B7',
      fontWeight: 600,
    },
  };

  return <span style={styles[type] || styles.correct}>{text} </span>;
}

// ─── Error toggle row ─────────────────────────────────────────────────────────
function ErrorRow({ count, label, checked, onChange, badgeColor }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" alignItems="center" spacing={1}>
        <Chip
          label={count}
          size="small"
          sx={{
            bgcolor: badgeColor,
            color: '#fff',
            fontWeight: 700,
            minWidth: 28,
            height: 22,
            fontSize: 12,
          }}
        />
        <Stack direction="row" alignItems="center" spacing={0.4}>
          <Typography variant="body2">{label}</Typography>
          <Tooltip title={label} placement="top">
            <InfoOutlinedIcon
              sx={{ fontSize: 14, color: 'text.disabled', cursor: 'pointer' }}
            />
          </Tooltip>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Switch
          size="small"
          checked={checked}
          onChange={onChange}
          color="primary"
        />
        <Typography variant="caption" color="text.secondary">
          {checked ? 'On' : 'Off'}
        </Typography>
      </Stack>
    </Stack>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TestPage() {
  const result = MOCK_RESULT;

  // Audio player
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(result.duration);

  const startRaf = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = () => {
      if (audioRef.current) {
        flushSync(() => setCurrentTime(audioRef.current.currentTime));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => () => stopRaf(), [stopRaf]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      stopRaf();
      setIsPlaying(false);
    } else {
      audio.play();
      startRaf();
      setIsPlaying(true);
    }
  };

  const handleSeek = (_, val) => {
    if (audioRef.current) audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  // Error visibility toggles
  const [showErrors, setShowErrors] = useState({
    mispronunciation: true,
    omission: true,
    insertion: true,
    unexpectedBreak: true,
    missingBreak: true,
    monotone: true,
  });

  const toggleError = key => () =>
    setShowErrors(prev => ({ ...prev, [key]: !prev[key] }));

  const typeToKey = {
    mispronunciation: 'mispronunciation',
    omission: 'omission',
    insertion: 'insertion',
    unexpectedBreak: 'unexpectedBreak',
    missingBreak: 'missingBreak',
    monotone: 'monotone',
  };

  return (
    <DashboardLayout>
      <Box
        sx={{
          width: '100%',
          maxWidth: 960,
          mx: 'auto',
          px: { xs: 2, sm: 2 },
          mt: 2,
        }}
      >
        {/* ── Top: text panel + errors panel ─────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch', mb: 2 }}>
          {/* Left: audio bar + annotated text */}
          <Card
            sx={{ flex: 1, borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}
          >
            {/* Audio bar */}
            <Box
              sx={{
                bgcolor: 'grey.800',
                px: 2,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              {result.audioUrl && (
                <audio
                  ref={audioRef}
                  src={result.audioUrl}
                  onLoadedMetadata={() =>
                    setDuration(audioRef.current.duration)
                  }
                  onEnded={() => {
                    stopRaf();
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                />
              )}

              <IconButton
                onClick={handlePlayPause}
                size="small"
                sx={{
                  bgcolor: '#00A76F',
                  color: '#fff',
                  '&:hover': { bgcolor: '#007867' },
                  width: 34,
                  height: 34,
                  flexShrink: 0,
                }}
              >
                {isPlaying ? (
                  <Pause variant="Bulk" size={18} />
                ) : (
                  <Play variant="Bulk" size={18} />
                )}
              </IconButton>

              <Typography
                variant="caption"
                sx={{ color: '#fff', minWidth: 34, fontFamily: 'monospace' }}
              >
                {formatTime(currentTime)}
              </Typography>

              <Slider
                size="small"
                min={0}
                max={duration || 1}
                value={currentTime}
                onChange={handleSeek}
                sx={{
                  flex: 1,
                  color: '#00A76F',
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                    bgcolor: '#fff',
                  },
                  '& .MuiSlider-track': { bgcolor: '#00A76F', border: 'none' },
                  '& .MuiSlider-rail': { bgcolor: '#637381' },
                }}
              />

              <Typography
                variant="caption"
                sx={{ color: '#fff', minWidth: 34, fontFamily: 'monospace' }}
              >
                {formatTime(duration)}
              </Typography>

              <Tooltip title="Download recording">
                <IconButton
                  size="small"
                  sx={{ color: '#fff', '&:hover': { color: '#00A76F' } }}
                >
                  <DocumentDownload size={18} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Annotated text */}
            <CardContent sx={{ p: 3 }}>
              <Typography
                component="div"
                sx={{
                  lineHeight: 2.2,
                  fontSize: '1.05rem',
                  color: 'text.primary',
                }}
              >
                {result.words.map((word, i) => (
                  <WordToken
                    key={i}
                    word={word}
                    visible={
                      word.type === 'correct' ||
                      showErrors[typeToKey[word.type]]
                    }
                  />
                ))}
              </Typography>
            </CardContent>
          </Card>

          {/* Right: Errors panel */}
          <Card
            sx={{ width: 260, flexShrink: 0, borderRadius: 2, boxShadow: 2 }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Errors
              </Typography>
              <Stack spacing={1.5}>
                <ErrorRow
                  count={result.errors.mispronunciation}
                  label="Mispronunciations"
                  checked={showErrors.mispronunciation}
                  onChange={toggleError('mispronunciation')}
                  badgeColor="#FFAB00"
                />
                <Divider />
                <ErrorRow
                  count={result.errors.omission}
                  label="Omissions"
                  checked={showErrors.omission}
                  onChange={toggleError('omission')}
                  badgeColor="#637381"
                />
                <Divider />
                <ErrorRow
                  count={result.errors.insertion}
                  label="Insertions"
                  checked={showErrors.insertion}
                  onChange={toggleError('insertion')}
                  badgeColor="#637381"
                />
                <Divider />
                <ErrorRow
                  count={result.errors.unexpectedBreak}
                  label="Unexpected break"
                  checked={showErrors.unexpectedBreak}
                  onChange={toggleError('unexpectedBreak')}
                  badgeColor="#FF5630"
                />
                <Divider />
                <ErrorRow
                  count={result.errors.missingBreak}
                  label="Missing break"
                  checked={showErrors.missingBreak}
                  onChange={toggleError('missingBreak')}
                  badgeColor="#637381"
                />
                <Divider />
                <ErrorRow
                  count={result.errors.monotone}
                  label="Monotone"
                  checked={showErrors.monotone}
                  onChange={toggleError('monotone')}
                  badgeColor="#637381"
                />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* ── Bottom: score donut + score breakdown ───────────────────── */}
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 4,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {/* Donut + label */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  Pronunciation score
                </Typography>
                <DonutChart
                  score={result.overallScore}
                  size={160}
                  strokeWidth={18}
                />

                {/* Legend */}
                <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                  {[
                    { color: '#FF5630', label: '0 ~ 59' },
                    { color: '#FFAB00', label: '60 ~ 79' },
                    { color: '#00A76F', label: '80 ~ 100' },
                  ].map(({ color, label }) => (
                    <Stack
                      key={label}
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '2px',
                          bgcolor: color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

              {/* Score breakdown */}
              <Box sx={{ flex: 1, minWidth: 260 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Score breakdown
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  <ScoreBar
                    label="Accuracy score"
                    score={result.accuracyScore}
                  />
                  <ScoreBar label="Fluency score" score={result.fluencyScore} />
                  <ScoreBar
                    label="Completeness score"
                    score={result.completenessScore}
                  />
                  <ScoreBar label="Prosody score" score={result.prosodyScore} />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
