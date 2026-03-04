'use client';

import React, { useState, useEffect, useRef, useCallback, useContext, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { GlobalContext } from '../../context/GlobalContext';
import { useRouter } from 'next/navigation';
import { flushSync } from 'react-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import { Play, Pause, VolumeHigh, VolumeMute, Repeat } from 'iconsax-reactjs';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

function getPreview(name) {
  return name.split(' ').slice(0, 5).join(' ') + '…';
}

export default function PracticePage() {

  const {
    dbQuestion,
    dbCategory,
    dbTense,
    dbAnswer,
    selectedQuestion,
    currentAnswer,
    selectedAnswer, setSelectedAnswer,
  } = useContext(GlobalContext);

  const router = useRouter();

  useEffect(() => {
    if (!selectedQuestion || (Array.isArray(selectedQuestion) && selectedQuestion.length === 0)) {
      router.replace('/pages/Question');
    }
  }, [selectedQuestion]);

  // Answer audio player state
  const audioRef = useRef(null);
  const answerRafRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loop, setLoop] = useState(false);

  // Question audio player state
  const questionAudioRef = useRef(null);
  const questionRafRef = useRef(null);
  const [qIsPlaying, setQIsPlaying] = useState(false);
  const [qCurrentTime, setQCurrentTime] = useState(0);
  const [qDuration, setQDuration] = useState(0);
  const [qPlaybackRate, setQPlaybackRate] = useState(1);
  const [qLoop, setQLoop] = useState(false);

  // rAF polling helpers
  const startAnswerRaf = useCallback(() => {
    if (answerRafRef.current) cancelAnimationFrame(answerRafRef.current);
    const tick = () => {
      if (audioRef.current) {
        flushSync(() => setCurrentTime(audioRef.current.currentTime));
      }
      answerRafRef.current = requestAnimationFrame(tick);
    };
    answerRafRef.current = requestAnimationFrame(tick);
  }, []);
  const stopAnswerRaf = useCallback(() => {
    if (answerRafRef.current) {
      cancelAnimationFrame(answerRafRef.current);
      answerRafRef.current = null;
    }
  }, []);

  const startQuestionRaf = useCallback(() => {
    if (questionRafRef.current) cancelAnimationFrame(questionRafRef.current);
    const tick = () => {
      if (questionAudioRef.current) {
        flushSync(() => setQCurrentTime(questionAudioRef.current.currentTime));
      }
      questionRafRef.current = requestAnimationFrame(tick);
    };
    questionRafRef.current = requestAnimationFrame(tick);
  }, []);
  const stopQuestionRaf = useCallback(() => {
    if (questionRafRef.current) {
      cancelAnimationFrame(questionRafRef.current);
      questionRafRef.current = null;
    }
  }, []);

  // Cleanup rAF on unmount
  useEffect(() => () => { stopAnswerRaf(); stopQuestionRaf(); }, []);

  useEffect(() => {
    if (currentAnswer?.length > 0) {
      setSelectedAnswer(currentAnswer[0].id);
    }
  }, [currentAnswer]);

  // Reset answer player when answer changes
  useEffect(() => {
    stopAnswerRaf();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [selectedAnswer]);

  // Reset question player when question changes
  useEffect(() => {
    stopQuestionRaf();
    if (questionAudioRef.current) {
      questionAudioRef.current.pause();
      questionAudioRef.current.currentTime = 0;
    }
    setQIsPlaying(false);
    setQCurrentTime(0);
    setQDuration(0);
  }, [selectedQuestion]);

  // Apply answer playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // Apply question playback rate
  useEffect(() => {
    if (questionAudioRef.current) questionAudioRef.current.playbackRate = qPlaybackRate;
  }, [qPlaybackRate]);

  const handleQPlayPause = useCallback(() => {
    const audio = questionAudioRef.current;
    if (!audio) return;
    if (qIsPlaying) {
      audio.pause();
      stopQuestionRaf();
    } else {
      audio.play().catch(() => { });
      startQuestionRaf();
    }
    setQIsPlaying(!qIsPlaying);
  }, [qIsPlaying, startQuestionRaf, stopQuestionRaf]);

  const handleQSeek = (_, value) => {
    if (questionAudioRef.current) {
      questionAudioRef.current.currentTime = value;
      setQCurrentTime(value);
    }
  };

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      stopAnswerRaf();
    } else {
      audio.play().catch(() => { });
      startAnswerRaf();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, startAnswerRaf, stopAnswerRaf]);

  const handleTimeUpdate = () => { }; // replaced by rAF

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = playbackRate;
    }
  };

  const handleEnded = () => {
    stopAnswerRaf();
    if (!loop) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSeek = (_, value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (_, value) => {
    if (audioRef.current) audioRef.current.volume = value;
    setVolume(value);
    setMuted(value === 0);
  };

  const handleMuteToggle = () => {
    if (!audioRef.current) return;
    const next = !muted;
    audioRef.current.muted = next;
    setMuted(next);
  };

  const answer = currentAnswer?.find(a => a.id === selectedAnswer);

  const answerWords = useMemo(() => answer?.name?.split(' ') ?? [], [answer]);
  const answerTotalDuration = duration || 1;
  const activeWordIndex = currentTime > 0
    ? Math.min(Math.floor((currentTime / answerTotalDuration) * answerWords.length), answerWords.length - 1)
    : -1;

  const questionWords = useMemo(() => selectedQuestion?.name?.split(' ') ?? [], [selectedQuestion]);
  const qTotalDuration = qDuration || 1;
  const qActiveWordIndex = qCurrentTime > 0
    ? Math.min(Math.floor((qCurrentTime / qTotalDuration) * questionWords.length), questionWords.length - 1)
    : -1;

  return (
    <DashboardLayout>
      <Box
        sx={{
          width: '100%',
          maxWidth: 700,
          mx: 'auto',
          px: { xs: 2, sm: 0 },
          mt: 2,
        }}
      >
        {/* Question Card */}
        <Card sx={{ borderRadius: 1, boxShadow: 2, mb: 3 }}>
          <CardMedia
            component="img"
            height="160"
            image={
              selectedQuestion?.category_image
                ? `/img/category/${selectedQuestion.category_image}`
                : `/img/category/${selectedQuestion?.id_category}.jpg`
            }
            alt={selectedQuestion?.category_name}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1,
                mb: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                label={selectedQuestion?.category_name}
                size="small"
                variant="outlined"
              />
              <Chip
                label={selectedQuestion?.tense_name}
                size="small"
                variant="outlined"
                color="primary"
              />
            </Box>
            <Box sx={{ lineHeight: 1.9, fontSize: '1.25rem', fontWeight: 700, mb: 0.5 }}>
              {questionWords.map((word, i) => (
                <span
                  key={i}
                  style={{
                    transition: 'background 0.15s, color 0.15s',
                    backgroundColor: i === qActiveWordIndex ? '#00a76f' : 'transparent',
                    color: i === qActiveWordIndex ? '#fff' : 'inherit',
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

            {/* Question audio player */}
            {selectedQuestion?.mp3 && (
              <>
                <audio
                  key={selectedQuestion.mp3}
                  ref={questionAudioRef}
                  src={`/mp3/question/${selectedQuestion.mp3}`}
                  onTimeUpdate={() => { }}
                  onLoadedMetadata={() => {
                    if (questionAudioRef.current) {
                      setQDuration(questionAudioRef.current.duration);
                      questionAudioRef.current.playbackRate = qPlaybackRate;
                    }
                  }}
                  onEnded={() => { stopQuestionRaf(); if (!qLoop) { setQIsPlaying(false); setQCurrentTime(0); } }}
                  loop={qLoop}
                />
                <Divider sx={{ my: 1.5 }} />
                <Slider
                  size="small"
                  min={0}
                  max={qDuration || 1}
                  value={qCurrentTime}
                  onChange={handleQSeek}
                  sx={{
                    color: '#00a76f',
                    '& .MuiSlider-thumb': { width: 12, height: 12 },
                    mb: 0.5,
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">{formatTime(qCurrentTime)}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatTime(qDuration)}</Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <IconButton
                    onClick={handleQPlayPause}
                    sx={{ bgcolor: '#00a76f', color: '#fff', '&:hover': { bgcolor: '#007a52' } }}
                  >
                    {qIsPlaying ? <Pause variant="Bulk" size={22} /> : <Play variant="Bulk" size={22} />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setQLoop(v => !v)}
                    sx={{ color: qLoop ? '#00a76f' : 'text.secondary' }}
                  >
                    <Repeat size={18} variant={qLoop ? 'Bulk' : 'Linear'} />
                  </IconButton>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ flex: 1 }} />
                  <ToggleButtonGroup
                    value={qPlaybackRate}
                    exclusive
                    size="small"
                    onChange={(_, val) => { if (val !== null) setQPlaybackRate(val); }}
                  >
                    {[0.75, 1, 1.2].map(r => (
                      <ToggleButton key={r} value={r} sx={{ px: 1, py: 0.25, fontSize: '0.7rem', lineHeight: 1.4 }}>
                        {r}x
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        {/* Answer Player Card */}
        {answer && (
          <Card sx={{ borderRadius: 1, boxShadow: 2 }}>
            <CardContent>
              {/* Answer Selector */}
              <ToggleButtonGroup
                value={selectedAnswer}
                exclusive
                onChange={(_, val) => {
                  if (val !== null) {
                    setSelectedAnswer(val);
                    setIsPlaying(false);
                  }
                }}
                sx={{ display: 'flex', flexWrap: { xs: 'wrap', sm: 'nowrap' }, width: '100%', gap: 1, mb: 2, '& .MuiToggleButtonGroup-grouped': { borderRadius: '8px !important', border: '1px solid rgba(0,0,0,0.12) !important', mx: 0 } }}
              >
                {currentAnswer?.map((a, index) => (
                  <ToggleButton
                    key={a.id}
                    value={a.id}
                    sx={{ flex: { xs: '1 1 calc(50% - 4px)', sm: 1 }, minWidth: 0, flexDirection: 'column', alignItems: 'flex-start', px: 1.5, py: 1, textAlign: 'left', textTransform: 'none' }}
                  >
                    <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5 }}>Answer {index + 1}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ width: '100%', display: 'block' }}>
                      {getPreview(a.name)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      <Chip label={`${a.timed}sec`} size="small" color="primary" variant="outlined" sx={{ pointerEvents: 'none' }} />
                      <Chip label={`${a.word}words`} size="small" variant="outlined" sx={{ pointerEvents: 'none' }} />
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {/* Hidden audio element */}
              {answer.mp3 && (
                <audio
                  key={answer.mp3}
                  ref={audioRef}
                  src={`/mp3/answer/${answer.mp3}`}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleEnded}
                  loop={loop}
                />
              )}

              {/* Answer text with word highlighting */}
              <Box sx={{ mb: 2, lineHeight: 1.9, fontSize: '1.25rem', fontWeight: 700 }}>
                {answerWords.map((word, i) => (
                  <span
                    key={i}
                    style={{
                      transition: 'background 0.15s, color 0.15s',
                      backgroundColor: i === activeWordIndex ? '#00a76f' : 'transparent',
                      color: i === activeWordIndex ? '#fff' : 'inherit',
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

              {/* Progress bar */}
              <Slider
                size="small"
                min={0}
                max={duration || 1}
                value={currentTime}
                onChange={handleSeek}
                sx={{
                  color: '#00a76f',
                  '& .MuiSlider-thumb': { width: 12, height: 12 },
                  mb: 0.5,
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(duration)}
                </Typography>
              </Box>

              {/* Controls row */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                {/* Play / Pause */}
                <IconButton
                  onClick={handlePlayPause}
                  sx={{
                    bgcolor: '#00a76f',
                    color: '#fff',
                    '&:hover': { bgcolor: '#007a52' },
                  }}
                >
                  {isPlaying ? (
                    <Pause variant="Bulk" size={26} />
                  ) : (
                    <Play variant="Bulk" size={26} />
                  )}
                </IconButton>

                {/* Loop toggle */}
                <IconButton
                  size="small"
                  onClick={() => setLoop(v => !v)}
                  sx={{ color: loop ? '#00a76f' : 'text.secondary' }}
                >
                  <Repeat size={20} variant={loop ? 'Bulk' : 'Linear'} />
                </IconButton>

                {/* Volume mute toggle — hidden on mobile */}
                <IconButton
                  size="small"
                  onClick={handleMuteToggle}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  {muted || volume === 0 ? (
                    <VolumeMute size={20} />
                  ) : (
                    <VolumeHigh size={20} />
                  )}
                </IconButton>

                {/* Volume slider — hidden on mobile */}
                <Slider
                  size="small"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  sx={{
                    width: 80,
                    color: '#00a76f',
                    '& .MuiSlider-thumb': { width: 10, height: 10 },
                    display: { xs: 'none', sm: 'block' },
                  }}
                />
              </Stack>

              {/* Speed + chips row */}
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                <Box sx={{ flex: 1 }} />
                {/* Speed control */}
                <ToggleButtonGroup
                  value={playbackRate}
                  exclusive
                  size="small"
                  onChange={(_, val) => { if (val !== null) setPlaybackRate(val); }}
                >
                  {[0.75, 1, 1.2].map(r => (
                    <ToggleButton key={r} value={r} sx={{ px: 1, py: 0.25, fontSize: '0.7rem', lineHeight: 1.4 }}>
                      {r}x
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>


                {/* Chips */}
                {/* <Chip
                  label={`${answer.timed}s`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`${answer.word} words`}
                  size="small"
                  variant="outlined"
                /> */}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </DashboardLayout>
  );
}
