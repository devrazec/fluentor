'use client';

import React, { useState, useRef, useContext, useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/DashboardLayout';
import { GlobalContext } from '../../context/GlobalContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { SearchNormal1 } from 'iconsax-reactjs';

const PAGE_SIZE = 20;

export default function AnswerPage() {
  const {
    dbQuestion,
    dbCategory,
    dbTense,
    dbAnswer,
    setSelectedQuestion,
    setSelectedCategory,
    setSelectedTense,
    setSelectedAnswer,
    setCurrentAnswer,
  } = useContext(GlobalContext);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return dbAnswer;
    const q = debouncedSearch.toLowerCase();
    return dbAnswer.filter(
      a =>
        a.name?.toLowerCase().includes(q) ||
        a.question_name?.toLowerCase().includes(q)
    );
  }, [dbAnswer, debouncedSearch]);

  const total = filtered.length;
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const loading = dbAnswer.length === 0;

  const handleSearch = e => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 350);
  };

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <DashboardLayout>
      <Box
        sx={{
          width: '100%',
          maxWidth: { sm: '100%', md: '1700px' },
          px: { xs: 1, sm: 0 },
        }}
      >
        {/* Search bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mb: 2,
            mt: 2,
          }}
        >
          <TextField
            size="small"
            placeholder="Search answers..."
            value={search}
            onChange={handleSearch}
            sx={{ width: { xs: '100%', sm: 280 } }}
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress color="success" />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {rows.map(row => (
              <Grid key={row.id} size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: 1,
                    height: '100%',
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: '#00a76f1f' },
                  }}
                >
                  <CardContent sx={{ pb: '12px !important' }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {row.question_name}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      sx={{
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {row.name}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        component={Link}
                        href={`/pages/Practice`}
                        onClick={() => {
                          const question = dbQuestion.find(
                            q => q.id === row.id_question
                          );
                          if (question) {
                            setSelectedQuestion(question);
                            setSelectedCategory(
                              dbCategory.find(
                                c => c.id === question.id_category
                              ) ?? {}
                            );
                            setSelectedTense(
                              dbTense.find(t => t.id === question.id_tense) ??
                                {}
                            );
                          }
                          setSelectedAnswer(row.id);
                          setCurrentAnswer(
                            dbAnswer.filter(
                              a => a.id_question === row.id_question
                            )
                          );
                        }}
                      >
                        Practice
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="warning"
                        component={Link}
                        href={`/pages/Test`}
                        onClick={() => {
                          const question = dbQuestion.find(
                            q => q.id === row.id_question
                          );
                          if (question) {
                            setSelectedQuestion(question);
                            setSelectedCategory(
                              dbCategory.find(
                                c => c.id === question.id_category
                              ) ?? {}
                            );
                            setSelectedTense(
                              dbTense.find(t => t.id === question.id_tense) ??
                                {}
                            );
                          }
                          setSelectedAnswer(row.id);
                          setCurrentAnswer(
                            dbAnswer.filter(
                              a => a.id_question === row.id_question
                            )
                          );
                        }}
                      >
                        Test
                      </Button>
                      {/* <Chip
                        label={`${row.timed} seconds`}
                        size="small"
                        variant="outlined"
                        color="error"
                      /> */}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            siblingCount={0}
            boundaryCount={1}
            size="small"
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
}
