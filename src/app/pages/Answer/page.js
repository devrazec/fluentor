'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
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
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);
  const [page, setPage] = useState(1);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        pageSize: PAGE_SIZE,
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const res = await fetch(`/api/answer?${params}`);
      const json = await res.json();
      setRows(json.data);
      setTotal(json.total);
    } catch (err) {
      console.error('[AnswerPage] fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

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
                <Card sx={{ borderRadius: 2, boxShadow: 1, height: '100%' }}>
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
                      <Button variant="contained" size="small" color="primary">
                        Practice
                      </Button>
                      <Chip
                        label={`${row.timed} seconds`}
                        size="small"
                        variant="outlined"
                        color="error"
                      />
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
            size="small"
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
}
