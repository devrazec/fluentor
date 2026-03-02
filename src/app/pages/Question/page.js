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
import Pagination from '@mui/material/Pagination';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { SearchNormal1 } from 'iconsax-reactjs';

const PAGE_SIZE = 12;

export default function QuestionPage() {
    const { dbQuestion } = useContext(GlobalContext);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return dbQuestion.filter((item) =>
            item.name.toLowerCase().includes(q) ||
            item.category_name?.toLowerCase().includes(q) ||
            item.tense_name?.toLowerCase().includes(q)
        );
    }, [dbQuestion, search]);

    const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

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
                        Questions
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({filtered.length})
                        </Typography>
                    </Typography> */}
                    <TextField
                        size="small"
                        placeholder="Search questions..."
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
                    {paginated.map((item) => (
                        <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="img"
                                    height="120"
                                    image={item.category_image ? `/img/${item.category_image}` : `/img/cat${item.id_category}.jpg`}
                                    alt={item.category_name}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={600}
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            mb: 1,
                                        }}
                                    >
                                        {item.name}
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                        {item.category_name && (
                                            <Chip label={item.category_name} size="small" color="primary" variant="outlined" />
                                        )}
                                        {item.tense_name && (
                                            <Chip label={item.tense_name} size="small" variant="outlined" />
                                        )}
                                    </Stack>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between' }}>
                                    <Button variant="contained" size="small" color="primary">Practice</Button>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.total_answers}
                                    </Typography>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Empty state */}
                {paginated.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography color="text.secondary">No questions found.</Typography>
                    </Box>
                )}

                {/* Pagination */}
                {pageCount > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={pageCount}
                            page={page}
                            onChange={(_, val) => setPage(val)}
                            color="primary"
                            shape="rounded"
                        />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}
