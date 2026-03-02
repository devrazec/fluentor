'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import { Play, Pause, VolumeHigh, VolumeMute } from 'iconsax-reactjs';

function formatTime(secs) {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

const QUESTION_ID = 1; // hardcoded for now — can be made dynamic via route param

function getPreview(name) {
    return name.split(' ').slice(0, 5).join(' ') + '…';
}

export default function PracticePage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnswer, setSelected] = useState('');

    // Audio player state
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/practice/${QUESTION_ID}/`);
                const json = await res.json();
                setData(json.data);
                if (json.data?.answers?.length > 0) {
                    setSelected(json.data.answers[0].id);
                }
            } catch (err) {
                console.error('[PracticePage] fetch error:', err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Reset player when answer changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    }, [selectedAnswer]);

    const handlePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(() => {});
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
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

    const answer = data?.answers?.find((a) => a.id === selectedAnswer);

    if (loading) {
        return (
            <DashboardLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress color="success" />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Box sx={{ width: '100%', maxWidth: 700, mx: 'auto', px: { xs: 1, sm: 0 }, mt: 2 }}>

                {/* Question Card */}
                <Card sx={{ borderRadius: 1, boxShadow: 2, mb: 3 }}>
                    <CardMedia
                        component="img"
                        height="160"
                        image={data?.category_image ? `/img/${data.category_image}` : `/img/${data?.id_category}.jpg`}
                        alt={data?.category_name}
                        sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                            <Chip label={data?.category_name} size="small" variant="outlined" />
                            <Chip label={data?.tense_name} size="small" variant="outlined" color="primary" />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>
                            {data?.name}
                        </Typography>
                    </CardContent>
                </Card>



                {/* Answer Player Card */}
                {answer && (
                    <Card sx={{ borderRadius: 1, boxShadow: 2 }}>
                        <CardContent>
                            {/* Answer Selector */}
                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                <InputLabel>Select an answer</InputLabel>
                                <Select
                                    value={selectedAnswer}
                                    label="Select an answer"
                                    onChange={(e) => { setSelected(e.target.value); setIsPlaying(false); }}
                                >
                                    {data?.answers?.map((a) => (
                                        <MenuItem key={a.id} value={a.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                                                <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                                                    {getPreview(a.name)}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                                                    <Chip label={`${a.timed}s`} size="small" color="primary" variant="outlined" />
                                                    <Chip label={`${a.word} words`} size="small" color="default" variant="outlined" />
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Hidden audio element */}
                            {answer.mp3 && (
                                <audio
                                    key={answer.mp3}
                                    ref={audioRef}
                                    src={`/mp3/${answer.mp3}`}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onEnded={handleEnded}
                                />
                            )}

                            {/* Answer text */}
                            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                                {answer.name}
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            {/* Progress bar */}
                            <Slider
                                size="small"
                                min={0}
                                max={duration || answer.timed || 1}
                                value={currentTime}
                                onChange={handleSeek}
                                sx={{
                                    color: '#00a76f',
                                    '& .MuiSlider-thumb': { width: 12, height: 12 },
                                    mb: 0.5,
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography variant="caption" color="text.secondary">{formatTime(currentTime)}</Typography>
                                <Typography variant="caption" color="text.secondary">{formatTime(duration || answer.timed)}</Typography>
                            </Box>

                            {/* Controls row */}
                            <Stack direction="row" alignItems="center" spacing={1}>
                                {/* Play / Pause */}
                                <IconButton
                                    onClick={handlePlayPause}
                                    sx={{ bgcolor: '#00a76f', color: '#fff', '&:hover': { bgcolor: '#007a52' } }}
                                >
                                    {isPlaying
                                        ? <Pause variant="Bulk" size={26} />
                                        : <Play variant="Bulk" size={26} />
                                    }
                                </IconButton>

                                {/* Volume mute toggle */}
                                <IconButton size="small" onClick={handleMuteToggle}>
                                    {muted || volume === 0
                                        ? <VolumeMute size={20} />
                                        : <VolumeHigh size={20} />
                                    }
                                </IconButton>

                                {/* Volume slider */}
                                <Slider
                                    size="small"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={muted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    sx={{ width: 80, color: '#00a76f', '& .MuiSlider-thumb': { width: 10, height: 10 } }}
                                />

                                <Box sx={{ flex: 1 }} />

                                {/* Chips */}
                                <Chip label={`${answer.timed}s`} size="small" color="primary" variant="outlined" />
                                <Chip label={`${answer.word} words`} size="small" variant="outlined" />
                            </Stack>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </DashboardLayout>
    );
}

/* import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';

export default function PracticePage() {
    
    const { dbAnswer } = useContext(GlobalContext);

    return (
        <DashboardLayout>

            <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, px: { xs: 1, sm: 0 } }}>

               
                <Grid container spacing={2} columns={12}>

                    <Card sx={{ display: 'flex' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flex: '1 0 auto' }}>
                                <Typography component="div" variant="h5">
                                    Live From Space
                                </Typography>
                                <Typography
                                    variant="subtitle1"
                                    component="div"
                                    sx={{ color: 'text.secondary' }}
                                >
                                    Mac Miller
                                </Typography>
                            </CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
                                <IconButton aria-label="previous">
                                    <SkipNextIcon />
                                </IconButton>
                                <IconButton aria-label="play/pause">
                                    <PlayArrowIcon sx={{ height: 38, width: 38 }} />
                                </IconButton>
                                <IconButton aria-label="next">
                                    <SkipNextIcon />
                                </IconButton>
                            </Box>
                        </Box>
                        <CardMedia
                            component="img"
                            sx={{ width: 151 }}
                            image="/img/1.jpg"
                            alt="Live from space album cover"
                        />
                    </Card>

                </Grid>


            </Box>
        </DashboardLayout>

    );
}
 */