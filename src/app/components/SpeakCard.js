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
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  Microphone,
  Stop,
  Play,
  Pause,
  ArrowDown2,
  ArrowUp2,
} from 'iconsax-reactjs';

// ─── WAV helpers ─────────────────────────────────────────────────────────────

function encodeWav(audioBuffer) {
  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);
  const samples = new Int16Array(channelData.length);
  for (let i = 0; i < channelData.length; i++) {
    samples[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7fff;
  }
  const dataLength = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++)
      view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(44 + i * 2, samples[i], true);
  }
  return buffer;
}

async function convertBlobToWav(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const tmpCtx = new AudioContext();
  const decoded = await tmpCtx.decodeAudioData(arrayBuffer);
  await tmpCtx.close();
  const targetRate = 16000;
  const numFrames = Math.ceil(decoded.duration * targetRate);
  const offlineCtx = new OfflineAudioContext(1, numFrames, targetRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start();
  const resampled = await offlineCtx.startRendering();
  return new Blob([encodeWav(resampled)], { type: 'audio/wav' });
}

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Inline audio mini-player ─────────────────────────────────────────────────

function AudioPlayer({ url, color = 'primary', knownDuration = 0 }) {
  const audioRef = useRef(new Audio());
  const rafRef = useRef(null);
  const urlRef = useRef(url);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(false);
  const [duration, setDuration] = useState(0);

  const startRaf = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const audio = audioRef.current;
    const tick = () => {
      flushSync(() => setCurrentTime(audio.currentTime));
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

  // Cleanup on unmount
  useEffect(
    () => () => {
      stopRaf();
      audioRef.current.pause();
    },
    [stopRaf]
  );

  // Ended handler
  useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => {
      stopRaf();
      setPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [stopRaf]);

  // When URL changes: reset state, probe duration with a tmp element
  useEffect(() => {
    if (!url) return;
    urlRef.current = url;
    const audio = audioRef.current;
    stopRaf();
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    audio.pause();

    // Probe duration via a tmp element
    const tmp = new Audio();
    tmp.preload = 'metadata';
    tmp.addEventListener(
      'loadedmetadata',
      () => {
        if (isFinite(tmp.duration) && tmp.duration > 0)
          setDuration(tmp.duration);
        tmp.src = '';
      },
      { once: true }
    );
    tmp.src = url;
  }, [url, stopRaf]);

  // Exactly RecordPlayer's pattern: set src + load at click time, wait for canplay
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      stopRaf();
      setPlaying(false);
    } else {
      audio.src = urlRef.current;
      audio.load();
      audio.addEventListener(
        'canplay',
        () => {
          audio
            .play()
            .catch(err => console.error('Audio playback error:', err));
          startRaf();
          setPlaying(true);
        },
        { once: true }
      );
    }
  }, [playing, startRaf, stopRaf]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{ mt: 0.75, ml: 'auto', minWidth: 0, width: '100%' }}
    >
      <IconButton
        onClick={togglePlay}
        sx={{
          width: 26,
          height: 26,
          flexShrink: 0,
          backgroundColor: `${color}.main`,
          color: '#fff',
          '&:hover': { backgroundColor: `${color}.dark` },
        }}
      >
        {playing ? (
          <Pause size={18} variant="Bulk" />
        ) : (
          <Play size={18} variant="Bulk" />
        )}
      </IconButton>
      <Slider
        size="small"
        value={currentTime}
        max={duration || knownDuration || 1}
        onChange={(_, v) => {
          if (audioRef.current) audioRef.current.currentTime = v;
          setCurrentTime(v);
        }}
        sx={{ color: `${color}.main`, py: 0.5, minWidth: 0, flex: 1 }}
      />
      <Typography
        variant="caption"
        sx={{ whiteSpace: 'nowrap', flexShrink: 0, color: 'text.secondary' }}
      >
        {formatTime(currentTime)} / {formatTime(duration || knownDuration)}
      </Typography>
    </Stack>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        minWidth: 0,
      }}
    >
      {/* Bubble */}
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          backgroundColor: 'primary.main',
          backgroundOpacity: 0.12,
          bgcolor: theme => `${theme.palette.primary.main}22`,
          borderRadius: '12px 2px 12px 12px',
          px: 1.5,
          py: 1,
        }}
      >
        {msg.loading ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CircularProgress size={12} color="primary" />
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontStyle: 'italic' }}
            >
              Recognizing…
            </Typography>
          </Stack>
        ) : (
          msg.text && (
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {msg.text}
            </Typography>
          )
        )}
        {msg.audioUrl && (
          <AudioPlayer url={msg.audioUrl} knownDuration={msg.duration ?? 0} />
        )}
      </Box>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SpeakCard() {
  const { mobileDevice } = useContext(GlobalContext);

  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const recChunksRef = useRef([]);
  const recTimerRef = useRef(null);
  const recSecondsRef = useRef(0);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      clearInterval(recTimerRef.current);
      mediaRecorderRef.current?.stop();
    },
    []
  );

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recChunksRef.current = [];

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = e => {
        if (e.data.size > 0) recChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(recTimerRef.current);
        // Capture duration BEFORE resetting the counter
        const fallbackDuration = recSecondsRef.current;
        setIsRecording(false);
        setRecordingSeconds(0);
        recSecondsRef.current = 0;

        // Use the recorder's actual MIME type (Chrome=webm, Safari=mp4)
        const mimeType = mr.mimeType || 'audio/webm';
        const blob = new Blob(recChunksRef.current, { type: mimeType });
        const userAudioUrl = URL.createObjectURL(blob);
        const userMsgId = Date.now();

        // Probe duration via a tmp element before adding to state
        const tmp = new Audio();
        tmp.preload = 'metadata';
        let resolved = false;
        const addMsg = dur => {
          if (resolved) return;
          resolved = true;
          tmp.src = '';
          setMessages(prev => [
            ...prev,
            {
              id: userMsgId,
              role: 'user',
              text: '',
              loading: true,
              audioUrl: userAudioUrl,
              duration: dur,
            },
          ]);
        };
        tmp.addEventListener(
          'loadedmetadata',
          () =>
            addMsg(
              isFinite(tmp.duration) && tmp.duration > 0
                ? tmp.duration
                : fallbackDuration
            ),
          { once: true }
        );
        tmp.addEventListener('error', () => addMsg(fallbackDuration), {
          once: true,
        });
        setTimeout(() => addMsg(fallbackDuration), 500);
        tmp.src = userAudioUrl;

        setIsProcessing(true);
        try {
          const wavBlob = await convertBlobToWav(blob);
          const formData = new FormData();
          formData.append('audio', wavBlob, 'recording.wav');

          const res = await fetch('/api/speak', {
            method: 'POST',
            body: formData,
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error ?? `HTTP ${res.status}`);
          }
          const data = await res.json();

          setMessages(prev =>
            prev.map(m =>
              m.id === userMsgId
                ? { ...m, text: data.user_text, loading: false }
                : m
            )
          );
        } catch (err) {
          setMessages(prev =>
            prev.map(m =>
              m.id === userMsgId
                ? { ...m, text: `Error: ${err.message}`, loading: false }
                : m
            )
          );
        } finally {
          setIsProcessing(false);
        }
      };

      mr.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recSecondsRef.current = 0;
      recTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => {
          const next = s + 1;
          recSecondsRef.current = next;
          if (next >= 30) handleStopRecording();
          return next;
        });
      }, 1000);
    } catch {
      alert('Microphone access denied.');
    }
  }, [handleStopRecording]);

  return (
    <Grid
      size={{ xs: 12, md: 6 }}
      sx={{ mb: mobileDevice ? 12 : 12, height: '70vh', minHeight: 400 }}
    >
      <Card
        sx={{
          borderRadius: 1,
          boxShadow: 2,
          mb: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            '&:last-child': { pb: 2 },
          }}
        >
          {/* Header */}
          {/* <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: minimized ? 0 : 1 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tutor
            </Typography>
            <IconButton
              size="small"
              onClick={() => setMinimized(v => !v)}
              sx={{ color: 'text.secondary' }}
            >
              {minimized ? <ArrowUp2 size={18} /> : <ArrowDown2 size={18} />}
            </IconButton>
          </Stack> */}

          <>
            {/* <Divider sx={{ mb: 1.5 }} /> */}

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                pr: 0.5,
              }}
            >
              {/* Initial instruction */}
              {messages.length === 0 && (
                <Box
                  sx={{
                    textAlign: 'center',
                    px: 2,
                    py: 3,
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                    Practice your speaking
                  </Typography>
                  <Typography variant="caption">
                    Tap the microphone button below, speak in English, then tap
                    stop. Your speech will be transcribed so you can review what
                    you said.
                  </Typography>
                </Box>
              )}

              {messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}

              <div ref={messagesEndRef} />
            </Box>
          </>
        </CardContent>
      </Card>

      {/* Floating record controls — fixed to bottom on mobile like RecordPlayer */}
      <Box
        sx={{
          borderRadius: { xs: '12px 12px 0 0', sm: 1 },
          boxShadow: { xs: 6, sm: 2 },
          mb: { xs: 0, sm: 2 },
          position: { xs: 'fixed', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          left: { xs: 0, sm: 'auto' },
          right: { xs: 0, sm: 'auto' },
          zIndex: { xs: 1200, sm: 'auto' },
          backgroundColor: 'background.paper',
          px: 2,
          py: 1.5,
        }}
      >
        {/* Full-screen analyzing overlay */}
        {isProcessing && (
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              zIndex: 1300,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 120,
                height: 120,
              }}
            >
              {/* Outer glow ring */}
              <CircularProgress
                size={120}
                thickness={1}
                sx={{ color: 'rgba(0,167,111,0.2)', position: 'absolute' }}
              />
              {/* Main spinner */}
              <CircularProgress
                size={96}
                thickness={2.5}
                sx={{
                  color: '#00a76f',
                  filter:
                    'drop-shadow(0 0 12px rgba(0,167,111,0.9)) drop-shadow(0 0 24px rgba(0,167,111,0.5))',
                }}
              />
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: '#fff',
                fontWeight: 600,
                letterSpacing: 1,
                textShadow: '0 0 12px rgba(0,167,111,0.8)',
              }}
            >
              Recognizing…
            </Typography>
          </Box>
        )}

        {/* Recording indicator bar */}
        {isRecording && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 1, px: 0.5 }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'error.main',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 },
                },
                animation: 'pulse 1s ease-in-out infinite',
              }}
            />
            <Typography variant="caption" color="error" sx={{ minWidth: 80 }}>
              {formatTime(recordingSeconds)} / 0:30
            </Typography>
            <LinearProgress
              sx={{ flex: 1 }}
              color="error"
              variant="determinate"
              value={(recordingSeconds / 30) * 100}
            />
          </Stack>
        )}

        {/* Mic / Stop button */}
        <Stack direction="row" justifyContent="center" alignItems="center">
          {!isRecording ? (
            <Tooltip title={isProcessing ? 'Processing…' : 'Start recording'}>
              <span>
                <IconButton
                  onClick={handleStartRecording}
                  disabled={isProcessing}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: '#fff',
                    '&:hover': { backgroundColor: 'primary.dark' },
                    '&.Mui-disabled': {
                      backgroundColor: 'action.disabledBackground',
                    },
                  }}
                >
                  <Microphone size={24} variant="Bulk" />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Tooltip title="Stop recording">
              <IconButton
                onClick={handleStopRecording}
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'error.main',
                  color: '#fff',
                  '&:hover': { backgroundColor: 'error.dark' },
                }}
              >
                <Stop size={24} variant="Bulk" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
    </Grid>
  );
}
