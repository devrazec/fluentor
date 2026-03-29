'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { GlobalContext } from '../../context/GlobalContext';
import { flushSync } from 'react-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import { Play, Pause, Repeat } from 'iconsax-reactjs';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

const LEVELS = [
  { key: 'basic', label: 'Basic', mp3Key: 'basic_mp3' },
  { key: 'intermediate', label: 'Intermediate', mp3Key: 'intermediate_mp3' },
  { key: 'advanced', label: 'Advanced', mp3Key: 'advanced_mp3' },
];

export default function StoryPage() {
  const { dbStory, mobileDevice } = useContext(GlobalContext);

  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('basic');
  const [voiceGender, setVoiceGender] = useState('female');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loop, setLoop] = useState(false);

  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const resumeOnLoadRef = useRef(false);

  // Auto-select first story
  useEffect(() => {
    if (!selectedStoryId && dbStory?.length > 0) {
      const first = [...dbStory].sort((a, b) =>
        a.title.localeCompare(b.title)
      )[0];
      setSelectedStoryId(first.id);
    }
  }, [dbStory]);

  const story = dbStory?.find(s => s.id === selectedStoryId) ?? null;
  const levelInfo = LEVELS.find(l => l.key === selectedLevel);
  const mp3File = story?.[levelInfo.mp3Key] ?? null;
  const storyText = story?.[levelInfo.key] ?? '';

  const startRaf = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = () => {
      if (audioRef.current)
        flushSync(() => setCurrentTime(audioRef.current.currentTime));
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

  useEffect(() => () => stopRaf(), []);

  // Reset player when story or level changes
  useEffect(() => {
    stopRaf();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [selectedStoryId, selectedLevel]);

  // Apply playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      stopRaf();
    } else {
      audio.play().catch(() => {});
      startRaf();
    }
    setIsPlaying(v => !v);
  }, [isPlaying, startRaf, stopRaf]);

  const handleSeek = (_, value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const storyWords = useMemo(
    () => storyText.split(' ').filter(Boolean),
    [storyText]
  );

  const wordTimings = useMemo(() => {
    if (!storyWords.length || !duration) return [];
    const totalChars = storyWords.reduce((sum, w) => sum + w.length, 0) || 1;
    let acc = 0;
    return storyWords.map(w => {
      const start = (acc / totalChars) * duration;
      acc += w.length;
      return start;
    });
  }, [storyWords, duration]);

  const activeWordIndex = useMemo(() => {
    if (currentTime <= 0 || !wordTimings.length) return -1;
    let idx = 0;
    for (let i = 0; i < wordTimings.length; i++) {
      if (wordTimings[i] <= currentTime) idx = i;
      else break;
    }
    return idx;
  }, [currentTime, wordTimings]);

  function getStoryPreview(title) {
    if (mobileDevice)
      return title.length > 28 ? title.slice(0, 28) + '…' : title;
    return title;
  }

  return (
    <DashboardLayout>
      <Box
        sx={{
          width: '100%',
          maxWidth: 800,
          mx: 'auto',
          px: { xs: 2, sm: 0 },
          mt: 2,
        }}
      >
        <Card sx={{ borderRadius: 1, boxShadow: 2, mb: 3 }}>
          {story?.image && (
            <CardMedia
              component="img"
              height={mobileDevice ? '160' : '200'}
              //image={`/img/story/${story.image}`}
              image={`/img/category/2.jpg`} // --- TEMP ---`}
              alt={story.title}
              sx={{ objectFit: 'cover', objectPosition: 'top' }}
            />
          )}
          <CardContent>
            {/* Story title selector */}
            <FormControl size="small" sx={{ width: '100%', mb: 2 }}>
              <InputLabel>Story</InputLabel>
              <Select
                value={selectedStoryId ?? ''}
                onChange={e => {
                  setSelectedStoryId(e.target.value);
                }}
                renderValue={selected => {
                  const s = dbStory?.find(item => item.id === selected);
                  return s ? getStoryPreview(s.title) : '';
                }}
                input={<OutlinedInput label="Story" />}
                MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
              >
                {[...(dbStory ?? [])]
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.title}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Level selector */}
            <ToggleButtonGroup
              value={selectedLevel}
              exclusive
              onChange={(_, val) => {
                if (val !== null) setSelectedLevel(val);
              }}
              sx={{
                display: 'flex',
                width: '100%',
                gap: 1,
                mb: 2,
                '& .MuiToggleButtonGroup-grouped': {
                  borderRadius: '8px !important',
                  border: '1px solid rgba(0,0,0,0.12) !important',
                  mx: 0,
                },
              }}
            >
              {LEVELS.map((l, index) => (
                <ToggleButton
                  key={l.key}
                  value={l.key}
                  sx={{
                    flex: 1,
                    py: 1,
                    textTransform: 'none',
                    position: 'relative',
                    '&:hover': { bgcolor: '#00a76f1f' },
                    backgroundColor:
                      selectedLevel === l.key
                        ? '#00a76f1f !important'
                        : undefined,
                    borderColor:
                      selectedLevel === l.key
                        ? '#00a76f1f !important'
                        : undefined,
                  }}
                >
                  {selectedLevel === l.key && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 7,
                        right: 7,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#00a76f',
                        boxShadow: '0 0 0 2px rgba(0,167,111,0.25)',
                      }}
                    />
                  )}
                  <Typography variant="caption" fontWeight={700}>
                    {l.label}
                  </Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {story && mp3File && (
              <audio
                key={mp3File + voiceGender}
                ref={audioRef}
                src={`/mp3/story/${voiceGender}/${mp3File}`}
                onLoadedMetadata={() => {
                  if (audioRef.current) {
                    setDuration(audioRef.current.duration);
                    audioRef.current.playbackRate = playbackRate;
                    if (resumeOnLoadRef.current) {
                      resumeOnLoadRef.current = false;
                      audioRef.current.play().catch(() => {});
                      startRaf();
                      setIsPlaying(true);
                    }
                  }
                }}
                onEnded={() => {
                  stopRaf();
                  if (!loop) {
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }
                }}
                loop={loop}
              />
            )}

            {/* Story text */}
            {storyText ? (
              <>
                <Box
                  sx={{
                    lineHeight: 1.9,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  {storyWords.map((word, i) => (
                    <span
                      key={i}
                      style={{
                        transition: 'background 0.15s, color 0.15s',
                        backgroundColor:
                          activeWordIndex >= 0 && i <= activeWordIndex
                            ? i === activeWordIndex
                              ? '#00a76f'
                              : 'rgba(0,167,111,0.2)'
                            : 'transparent',
                        color:
                          activeWordIndex >= 0 && i === activeWordIndex
                            ? '#fff'
                            : 'inherit',
                        borderRadius: 4,
                        padding: '1px 3px',
                        marginRight: 2,
                        display: 'inline-block',
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </Box>
                <Divider sx={{ mb: 2 }} />
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No story text available for this level.
              </Typography>
            )}

            {/* Seek bar */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 0.5 }}
            >
              <IconButton
                onClick={handlePlayPause}
                disabled={!mp3File}
                sx={{
                  bgcolor: '#00a76f',
                  color: '#fff',
                  '&:hover': { bgcolor: '#007a52' },
                  '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
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
                color="text.secondary"
                sx={{ minWidth: 32, textAlign: 'right' }}
              >
                {formatTime(currentTime)}
              </Typography>
              <Slider
                size="small"
                min={0}
                max={duration || 1}
                value={currentTime}
                onChange={handleSeek}
                disabled={!mp3File}
                sx={{
                  flex: 1,
                  color: '#00a76f',
                  '& .MuiSlider-thumb': { width: 12, height: 12 },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ minWidth: 32 }}
              >
                {formatTime(duration)}
              </Typography>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            {/* Controls row */}
            <Stack direction="row" alignItems="center" spacing={0.75}>
              {/* Loop */}
              <IconButton
                size="small"
                onClick={() => setLoop(v => !v)}
                sx={{
                  border: '1px solid',
                  borderColor: loop ? '#00a76f' : 'divider',
                  color: loop ? '#00a76f' : 'text.secondary',
                  bgcolor: loop ? 'rgba(0,167,111,0.08)' : 'transparent',
                  width: 34,
                  height: 34,
                  '&:hover': {
                    bgcolor: loop ? 'rgba(0,167,111,0.18)' : 'action.hover',
                  },
                }}
              >
                <Repeat size={18} variant={loop ? 'Bulk' : 'Linear'} />
              </IconButton>

              {/* Male voice */}
              <IconButton
                size="small"
                onClick={() => {
                  if (voiceGender === 'male') return;
                  resumeOnLoadRef.current = isPlaying;
                  stopRaf();
                  setIsPlaying(false);
                  setCurrentTime(0);
                  setVoiceGender('male');
                }}
                sx={{
                  border: '1px solid',
                  borderColor: voiceGender === 'male' ? '#00a76f' : 'divider',
                  color: voiceGender === 'male' ? '#00a76f' : 'text.secondary',
                  bgcolor:
                    voiceGender === 'male'
                      ? 'rgba(0,167,111,0.08)'
                      : 'transparent',
                  width: 34,
                  height: 34,
                  '&:hover': {
                    bgcolor:
                      voiceGender === 'male'
                        ? 'rgba(0,167,111,0.18)'
                        : 'action.hover',
                  },
                }}
              >
                <ManIcon sx={{ fontSize: 18 }} />
              </IconButton>

              {/* Female voice */}
              <IconButton
                size="small"
                onClick={() => {
                  if (voiceGender === 'female') return;
                  resumeOnLoadRef.current = isPlaying;
                  stopRaf();
                  setIsPlaying(false);
                  setCurrentTime(0);
                  setVoiceGender('female');
                }}
                sx={{
                  border: '1px solid',
                  borderColor: voiceGender === 'female' ? '#00a76f' : 'divider',
                  color:
                    voiceGender === 'female' ? '#00a76f' : 'text.secondary',
                  bgcolor:
                    voiceGender === 'female'
                      ? 'rgba(0,167,111,0.08)'
                      : 'transparent',
                  width: 34,
                  height: 34,
                  '&:hover': {
                    bgcolor:
                      voiceGender === 'female'
                        ? 'rgba(0,167,111,0.18)'
                        : 'action.hover',
                  },
                }}
              >
                <WomanIcon sx={{ fontSize: 18 }} />
              </IconButton>

              <Box sx={{ flex: 1 }} />

              {/* Speed buttons */}
              {[0.75, 1, 1.2].map(r => (
                <IconButton
                  key={r}
                  size="small"
                  onClick={() => setPlaybackRate(r)}
                  sx={{
                    border: '1px solid',
                    borderColor: playbackRate === r ? '#00a76f' : 'divider',
                    bgcolor: playbackRate === r ? '#00a76f' : 'transparent',
                    color: playbackRate === r ? '#fff' : 'text.secondary',
                    borderRadius: '50%',
                    width: 34,
                    height: 34,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    '&:hover': {
                      bgcolor: playbackRate === r ? '#007a52' : 'action.hover',
                    },
                  }}
                >
                  {r}x
                </IconButton>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
