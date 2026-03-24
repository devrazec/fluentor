'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
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
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import {
  Play,
  Pause,
  VolumeHigh,
  VolumeMute,
  Repeat,
  Stop,
  Record,
  Trash,
  TickCircle,
} from 'iconsax-reactjs';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

//function getPreview(name) {
//  return name.split(' ').slice(0, 5).join(' ') + '…';
//}

// Detect actual speech start/end by scanning amplitude
async function detectSpeechBounds(url, threshold = 0.015) {
  try {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await ctx.decodeAudioData(buf);
    await ctx.close();
    const data = audioBuffer.getChannelData(0);
    const sr = audioBuffer.sampleRate;
    let startSample = 0;
    let endSample = data.length - 1;
    for (let i = 0; i < data.length; i++) {
      if (Math.abs(data[i]) > threshold) {
        startSample = i;
        break;
      }
    }
    for (let i = data.length - 1; i >= 0; i--) {
      if (Math.abs(data[i]) > threshold) {
        endSample = i;
        break;
      }
    }
    return {
      start: Math.max(0, startSample / sr - 0.05),
      end: Math.min(audioBuffer.duration, endSample / sr + 0.05),
    };
  } catch {
    return null;
  }
}

export default function PracticePage() {
  const {
    dbQuestion,
    dbCategory,
    dbTense,
    dbAnswer,
    selectedQuestion,
    setSelectedQuestion,
    currentAnswer,
    setCurrentAnswer,
    selectedAnswer,
    setSelectedAnswer,
    setSelectedCategory,
    setSelectedTense,
    mobileDevice,
    filterQuestion,
    setFilterQuestion,
  } = useContext(GlobalContext);

  // Auto-select first question if none is set
  useEffect(() => {
    if (!selectedQuestion?.id && dbQuestion?.length > 0) {
      const first = [...dbQuestion].sort((a, b) =>
        a.name.localeCompare(b.name)
      )[0];
      setSelectedQuestion(first);
      setSelectedCategory(
        dbCategory.find(c => c.id === first.id_category) ?? {}
      );
      setSelectedTense(dbTense.find(t => t.id === first.id_tense) ?? {});
    }
  }, [dbQuestion]);

  // Sync answers whenever selectedQuestion changes
  useEffect(() => {
    if (selectedQuestion?.id && dbAnswer?.length > 0) {
      const answers = dbAnswer.filter(
        a => a.id_question === selectedQuestion.id
      );
      setCurrentAnswer(answers);
      const alreadyValid = answers.some(a => a.id === selectedAnswer);
      if (!alreadyValid && answers.length > 0) setSelectedAnswer(answers[0].id);
    }
  }, [selectedQuestion, dbAnswer]);

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

  // Speech bounds detected via Web Audio API amplitude scan
  const [answerSpeechBounds, setAnswerSpeechBounds] = useState(null);
  const [qSpeechBounds, setQSpeechBounds] = useState(null);

  // Question volume state
  const [qVolume, setQVolume] = useState(1);
  const [qMuted, setQMuted] = useState(false);

  // Voice gender for question mp3
  const [voiceGender, setVoiceGender] = useState('female');
  const qResumeOnLoadRef = useRef(false);

  // Voice gender for answer mp3
  const [answerGender, setAnswerGender] = useState('female');
  const aResumeOnLoadRef = useRef(false);

  // Recording state
  const mediaRecorderRef = useRef(null);
  const recChunksRef = useRef([]);
  const recAudioRef = useRef(null);
  const recRafRef = useRef(null);
  const recTimerRef = useRef(null);
  const recSecondsRef = useRef(0);
  const playingRecIdRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]); // [{ id, url, duration }]
  const [playingRecId, setPlayingRecId] = useState(null);
  const [recCurrentTime, setRecCurrentTime] = useState(0);
  const [recIsPlaying, setRecIsPlaying] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

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
  useEffect(
    () => () => {
      stopAnswerRaf();
      stopQuestionRaf();
      stopRecRaf();
      clearInterval(recTimerRef.current);
      mediaRecorderRef.current?.stop();
    },
    []
  );

  useEffect(() => {
    if (currentAnswer?.length > 0) {
      const alreadyValid = currentAnswer.some(a => a.id === selectedAnswer);
      if (!alreadyValid) setSelectedAnswer(currentAnswer[0].id);
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
    if (questionAudioRef.current)
      questionAudioRef.current.playbackRate = qPlaybackRate;
  }, [qPlaybackRate]);

  // Detect speech bounds for answer audio
  useEffect(() => {
    setAnswerSpeechBounds(null);
    const mp3 = currentAnswer?.find(a => a.id === selectedAnswer)?.mp3;
    if (!mp3) return;
    detectSpeechBounds(`/mp3/answer/${answerGender}/${mp3}`).then(bounds => {
      if (bounds) setAnswerSpeechBounds(bounds);
    });
  }, [selectedAnswer, currentAnswer, answerGender]);

  // Detect speech bounds for question audio
  useEffect(() => {
    setQSpeechBounds(null);
    if (!selectedQuestion?.mp3) return;
    detectSpeechBounds(
      `/mp3/question/${voiceGender}/${selectedQuestion.mp3}`
    ).then(bounds => {
      if (bounds) setQSpeechBounds(bounds);
    });
  }, [selectedQuestion?.mp3, voiceGender]);

  const handleQPlayPause = useCallback(() => {
    const audio = questionAudioRef.current;
    if (!audio) return;
    if (qIsPlaying) {
      audio.pause();
      stopQuestionRaf();
    } else {
      audio.play().catch(() => {});
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
      audio.play().catch(() => {});
      startAnswerRaf();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, startAnswerRaf, stopAnswerRaf]);

  const handleTimeUpdate = () => {}; // replaced by rAF

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = playbackRate;
      if (aResumeOnLoadRef.current) {
        aResumeOnLoadRef.current = false;
        audioRef.current.play().catch(() => {});
        startAnswerRaf();
        setIsPlaying(true);
      }
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

  // ── Recording helpers ──────────────────────────────────────────────────────
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

  const handleRecordStop = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      clearInterval(recTimerRef.current);
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        recChunksRef.current = [];
        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;
        mr.ondataavailable = e => {
          if (e.data.size > 0) recChunksRef.current.push(e.data);
        };
        mr.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(recChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          const id = Date.now();
          const fallback = recSecondsRef.current;
          // Use a temp Audio element to get the real float duration immediately.
          // A shared `resolved` flag prevents the error event (fired when we
          // clear tmp.src after loadedmetadata) from adding a duplicate row.
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
              setRecordings(prev => [...prev, { id, url, duration: dur }]);
              tmp.src = '';
            },
            { once: true }
          );
          tmp.addEventListener(
            'error',
            () => {
              if (resolved) return;
              resolved = true;
              setRecordings(prev => [...prev, { id, url, duration: fallback }]);
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
  }, [isRecording, stopRecRaf]);

  // Auto-stop recording when it reaches the answer's timed limit
  useEffect(() => {
    const timed = currentAnswer?.find(a => a.id === selectedAnswer)?.timed;
    if (isRecording && timed && recordingSeconds >= timed) {
      handleRecordStop();
    }
  }, [
    recordingSeconds,
    isRecording,
    currentAnswer,
    selectedAnswer,
    handleRecordStop,
  ]);

  const handleRecPlay = useCallback(
    rec => {
      const audio = recAudioRef.current;
      if (!audio) return;
      playingRecIdRef.current = rec.id;
      if (playingRecId === rec.id) {
        // Toggle pause/resume for the same recording
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
        // Switch to a different recording
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
    // TODO: call validation API with rec.url
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

  const answer = currentAnswer?.find(a => a.id === selectedAnswer);

  const answerWords = useMemo(() => answer?.name?.split(' ') ?? [], [answer]);

  // Distribute time proportionally to word character length for better sync
  const answerWordTimings = useMemo(() => {
    if (!answerWords.length || !duration) return [];
    const speechStart = answerSpeechBounds?.start ?? 0;
    const speechEnd = answerSpeechBounds?.end ?? duration;
    const speechDuration = Math.max(speechEnd - speechStart, 0.1);
    const totalChars = answerWords.reduce((sum, w) => sum + w.length, 0) || 1;
    let acc = 0;
    return answerWords.map(w => {
      const start = speechStart + (acc / totalChars) * speechDuration;
      acc += w.length;
      return start;
    });
  }, [answerWords, duration, answerSpeechBounds]);

  const activeWordIndex = useMemo(() => {
    if (currentTime <= 0 || !answerWordTimings.length) return -1;
    let idx = 0;
    for (let i = 0; i < answerWordTimings.length; i++) {
      if (answerWordTimings[i] <= currentTime) idx = i;
      else break;
    }
    return idx;
  }, [currentTime, answerWordTimings]);

  const questionWords = useMemo(
    () => selectedQuestion?.name?.split(' ') ?? [],
    [selectedQuestion]
  );

  const qWordTimings = useMemo(() => {
    if (!questionWords.length || !qDuration) return [];
    const speechStart = qSpeechBounds?.start ?? 0;
    const speechEnd = qSpeechBounds?.end ?? qDuration;
    const speechDuration = Math.max(speechEnd - speechStart, 0.1);
    const totalChars = questionWords.reduce((sum, w) => sum + w.length, 0) || 1;
    let acc = 0;
    return questionWords.map(w => {
      const start = speechStart + (acc / totalChars) * speechDuration;
      acc += w.length;
      return start;
    });
  }, [questionWords, qDuration, qSpeechBounds]);

  const qActiveWordIndex = useMemo(() => {
    if (qCurrentTime <= 0 || !qWordTimings.length) return -1;
    let idx = 0;
    for (let i = 0; i < qWordTimings.length; i++) {
      if (qWordTimings[i] <= qCurrentTime) idx = i;
      else break;
    }
    return idx;
  }, [qCurrentTime, qWordTimings]);

  function getPreviewQuestion(name) {
    if (mobileDevice) {
      return name.length > 25 ? name.slice(0, 25) + '…' : name;
    }
    return name;
  }

  function getPreview(name) {
    return name.length > 15 ? name.slice(0, 15) + '…' : name;
  }

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
            height={mobileDevice ? '160' : '200'}
            image={
              selectedQuestion?.category_image
                ? `/img/category/${selectedQuestion.category_image}`
                : `/img/category/${selectedQuestion?.id_category}.jpg`
            }
            alt={selectedQuestion?.category_name}
            sx={{ objectFit: 'cover', objectPosition: 'top' }}
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
            <Divider sx={{ my: 1.5 }} />

            <Box
              sx={{
                lineHeight: 1.9,
                fontSize: '1.25rem',
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              <FormControl size="small" sx={{ width: { xs: '100%' } }}>
                <InputLabel>Question</InputLabel>
                <Select
                  value={selectedQuestion?.id ?? ''}
                  onChange={e => {
                    const question = dbQuestion.find(
                      q => q.id === e.target.value
                    );
                    if (question) {
                      setFilterQuestion(question.id);
                      setSelectedQuestion(question);
                      setSelectedCategory(
                        dbCategory.find(c => c.id === question.id_category) ??
                          {}
                      );
                      setSelectedTense(
                        dbTense.find(t => t.id === question.id_tense) ?? {}
                      );
                    }
                  }}
                  renderValue={selected => {
                    const q = dbQuestion.find(item => item.id === selected);
                    return q ? getPreviewQuestion(q.name) : '';
                  }}
                  input={<OutlinedInput label="Question" />}
                  MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                  displayEmpty
                >
                  {[...dbQuestion]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(q => (
                      <MenuItem key={q.id} value={q.id}>
                        {q.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              {/* {questionWords.map((word, i) => (
                <span
                  key={i}
                  style={{
                    transition: 'background 0.15s, color 0.15s',
                    backgroundColor:
                      qActiveWordIndex >= 0 && i <= qActiveWordIndex
                        ? i === qActiveWordIndex
                          ? '#00a76f'
                          : 'rgba(0,167,111,0.2)'
                        : 'transparent',
                    color:
                      qActiveWordIndex >= 0 && i === qActiveWordIndex
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
              ))} */}
            </Box>

            {/* Question audio player */}
            {selectedQuestion?.mp3 && (
              <>
                <audio
                  key={selectedQuestion.mp3 + voiceGender}
                  ref={questionAudioRef}
                  src={`/mp3/question/${voiceGender}/${selectedQuestion.mp3}`}
                  onTimeUpdate={() => {}}
                  onLoadedMetadata={() => {
                    if (questionAudioRef.current) {
                      setQDuration(questionAudioRef.current.duration);
                      questionAudioRef.current.playbackRate = qPlaybackRate;
                      questionAudioRef.current.volume = qVolume;
                      questionAudioRef.current.muted = qMuted;
                      if (qResumeOnLoadRef.current) {
                        qResumeOnLoadRef.current = false;
                        questionAudioRef.current.play().catch(() => {});
                        startQuestionRaf();
                        setQIsPlaying(true);
                      }
                    }
                  }}
                  onEnded={() => {
                    stopQuestionRaf();
                    if (!qLoop) {
                      setQIsPlaying(false);
                      setQCurrentTime(0);
                    }
                  }}
                  loop={qLoop}
                />
                <Divider sx={{ my: 1.5 }} />

                {/* Slider row with inline timestamps */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 0.5 }}
                >
                  {/* Play/Pause */}
                  <IconButton
                    onClick={handleQPlayPause}
                    sx={{
                      bgcolor: '#00a76f',
                      color: '#fff',
                      '&:hover': { bgcolor: '#007a52' },
                    }}
                  >
                    {qIsPlaying ? (
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
                    {formatTime(qCurrentTime)}
                  </Typography>
                  <Slider
                    size="small"
                    min={0}
                    max={qDuration || 1}
                    value={qCurrentTime}
                    onChange={handleQSeek}
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
                    {formatTime(qDuration)}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                {/* Controls row */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.75}
                  sx={{ mb: 0.5 }}
                >
                  {/* Loop */}
                  <IconButton
                    size="small"
                    onClick={() => setQLoop(v => !v)}
                    sx={{
                      border: '1px solid',
                      borderColor: qLoop ? '#00a76f' : 'divider',
                      color: qLoop ? '#00a76f' : 'text.secondary',
                      bgcolor: qLoop ? 'rgba(0,167,111,0.08)' : 'transparent',
                      width: 34,
                      height: 34,
                      '&:hover': {
                        bgcolor: qLoop
                          ? 'rgba(0,167,111,0.18)'
                          : 'action.hover',
                      },
                    }}
                  >
                    <Repeat size={18} variant={qLoop ? 'Bulk' : 'Linear'} />
                  </IconButton>

                  {/* Male voice */}
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (voiceGender === 'male') return;
                      qResumeOnLoadRef.current = qIsPlaying;
                      stopQuestionRaf();
                      setQIsPlaying(false);
                      setQCurrentTime(0);
                      setVoiceGender('male');
                    }}
                    sx={{
                      border: '1px solid',
                      borderColor:
                        voiceGender === 'male' ? '#00a76f' : 'divider',
                      color:
                        voiceGender === 'male' ? '#00a76f' : 'text.secondary',
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
                      qResumeOnLoadRef.current = qIsPlaying;
                      stopQuestionRaf();
                      setQIsPlaying(false);
                      setQCurrentTime(0);
                      setVoiceGender('female');
                    }}
                    sx={{
                      border: '1px solid',
                      borderColor:
                        voiceGender === 'female' ? '#00a76f' : 'divider',
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

                  {/* Volume mute — hidden on mobile */}
                  {/* <IconButton
                    size="small"
                    onClick={() => {
                      const next = !qMuted;
                      setQMuted(next);
                      if (questionAudioRef.current) questionAudioRef.current.muted = next;
                    }}
                    sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'inline-flex' } }}
                  >
                    {qMuted ? <VolumeMute size={20} /> : <VolumeHigh size={20} />}
                  </IconButton> */}

                  {/* Volume slider — hidden on mobile */}
                  {/* <Slider
                    size="small"
                    min={0}
                    max={1}
                    step={0.05}
                    value={qMuted ? 0 : qVolume}
                    onChange={(_, val) => {
                      setQVolume(val);
                      setQMuted(val === 0);
                      if (questionAudioRef.current) {
                        questionAudioRef.current.volume = val;
                        questionAudioRef.current.muted = val === 0;
                      }
                    }}
                    sx={{
                      width: 80,
                      color: '#00a76f',
                      '& .MuiSlider-thumb': { width: 12, height: 12 },
                      display: { xs: 'none', sm: 'block' },
                    }}
                  /> */}

                  <Box sx={{ flex: 1 }} />

                  {/* Speed buttons */}
                  {[0.75, 1, 1.2].map(r => (
                    <IconButton
                      key={r}
                      size="small"
                      onClick={() => setQPlaybackRate(r)}
                      sx={{
                        border: '1px solid',
                        borderColor:
                          qPlaybackRate === r ? '#00a76f' : 'divider',
                        bgcolor:
                          qPlaybackRate === r ? '#00a76f' : 'transparent',
                        color: qPlaybackRate === r ? '#fff' : 'text.secondary',
                        borderRadius: '50%',
                        width: 34,
                        height: 34,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        '&:hover': {
                          bgcolor:
                            qPlaybackRate === r ? '#007a52' : 'action.hover',
                        },
                      }}
                    >
                      {r}x
                    </IconButton>
                  ))}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        {/* Answer Player Card */}
        {answer && (
          <Card sx={{ borderRadius: 1, boxShadow: 2, mb: 3 }}>
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
                sx={{
                  display: 'flex',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
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
                {currentAnswer?.map((a, index) => (
                  <ToggleButton
                    key={a.id}
                    value={a.id}
                    sx={{
                      flex: { xs: '1 1 calc(50% - 4px)', sm: 1 },
                      minWidth: 0,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      px: 1.5,
                      py: 1,
                      textAlign: 'left',
                      textTransform: 'none',
                      position: 'relative',
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: '#00a76f1f' },
                      backgroundColor:
                        selectedAnswer === a.id
                          ? '#00a76f1f !important'
                          : undefined,
                      borderColor:
                        selectedAnswer === a.id
                          ? '#00a76f1f !important'
                          : undefined,
                    }}
                  >
                    {selectedAnswer === a.id && (
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
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{ mb: 0.5 }}
                    >
                      Answer {index + 1}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ width: '100%', display: 'block' }}
                    >
                      {getPreview(a.name)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      <Chip
                        label={`${a.timed}sec`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ pointerEvents: 'none' }}
                      />
                      {/* <Chip
                        label={`${a.word}words`}
                        size="small"
                        variant="outlined"
                        sx={{ pointerEvents: 'none' }}
                      /> */}
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {/* Hidden audio element */}
              {answer.mp3 && (
                <audio
                  key={answer.mp3 + answerGender}
                  ref={audioRef}
                  src={`/mp3/answer/${answerGender}/${answer.mp3}`}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleEnded}
                  loop={loop}
                />
              )}

              {/* Answer text with word highlighting */}
              <Box
                sx={{
                  mb: 2,
                  lineHeight: 1.9,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                }}
              >
                {answerWords.map((word, i) => (
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

              {/* Slider row with inline timestamps */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 0.5 }}
              >
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
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{ mb: 0.5 }}
              >
                {/* Loop toggle */}
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
                  <Repeat size={20} variant={loop ? 'Bulk' : 'Linear'} />
                </IconButton>

                {/* Male voice */}
                <IconButton
                  size="small"
                  onClick={() => {
                    if (answerGender === 'male') return;
                    aResumeOnLoadRef.current = isPlaying;
                    stopAnswerRaf();
                    setIsPlaying(false);
                    setCurrentTime(0);
                    setAnswerGender('male');
                  }}
                  sx={{
                    border: '1px solid',
                    borderColor:
                      answerGender === 'male' ? '#00a76f' : 'divider',
                    color:
                      answerGender === 'male' ? '#00a76f' : 'text.secondary',
                    bgcolor:
                      answerGender === 'male'
                        ? 'rgba(0,167,111,0.08)'
                        : 'transparent',
                    width: 34,
                    height: 34,
                    '&:hover': {
                      bgcolor:
                        answerGender === 'male'
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
                    if (answerGender === 'female') return;
                    aResumeOnLoadRef.current = isPlaying;
                    stopAnswerRaf();
                    setIsPlaying(false);
                    setCurrentTime(0);
                    setAnswerGender('female');
                  }}
                  sx={{
                    border: '1px solid',
                    borderColor:
                      answerGender === 'female' ? '#00a76f' : 'divider',
                    color:
                      answerGender === 'female' ? '#00a76f' : 'text.secondary',
                    bgcolor:
                      answerGender === 'female'
                        ? 'rgba(0,167,111,0.08)'
                        : 'transparent',
                    width: 34,
                    height: 34,
                    '&:hover': {
                      bgcolor:
                        answerGender === 'female'
                          ? 'rgba(0,167,111,0.18)'
                          : 'action.hover',
                    },
                  }}
                >
                  <WomanIcon sx={{ fontSize: 18 }} />
                </IconButton>

                {/* Volume mute toggle — hidden on mobile */}
                {/* <IconButton
                  size="small"
                  onClick={handleMuteToggle}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'text.secondary' }}
                >
                  {muted || volume === 0 ? (
                    <VolumeMute size={20} />
                  ) : (
                    <VolumeHigh size={20} />
                  )}
                </IconButton> */}

                {/* Volume slider — hidden on mobile */}
                {/* <Slider
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
                /> */}

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
                        bgcolor:
                          playbackRate === r ? '#007a52' : 'action.hover',
                      },
                    }}
                  >
                    {r}x
                  </IconButton>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </DashboardLayout>
  );
}
