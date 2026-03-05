'use client';

import React, { useState, useContext, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { GlobalContext } from '../../context/GlobalContext';
import Link from 'next/link';
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
import Skeleton from '@mui/material/Skeleton';
import { SearchNormal1 } from 'iconsax-reactjs';
import Tilt from 'react-parallax-tilt';

const PAGE_SIZE = 12;

export default function CategoryPage() {
  const {
    dbCategory,
    filterCategory,
    setFilterCategory,
    filterTense,
    setFilterTense,
  } = useContext(GlobalContext);
  const loading = dbCategory.length === 0;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return dbCategory.filter(c => c.name.toLowerCase().includes(q));
  }, [dbCategory, search]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = e => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <DashboardLayout>
      <Box
        sx={{
          width: '100%',
          maxWidth: { sm: '100%', md: '1700px' },
          px: { xs: 1, sm: 0 },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'flex-end',
            alignItems: { xs: 'flex-end', sm: 'center' },
            gap: 1.5,
            mb: 2,
            mt: 2,
          }}
        >
          {/* <Typography variant="h5" fontWeight={700}>
                        Categories
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({filtered.length})
                        </Typography>
                    </Typography> */}
          <TextField
            size="small"
            placeholder="Search categories..."
            value={search}
            onChange={handleSearch}
            sx={{ width: { xs: '100%', sm: 260 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={18} color="#00a76f" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1, whiteSpace: 'nowrap' }}
                  >
                    ({filtered.length})
                  </Typography>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Grid */}
        <Grid container spacing={2} columns={12}>
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                  <Skeleton variant="rounded" height={240} />
                </Grid>
              ))
            : paginated.map((cat, idx) => (
                <Grid key={cat.id} size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: '#00a76f1f' },
                    }}
                  >
                    <Tilt
                      perspective={900}
                      tiltMaxAngleX={14}
                      tiltMaxAngleY={14}
                      scale={1.04}
                      transitionSpeed={600}
                      glareEnable={true}
                      glareMaxOpacity={0.2}
                      glareColor="#ffffff"
                      glarePosition="all"
                      glareBorderRadius="0px"
                      style={{ overflow: 'hidden' }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          overflow: 'hidden',
                          height: 120,
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            // Cycles through Spring → Summer → Autumn → Winter colour wash.
                            // Each card is shifted 6 s so all four seasons show at once in the grid.
                            animation: 'catSeason 24s linear infinite',
                            animationDelay: `-${(idx * 6) % 24}s`,
                            '@keyframes catSeason': {
                              // Spring  – soft green glow
                              '0%': { background: 'rgba(100, 200,  80, 0.22)' },
                              '20%': {
                                background: 'rgba(100, 200,  80, 0.22)',
                              },
                              // → Summer – warm golden
                              '25%': {
                                background: 'rgba(255, 200,  40, 0.15)',
                              },
                              '45%': {
                                background: 'rgba(255, 200,  40, 0.15)',
                              },
                              // → Autumn – burnt orange
                              '50%': {
                                background: 'rgba(210,  80,  15, 0.25)',
                              },
                              '70%': {
                                background: 'rgba(210,  80,  15, 0.25)',
                              },
                              // → Winter – icy blue
                              '75%': {
                                background: 'rgba(130, 190, 255, 0.30)',
                              },
                              '95%': {
                                background: 'rgba(130, 190, 255, 0.30)',
                              },
                              // back to Spring
                              '100%': {
                                background: 'rgba(100, 200,  80, 0.22)',
                              },
                            },
                            mixBlendMode: 'multiply',
                            pointerEvents: 'none',
                            zIndex: 2,
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="120"
                          image={
                            cat.image
                              ? `/img/category/${cat.image}`
                              : `/img/category/${cat.id}.jpg`
                          }
                          alt={cat.name}
                          sx={{
                            objectFit: 'cover',
                            transformOrigin: 'center center',
                            // Ken Burns pan keeps subjects looking alive.
                            // catSeasonFilter shifts hue/brightness in sync with the colour overlay.
                            animation: [
                              `catKenBurns ${14 + (idx % 5) * 2}s ease-in-out infinite`,
                              'catSeasonFilter 24s linear infinite',
                            ].join(', '),
                            animationDelay: [
                              `-${(idx * 2.9) % 14}s`,
                              `-${(idx * 6) % 24}s`,
                            ].join(', '),
                            '@keyframes catKenBurns': {
                              '0%': {
                                transform: 'scale(1.22) translate(-3%, -2%)',
                              },
                              '15%': {
                                transform: 'scale(1.26) translate(-1%, -4%)',
                              },
                              '30%': {
                                transform: 'scale(1.21) translate( 2%, -1%)',
                              },
                              '50%': {
                                transform: 'scale(1.26) translate( 3%,  2%)',
                              },
                              '70%': {
                                transform: 'scale(1.21) translate( 1%,  4%)',
                              },
                              '85%': {
                                transform: 'scale(1.24) translate(-2%,  2%)',
                              },
                              '100%': {
                                transform: 'scale(1.22) translate(-3%, -2%)',
                              },
                            },
                            '@keyframes catSeasonFilter': {
                              // Spring  – fresh, vivid green
                              '0%': {
                                filter:
                                  'brightness(1.06) saturate(1.40) hue-rotate(18deg)',
                              },
                              '20%': {
                                filter:
                                  'brightness(1.06) saturate(1.40) hue-rotate(18deg)',
                              },
                              // → Summer – bright, warm
                              '25%': {
                                filter:
                                  'brightness(1.22) saturate(1.20) hue-rotate(4deg)',
                              },
                              '45%': {
                                filter:
                                  'brightness(1.22) saturate(1.20) hue-rotate(4deg)',
                              },
                              // → Autumn – rich, orange-red
                              '50%': {
                                filter:
                                  'brightness(0.90) saturate(1.55) hue-rotate(-28deg)',
                              },
                              '70%': {
                                filter:
                                  'brightness(0.90) saturate(1.55) hue-rotate(-28deg)',
                              },
                              // → Winter – cold, desaturated blue
                              '75%': {
                                filter:
                                  'brightness(0.72) saturate(0.45) hue-rotate(185deg)',
                              },
                              '95%': {
                                filter:
                                  'brightness(0.72) saturate(0.45) hue-rotate(185deg)',
                              },
                              // back to Spring
                              '100%': {
                                filter:
                                  'brightness(1.06) saturate(1.40) hue-rotate(18deg)',
                              },
                            },
                          }}
                        />
                      </Box>
                    </Tilt>
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
                        {cat.name}
                      </Typography>
                      {cat.tenses?.length > 0 && (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          flexWrap="wrap"
                          useFlexGap
                          sx={{ mt: 1 }}
                        >
                          {cat.tenses.map(t => (
                            <Chip key={t} label={t} size="small" />
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        component={Link}
                        href={`/pages/Question`}
                        onClick={() => {
                          setFilterTense([]);
                          setFilterCategory([cat.id]);
                        }}
                      >
                        See More
                      </Button>
                      {/* <Typography variant="body2" color="text.secondary">
                                        {cat.total_questions} question{cat.total_questions !== 1 ? 's' : ''}
                                    </Typography> */}
                      <Chip
                        label={
                          cat.total_questions +
                          ' question' +
                          (cat.total_questions !== 1 ? 's' : '')
                        }
                        size="small"
                        variant="outlined"
                        color="error"
                      />
                    </CardActions>
                  </Card>
                </Grid>
              ))}
        </Grid>

        {/* Empty state */}
        {!loading && paginated.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">No categories found.</Typography>
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
