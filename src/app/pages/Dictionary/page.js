'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { GlobalContext } from '../../context/GlobalContext';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';

const ROWS_PER_PAGE = 50;
const DEBOUNCE_MS = 300;

export default function DictionaryPage() {
  const { mobileDevice } = useContext(GlobalContext);

  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const debounceRef = useRef(null);

  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setRows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/dictionary?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error(res.status);
        setRows(await res.json());
      } catch (err) {
        console.error('[Dictionary] fetch error:', err.message);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const handleSearch = e => {
    setSearch(e.target.value);
    setPage(0);
  };

  const paged = rows.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  return (
    <DashboardLayout>
      <Box
        sx={{
          width: '100%',
          maxWidth: 900,
          mx: 'auto',
          px: { xs: 2, sm: 0 },
          mt: 2,
          mb: mobileDevice ? 12 : 4,
        }}
      >
        <Card sx={{ borderRadius: 1, boxShadow: 2 }}>
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Dictionary
            </Typography>

            <TextField
              size="small"
              placeholder="Search word…"
              value={search}
              onChange={handleSearch}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      {loading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <SearchIcon fontSize="small" />
                      )}
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ maxWidth: 320 }}
            />

            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Word</TableCell>
                    {/* <TableCell sx={{ fontWeight: 600 }}>Phonetic</TableCell> */}
                    {/* <TableCell sx={{ fontWeight: 600 }}>Related</TableCell> */}
                    <TableCell sx={{ fontWeight: 600 }}>Meaning</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.map((row, i) => (
                    <TableRow key={`${row.word}-${i}`} hover>
                      <TableCell>{row.word}</TableCell>
                      {/* <TableCell sx={{ color: 'text.secondary' }}>
                        {row.phonetic ?? '—'}
                      </TableCell> */}
                      {/* <TableCell sx={{ color: 'text.secondary' }}>
                        {row.related ?? '—'}
                      </TableCell> */}
                      <TableCell>{row.meaning ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                  {!loading && search.trim() && paged.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No words found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {!search.trim() && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Start typing to search
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={rows.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={ROWS_PER_PAGE}
              rowsPerPageOptions={[ROWS_PER_PAGE]}
            />
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
