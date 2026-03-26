'use client';

import React, { useState, useRef, useContext, useMemo, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { Play, Pause, ArrowDown2, ArrowUp2 } from 'iconsax-reactjs';
import WomanIcon from '@mui/icons-material/Woman';
import ManIcon from '@mui/icons-material/Man';

export default function VocabularyTable() {
  const [minimizedVocabulary, setMinimizedVocabulary] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('pt');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeVoice, setActiveVoice] = useState('female');

  const SPEEDS = [1, 1.5, 2];
  const VOICES = [
    {
      code: 'female',
      label: <WomanIcon sx={{ fontSize: 14 }} />,
      title: 'Female voice',
    },
    {
      code: 'male',
      label: <ManIcon sx={{ fontSize: 14 }} />,
      title: 'Male voice',
    },
  ];

  const LANGUAGES = [
    { code: 'pt', label: 'PT', title: 'Portuguese' },
    { code: 'es', label: 'ES', title: 'Spanish' },
    { code: 'fr', label: 'FR', title: 'French' },
    { code: 'de', label: 'DE', title: 'German' },
    { code: 'ru', label: 'RU', title: 'Russian' },
    { code: 'ar', label: 'AR', title: 'Arabic' },
  ];

  const { mobileDevice, dbVocabulary, dbCatVocab, dbSubCatVocab } =
    useContext(GlobalContext);

  const audioRef = useRef(null);
  const tableContainerRef = useRef(null);
  const playAllCancelRef = useRef(false);
  const activeVoiceRef = useRef(activeVoice);
  const playbackRateRef = useRef(playbackRate);

  useEffect(() => {
    activeVoiceRef.current = activeVoice;
  }, [activeVoice]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  // Stop audio when navigating away
  useEffect(() => {
    return () => {
      playAllCancelRef.current = true;
      clearTimeout(playNextTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (playingId == null || !tableContainerRef.current) return;
    const row = tableContainerRef.current.querySelector(
      `[data-row-id="${playingId}"]`
    );
    if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [playingId]);

  const [filterCatVocab, setFilterCatVocab] = useState([]);
  const [filterSubCatVocab, setFilterSubCatVocab] = useState([]);

  // When category filter changes, reset subcategory filter
  const handleCatVocabChange = value => {
    setFilterCatVocab(value);
    setFilterSubCatVocab([]);
  };

  // Only show subcategories belonging to selected categories (or all if none selected)
  const visibleSubCats = useMemo(() => {
    if (filterCatVocab.length === 0) return dbSubCatVocab ?? [];
    return (dbSubCatVocab ?? []).filter(sc =>
      filterCatVocab.includes(sc.id_catvocab)
    );
  }, [dbSubCatVocab, filterCatVocab]);

  const words = useMemo(() => {
    return (dbVocabulary ?? []).filter(row => {
      const subCat = (dbSubCatVocab ?? []).find(
        sc => sc.id === row.id_subcatvocab
      );
      const catVocabId = subCat?.id_catvocab;
      const matchCat =
        filterCatVocab.length === 0 || filterCatVocab.includes(catVocabId);
      const matchSubCat =
        filterSubCatVocab.length === 0 ||
        filterSubCatVocab.includes(row.id_subcatvocab);
      return matchCat && matchSubCat;
    });
  }, [dbVocabulary, dbSubCatVocab, filterCatVocab, filterSubCatVocab]);

  // Group filtered words by subcategory
  const grouped = useMemo(() => {
    const map = new Map();
    for (const row of words) {
      const key = row.id_subcatvocab;
      if (!map.has(key))
        map.set(key, { label: row.subcategory_en ?? '—', rows: [] });
      map.get(key).rows.push(row);
    }
    return Array.from(map.values());
  }, [words]);

  const playQueueRef = useRef([]);
  const playNextTimerRef = useRef(null);

  const handlePlay = row => {
    if (!row.mp3) return;

    if (playingId === row.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      playAllCancelRef.current = true;
      setIsPlayingAll(false);
      return;
    }

    // Cancel any running queue
    playAllCancelRef.current = true;
    clearTimeout(playNextTimerRef.current);
    setIsPlayingAll(false);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(`/mp3/vocabulary/${activeVoice}/${row.mp3}`);
    audio.playbackRate = playbackRate;
    audioRef.current = audio;
    audio.play();
    setPlayingId(row.id);
    audio.onended = () => setPlayingId(null);
  };

  const handlePlayAll = () => {
    if (isPlayingAll) {
      playAllCancelRef.current = true;
      clearTimeout(playNextTimerRef.current);
      audioRef.current?.pause();
      audioRef.current = null;
      playQueueRef.current = [];
      setPlayingId(null);
      setIsPlayingAll(false);
      return;
    }

    const queue = words.filter(r => r.mp3).map(r => r);
    if (queue.length === 0) return;

    // Cancel any previous queue
    playAllCancelRef.current = true;
    audioRef.current?.pause();
    audioRef.current = null;

    playQueueRef.current = queue;
    playAllCancelRef.current = false;
    setIsPlayingAll(true);

    const playNext = index => {
      if (playAllCancelRef.current) return;
      if (index >= playQueueRef.current.length) {
        setPlayingId(null);
        setIsPlayingAll(false);
        return;
      }
      const row = playQueueRef.current[index];
      const audio = new Audio(
        `/mp3/vocabulary/${activeVoiceRef.current}/${row.mp3}`
      );
      audio.playbackRate = playbackRateRef.current;
      audioRef.current = audio;
      setPlayingId(row.id);
      audio.play();
      audio.onended = () => {
        const delay = Math.round(300 / playbackRateRef.current);
        playNextTimerRef.current = setTimeout(() => playNext(index + 1), delay);
      };
    };

    playNext(0);
  };

  return (
    <Grid
      size={{ xs: 12, md: 6 }}
      sx={{ mb: mobileDevice ? 12 : 12, height: '100vh', minHeight: 400 }}
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
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: minimizedVocabulary ? 0 : 1 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Vocabulary
            </Typography>
            <IconButton
              size="small"
              onClick={() => setMinimizedVocabulary(v => !v)}
              sx={{ color: 'text.secondary' }}
            >
              {minimizedVocabulary ? (
                <ArrowUp2 size={18} />
              ) : (
                <ArrowDown2 size={18} />
              )}
            </IconButton>
          </Stack>
          {!minimizedVocabulary && (
            <>
              <Divider sx={{ mb: 1.5 }} />

              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 160, flex: 1 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    multiple
                    value={filterCatVocab}
                    onChange={e => handleCatVocabChange(e.target.value)}
                    input={<OutlinedInput label="Category" />}
                    renderValue={selected =>
                      selected.length === 0 ? '' : `${selected.length} selected`
                    }
                    MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                  >
                    <MenuItem
                      dense
                      disabled={filterCatVocab.length === 0}
                      onMouseDown={e => {
                        e.preventDefault();
                        handleCatVocabChange([]);
                      }}
                      sx={{
                        justifyContent: 'center',
                        color: 'error.main',
                        fontWeight: 600,
                      }}
                    >
                      Clear selection
                    </MenuItem>
                    <Divider />
                    {[...(dbCatVocab ?? [])]
                      .sort((a, b) => a.en.localeCompare(b.en))
                      .map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>
                          <Checkbox checked={filterCatVocab.includes(cat.id)} />
                          <ListItemText primary={cat.en} />
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 160, flex: 1 }}>
                  <InputLabel>Subcategory</InputLabel>
                  <Select
                    multiple
                    value={filterSubCatVocab}
                    onChange={e => setFilterSubCatVocab(e.target.value)}
                    input={<OutlinedInput label="Subcategory" />}
                    renderValue={selected =>
                      selected.length === 0 ? '' : `${selected.length} selected`
                    }
                    MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                  >
                    <MenuItem
                      dense
                      disabled={filterSubCatVocab.length === 0}
                      onMouseDown={e => {
                        e.preventDefault();
                        setFilterSubCatVocab([]);
                      }}
                      sx={{
                        justifyContent: 'center',
                        color: 'error.main',
                        fontWeight: 600,
                      }}
                    >
                      Clear selection
                    </MenuItem>
                    <Divider />
                    {[...visibleSubCats]
                      .sort((a, b) => a.en.localeCompare(b.en))
                      .map(sc => (
                        <MenuItem key={sc.id} value={sc.id}>
                          <Checkbox
                            checked={filterSubCatVocab.includes(sc.id)}
                          />
                          <ListItemText primary={sc.en} />
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>

              <TableContainer
                ref={tableContainerRef}
                sx={{ flex: 1, minHeight: 0, width: '100%', overflowY: 'auto' }}
              >
                <Table
                  stickyHeader
                  size="small"
                  aria-label="vocabulary"
                  sx={{ width: '100%', tableLayout: 'fixed' }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: 'primary.contrastText',
                          width: '40%',
                          backgroundColor: 'primary.main',
                        }}
                      >
                        English
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: 'primary.contrastText',
                          width: '30%',
                          backgroundColor: 'primary.main',
                        }}
                      >
                        <Box
                          sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}
                        >
                          {LANGUAGES.map(lang => (
                            <Tooltip key={lang.code} title={lang.title}>
                              <Box
                                component="button"
                                onClick={() =>
                                  setActiveLanguage(a =>
                                    a === lang.code ? null : lang.code
                                  )
                                }
                                sx={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  border: '2px solid',
                                  borderColor:
                                    activeLanguage === lang.code
                                      ? 'primary.contrastText'
                                      : 'rgba(255,255,255,0.35)',
                                  backgroundColor:
                                    activeLanguage === lang.code
                                      ? 'primary.contrastText'
                                      : 'transparent',
                                  color:
                                    activeLanguage === lang.code
                                      ? 'primary.main'
                                      : 'primary.contrastText',
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  p: 0,
                                  lineHeight: 1,
                                  transition: 'all 0.15s',
                                  '&:hover': {
                                    borderColor: 'primary.contrastText',
                                  },
                                }}
                              >
                                {lang.label}
                              </Box>
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: 'primary.contrastText',
                          width: '30%',
                          backgroundColor: 'primary.main',
                          py: 0.5,
                        }}
                        align="center"
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 0.5,
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                          }}
                        >
                          {/* Play all */}
                          <Tooltip title={isPlayingAll ? 'Stop' : 'Play all'}>
                            <Box
                              component="button"
                              onClick={handlePlayAll}
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                border: '2px solid',
                                borderColor: isPlayingAll
                                  ? 'primary.contrastText'
                                  : 'rgba(255,255,255,0.35)',
                                backgroundColor: isPlayingAll
                                  ? 'primary.contrastText'
                                  : 'transparent',
                                color: isPlayingAll
                                  ? 'primary.main'
                                  : 'primary.contrastText',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 0,
                                transition: 'all 0.15s',
                                '&:hover': {
                                  borderColor: 'primary.contrastText',
                                },
                              }}
                            >
                              {isPlayingAll ? (
                                <Pause variant="Bulk" size={14} />
                              ) : (
                                <Play variant="Bulk" size={14} />
                              )}
                            </Box>
                          </Tooltip>
                          {/* Voice */}
                          {VOICES.map(v => (
                            <Tooltip key={v.code} title={v.title}>
                              <Box
                                component="button"
                                onClick={() => setActiveVoice(v.code)}
                                sx={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  border: '2px solid',
                                  borderColor:
                                    activeVoice === v.code
                                      ? 'primary.contrastText'
                                      : 'rgba(255,255,255,0.35)',
                                  backgroundColor:
                                    activeVoice === v.code
                                      ? 'primary.contrastText'
                                      : 'transparent',
                                  color:
                                    activeVoice === v.code
                                      ? 'primary.main'
                                      : 'primary.contrastText',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  p: 0,
                                  lineHeight: 1,
                                  transition: 'all 0.15s',
                                  '&:hover': {
                                    borderColor: 'primary.contrastText',
                                  },
                                }}
                              >
                                {v.label}
                              </Box>
                            </Tooltip>
                          ))}
                          {/* Speed */}
                          {SPEEDS.map(speed => (
                            <Tooltip key={speed} title={`${speed}x speed`}>
                              <Box
                                component="button"
                                onClick={() => setPlaybackRate(speed)}
                                sx={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: '50%',
                                  border: '2px solid',
                                  borderColor:
                                    playbackRate === speed
                                      ? 'primary.contrastText'
                                      : 'rgba(255,255,255,0.35)',
                                  backgroundColor:
                                    playbackRate === speed
                                      ? 'primary.contrastText'
                                      : 'transparent',
                                  color:
                                    playbackRate === speed
                                      ? 'primary.main'
                                      : 'primary.contrastText',
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  p: 0,
                                  lineHeight: 1,
                                  transition: 'all 0.15s',
                                  '&:hover': {
                                    borderColor: 'primary.contrastText',
                                  },
                                }}
                              >
                                {speed}x
                              </Box>
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grouped.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          align="center"
                          sx={{ color: 'text.secondary', py: 3 }}
                        >
                          No vocabulary available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      grouped.map(group => (
                        <React.Fragment key={group.label}>
                          {/* Subcategory group header */}
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              sx={{
                                //backgroundColor: 'action.hover',
                                bgcolor: 'rgba(0,167,111,0.2)',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                color: 'text.secondary',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                py: 0.5,
                                pl: 1.5,
                              }}
                            >
                              {group.label}
                            </TableCell>
                          </TableRow>
                          {group.rows.map((row, idx) => (
                            <TableRow
                              key={row.id}
                              data-row-id={row.id}
                              hover
                              sx={{
                                cursor: 'default',
                                backgroundColor:
                                  playingId === row.id
                                    ? 'rgba(0,167,111,0.18)'
                                    : idx % 2 === 0
                                      ? 'transparent'
                                      : 'action.hover',
                                transition: 'background-color 0.2s',
                              }}
                            >
                              <TableCell sx={{ width: '40%' }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {row.en}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ width: '30%' }}>
                                <Typography
                                  variant="body2"
                                  sx={{ color: 'text.secondary' }}
                                >
                                  {activeLanguage
                                    ? (row[activeLanguage] ?? '')
                                    : ''}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ width: '30%' }}>
                                {row.mp3 && (
                                  <IconButton
                                    size="small"
                                    onClick={() => handlePlay(row)}
                                    sx={{
                                      bgcolor: '#00a76f',
                                      color: '#fff',
                                      '&:hover': { bgcolor: '#007a52' },
                                    }}
                                  >
                                    {playingId === row.id ? (
                                      <Pause variant="Bulk" size={18} />
                                    ) : (
                                      <Play variant="Bulk" size={18} />
                                    )}
                                  </IconButton>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
