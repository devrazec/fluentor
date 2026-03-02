'use client';

import React, { useState, useContext, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { GlobalContext } from '../../context/GlobalContext';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { SearchNormal1 } from 'iconsax-reactjs';

export default function TensePage() {
    const { dbTense } = useContext(GlobalContext);

    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return dbTense.filter((t) => t.name.toLowerCase().includes(q));
    }, [dbTense, search]);

    const handleSearch = (e) => setSearch(e.target.value);

    return (
        <DashboardLayout>
            <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, px: { xs: 1, sm: 0 } }}>

                {/* Header */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'flex-end',
                    alignItems: { xs: 'flex-end', sm: 'center' },
                    gap: 1.5,
                    mb: 2,
                    mt: 2,
                }}>
                    {/* <Typography variant="h5" fontWeight={700}>
                        Tenses
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({filtered.length})
                        </Typography>
                    </Typography> */}
                    <TextField
                        size="small"
                        placeholder="Search tenses..."
                        value={search}
                        onChange={handleSearch}
                        sx={{ width: { xs: '100%', sm: 260 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchNormal1 size={18} color="#00a76f" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* Grid */}
                <Grid container spacing={2} columns={12}>
                    {filtered.map((tense) => (
                        <Grid key={tense.id} size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="img"
                                    height="120"
                                    image={tense.image ? `/img/${tense.image}` : `/img/tense${tense.id}.jpg`}
                                    alt={tense.name}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={600}
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {tense.name}
                                    </Typography>
                                    {tense.categories?.length > 0 && (
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                            {tense.categories.map((c) => (
                                                <Chip key={c} label={c} size="small" variant="outlined" color="primary" />
                                            ))}
                                        </Stack>
                                    )}
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between' }}>
                                    <Button variant="contained" size="small" color="primary">See More</Button>
                                    {/* <Typography variant="body2" color="text.secondary">
                                        {tense.total_questions}
                                    </Typography> */}
                                    <Chip label={tense.total_questions + " question" + (tense.total_questions !== 1 ? 's' : '')} size="small" variant="outlined" color="error" />
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">No tenses found.</Typography>
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}
