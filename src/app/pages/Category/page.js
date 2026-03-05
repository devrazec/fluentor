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
                      glareEnable={false}
                      style={{ overflow: 'hidden' }}
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
                          // Continuously drift so the image is always in motion.
                          // Each card uses a different duration + negative delay
                          // so they all start mid-animation and are out of phase.
                          animation: `catImgDrift ${3.2 + (idx % 4) * 0.6}s ease-in-out infinite alternate`,
                          animationDelay: `-${(idx * 1.1) % 3.5}s`,
                          transformOrigin: 'center center',
                          '@keyframes catImgDrift': {
                            '0%': {
                              transform:
                                'scale(1.12) rotateY(-4deg) rotateX(3deg) translateX(-4px) translateY(-3px)',
                            },
                            '100%': {
                              transform:
                                'scale(1.12) rotateY(4deg) rotateX(-3deg) translateX(4px) translateY(3px)',
                            },
                          },
                        }}
                      />
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
