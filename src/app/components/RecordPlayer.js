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
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Play,
  Pause,
  Record,
  Trash,
  TickCircle,
  ArrowDown2,
  ArrowUp2,
} from 'iconsax-reactjs';

function encodeWav(audioBuffer) {
  const numChannels = 1;
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
  view.setUint16(22, numChannels, true);
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

export default function RecordPlayer() {
  const {
    currentAnswer,
    selectedAnswer,
    testResult,
    setTestResult,
    scriptedWord,
    setScriptedWord,
  } = useContext(GlobalContext);

  const timed =
    selectedAnswer === 'free'
      ? 60
      : (currentAnswer?.find(a => a.id === selectedAnswer)?.timed ?? null);

  // Refs
  const mediaRecorderRef = useRef(null);
  const recChunksRef = useRef([]);
  const recAudioRef = useRef(null);
  const recRafRef = useRef(null);
  const recTimerRef = useRef(null);
  const recSecondsRef = useRef(0);
  const playingRecIdRef = useRef(null);

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordings, setRecordings] = useState([]); // { id, url, duration, validated }
  const [playingRecId, setPlayingRecId] = useState(null);
  const [recCurrentTime, setRecCurrentTime] = useState(0);
  const [recIsPlaying, setRecIsPlaying] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // rAF helpers
  const startRecRaf = useCallback(() => {
    if (recRafRef.current) cancelAnimationFrame(recRafRef.current);
    const tick = () => {
      if (recAudioRef.current) {
        flushSync(() => setRecCurrentTime(recAudioRef.current.currentTime));
      }
      recRafRef.current = requestAnimationFrame(tick);
    };
    recRafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRecRaf = useCallback(() => {
    if (recRafRef.current) {
      cancelAnimationFrame(recRafRef.current);
      recRafRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(
    () => () => {
      stopRecRaf();
      clearInterval(recTimerRef.current);
      mediaRecorderRef.current?.stop();
    },
    [stopRecRaf]
  );

  // Auto-stop when timed limit is reached
  useEffect(() => {
    if (isRecording && timed && recordingSeconds >= timed) {
      handleRecordStop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordingSeconds, isRecording, timed]);

  const handleRecordStop = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      clearInterval(recTimerRef.current);
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        recChunksRef.current = [];
        setRecordings([]);
        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;

        mr.ondataavailable = e => {
          if (e.data.size > 0) recChunksRef.current.push(e.data);
        };

        mr.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(recChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          const id = Date.now();
          const fallback = recSecondsRef.current;

          const tmp = new Audio();
          tmp.preload = 'metadata';
          let resolved = false;
          tmp.addEventListener(
            'loadedmetadata',
            () => {
              if (resolved) return;
              resolved = true;
              const dur =
                isFinite(tmp.duration) && tmp.duration > 0
                  ? tmp.duration
                  : fallback;
              setRecordings([{ id, url, duration: dur }]);
              tmp.src = '';
            },
            { once: true }
          );
          tmp.addEventListener(
            'error',
            () => {
              if (resolved) return;
              resolved = true;
              setRecordings([{ id, url, duration: fallback }]);
            },
            { once: true }
          );
          tmp.src = url;

          stopRecRaf();
          setPlayingRecId(null);
          setRecCurrentTime(0);
          setRecIsPlaying(false);
          setRecordingSeconds(0);
          recSecondsRef.current = 0;

          // Call pronunciation assessment API
          const referenceText =
            currentAnswer?.find(a => a.id === selectedAnswer)?.name ?? '';
          const wavBlob = await convertBlobToWav(blob);
          const formData = new FormData();
          formData.append('audio', wavBlob, 'recording.wav');
          formData.append('referenceText', referenceText);
          formData.append('scripted', scriptedWord);

          setIsAnalyzing(true);
          try {
            const res = await fetch('/api/result', {
              method: 'POST',
              body: formData,
            });
            if (res.ok) {
              const data = await res.json();
              setTestResult([
                {
                  reference_text: data.reference_text ?? '',
                  recognized_text: data.recognized_text ?? '',
                  pronunciation: data.pronunciation ?? 0,
                  accuracy: data.accuracy ?? 0,
                  fluency: data.fluency ?? 0,
                  completeness: data.completeness ?? 0,
                  prosody: data.prosody ?? 0,
                  mispronunciation: data.mispronunciation ?? 0,
                  omission: data.omission ?? 0,
                  insertion: data.insertion ?? 0,
                  unexpected_break: data.unexpected_break ?? 0,
                  missing_break: data.missing_break ?? 0,
                  monotone: data.monotone ?? 0,
                  words: data.words ?? [],
                },
              ]);
            } else {
              console.error('Assessment API error:', res.status);
            }
          } catch (err) {
            console.error('Assessment fetch error:', err);
          } finally {
            setIsAnalyzing(false);
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
            return next;
          });
        }, 1000);
      } catch {
        alert('Microphone access denied.');
      }
    }
  }, [isRecording, stopRecRaf, currentAnswer, selectedAnswer]);

  const handleRecPlay = useCallback(
    rec => {
      const audio = recAudioRef.current;
      if (!audio) return;
      playingRecIdRef.current = rec.id;
      if (playingRecId === rec.id) {
        if (recIsPlaying) {
          audio.pause();
          stopRecRaf();
          setRecIsPlaying(false);
        } else {
          audio.play().catch(() => {});
          startRecRaf();
          setRecIsPlaying(true);
        }
      } else {
        stopRecRaf();
        setRecIsPlaying(false);
        setRecCurrentTime(0);
        setPlayingRecId(rec.id);
        audio.src = rec.url;
        audio.load();
        audio.addEventListener(
          'canplay',
          () => {
            audio.play().catch(() => {});
            startRecRaf();
            setRecIsPlaying(true);
          },
          { once: true }
        );
      }
    },
    [playingRecId, recIsPlaying, startRecRaf, stopRecRaf]
  );

  const handleRecValidate = useCallback(rec => {
    setRecordings(prev =>
      prev.map(r => (r.id === rec.id ? { ...r, validated: !r.validated } : r))
    );
  }, []);

  const handleRecDelete = useCallback(
    rec => {
      if (playingRecId === rec.id) {
        recAudioRef.current?.pause();
        stopRecRaf();
        setPlayingRecId(null);
        setRecIsPlaying(false);
        setRecCurrentTime(0);
      }
      URL.revokeObjectURL(rec.url);
      setRecordings(prev => prev.filter(r => r.id !== rec.id));
    },
    [playingRecId, stopRecRaf]
  );

  const playingRec = recordings.find(r => r.id === playingRecId);
  const progress = timed && isRecording ? (recordingSeconds / timed) * 100 : 0;

  return (
    <Card
      sx={{
        borderRadius: { xs: '12px 12px 0 0', sm: 1 },
        boxShadow: { xs: 6, sm: 2 },
        mb: { xs: 0, sm: 3 },
        position: { xs: 'fixed', sm: 'relative' },
        bottom: { xs: 0, sm: 'auto' },
        left: { xs: 0, sm: 'auto' },
        right: { xs: 0, sm: 'auto' },
        zIndex: { xs: 1200, sm: 'auto' },
      }}
    >
      <CardContent>
        {/* Header row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: minimized ? 0 : 2 }}
        >
          <Typography variant="h6" fontWeight={600}>
            Your Recording
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            {timed && (
              <Chip
                label={`${timed}s limit`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            <IconButton
              size="small"
              onClick={() => setMinimized(v => !v)}
              sx={{ color: 'text.secondary' }}
            >
              {minimized ? <ArrowUp2 size={18} /> : <ArrowDown2 size={18} />}
            </IconButton>
          </Stack>
        </Stack>

        {/* Record button + timer */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mb: isRecording ? 1.5 : 2, position: 'relative' }}
        >
          {isAnalyzing && (
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
                  sx={{
                    color: 'rgba(0,167,111,0.2)',
                    position: 'absolute',
                  }}
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
                Analyzing…
              </Typography>
            </Box>
          )}
          <IconButton
            onClick={handleRecordStop}
            disabled={isAnalyzing}
            sx={{
              bgcolor: isRecording ? '#f44336' : '#00a76f',
              color: '#fff',
              width: 48,
              height: 48,
              '&:hover': { bgcolor: isRecording ? '#c62828' : '#007a52' },
              boxShadow: isRecording
                ? '0 0 0 4px rgba(244,67,54,0.25)'
                : 'none',
              transition: 'box-shadow 0.3s',
            }}
          >
            <Record variant="Bulk" size={22} />
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              color={isRecording ? 'error.main' : 'text.primary'}
            >
              {isAnalyzing
                ? 'Analyzing…'
                : isRecording
                  ? `Recording… ${formatTime(recordingSeconds)}${timed ? ` / ${formatTime(timed)}` : ''}`
                  : 'Tap to record'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isRecording
                ? 'Tap again to stop'
                : `${recordings.length} recording${recordings.length !== 1 ? 's' : ''}`}
            </Typography>
          </Box>
        </Stack>

        {/* Progress bar while recording */}
        {isRecording && timed && (
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              mb: 2,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(244,67,54,0.15)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#f44336',
                borderRadius: 2,
              },
            }}
          />
        )}

        {/* Hidden playback audio element */}
        <audio
          ref={recAudioRef}
          onEnded={() => {
            stopRecRaf();
            setRecIsPlaying(false);
            setRecCurrentTime(0);
          }}
        />

        {/* Recordings list */}
        {!minimized && recordings.length > 0 && (
          <>
            <Divider sx={{ mb: 1.5 }} />

            {/* Playback slider for the active recording */}
            {playingRec && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1.5 }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: 32, textAlign: 'right' }}
                >
                  {formatTime(recCurrentTime)}
                </Typography>
                <Slider
                  size="small"
                  min={0}
                  max={playingRec.duration || 1}
                  value={recCurrentTime}
                  onChange={(_, val) => {
                    if (recAudioRef.current) {
                      recAudioRef.current.currentTime = val;
                      setRecCurrentTime(val);
                    }
                  }}
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
                  {formatTime(playingRec.duration)}
                </Typography>
              </Stack>
            )}

            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell
                    sx={{ color: 'primary.contrastText', fontWeight: 700 }}
                  >
                    #
                  </TableCell>
                  <TableCell
                    sx={{ color: 'primary.contrastText', fontWeight: 700 }}
                  >
                    Duration
                  </TableCell>
                  <TableCell
                    sx={{ color: 'primary.contrastText', fontWeight: 700 }}
                    align="center"
                  >
                    Play
                  </TableCell>
                  <TableCell
                    sx={{ color: 'primary.contrastText', fontWeight: 700 }}
                    align="center"
                  >
                    Delete
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recordings.map((rec, index) => (
                  <TableRow
                    key={rec.id}
                    sx={{
                      ...(rec.validated && {
                        backgroundColor: 'rgba(0,167,111,0.08)',
                        '& td': { fontWeight: 700 },
                      }),
                    }}
                  >
                    <TableCell>
                      <Typography variant="caption" fontWeight={600}>
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatTime(rec.duration)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleRecPlay(rec)}
                        sx={{
                          bgcolor:
                            playingRecId === rec.id ? '#00a76f' : 'transparent',
                          color:
                            playingRecId === rec.id ? '#fff' : 'text.secondary',
                          border: '1px solid',
                          borderColor:
                            playingRecId === rec.id ? '#00a76f' : 'divider',
                          width: 30,
                          height: 30,
                          '&:hover': {
                            bgcolor:
                              playingRecId === rec.id
                                ? '#007a52'
                                : 'action.hover',
                          },
                        }}
                      >
                        {playingRecId === rec.id && recIsPlaying ? (
                          <Pause variant="Bulk" size={15} />
                        ) : (
                          <Play variant="Bulk" size={15} />
                        )}
                      </IconButton>
                    </TableCell>
                    {/* <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleRecValidate(rec)}
                        sx={{
                          color: rec.validated ? '#00a76f' : 'text.secondary',
                          width: 30,
                          height: 30,
                        }}
                      >
                        <TickCircle variant={rec.validated ? 'Bulk' : 'Linear'} size={18} />
                      </IconButton>
                    </TableCell> */}
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleRecDelete(rec)}
                        sx={{ color: 'error.main', width: 30, height: 30 }}
                      >
                        <Trash variant="Linear" size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {testResult?.[0]?.recognized_text && (
              <Box sx={{ mt: 1.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Recognized text:
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {testResult[0].recognized_text}
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
