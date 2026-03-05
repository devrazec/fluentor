'use client';

import React, { useState, useContext, useMemo } from 'react';
import Link from 'next/link';
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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Divider from '@mui/material/Divider';
import { SearchNormal1 } from 'iconsax-reactjs';

const PAGE_SIZE = 12;

export default function QuestionPage() {
  const {
    dbQuestion,
    dbCategory,
    dbTense,
    dbAnswer,
    selectedCategory,
    setSelectedCategory,
    selectedTense,
    setSelectedTense,
    selectedQuestion,
    setSelectedQuestion,
    selectedAnswer,
    setSelectedAnswer,
    currentAnswer,
    setCurrentAnswer,
    filterCategory,
    setFilterCategory,
    filterTense,
    setFilterTense,
  } = useContext(GlobalContext);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return dbQuestion.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.category_name?.toLowerCase().includes(q) ||
        item.tense_name?.toLowerCase().includes(q);
      const matchCategory =
        filterCategory.length === 0 ||
        filterCategory.includes(item.id_category);
      const matchTense =
        filterTense.length === 0 || filterTense.includes(item.id_tense);
      return matchSearch && matchCategory && matchTense;
    });
  }, [dbQuestion, search, filterCategory, filterTense]);

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
          {/* Filters */}
          <FormControl size="small" sx={{ width: { xs: '100%', sm: 260 } }}>
            <InputLabel>Category</InputLabel>
            <Select
              multiple
              value={filterCategory}
              onChange={e => {
                setFilterCategory(e.target.value);
                setPage(1);
              }}
              input={<OutlinedInput label="Category" />}
              renderValue={selected =>
                selected.length === 0 ? '' : `${selected.length} selected`
              }
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              <MenuItem
                dense
                disabled={filterCategory.length === 0}
                onMouseDown={e => {
                  e.preventDefault();
                  setFilterCategory([]);
                  setPage(1);
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
              {dbCategory.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  <Checkbox checked={filterCategory.includes(cat.id)} />
                  <ListItemText primary={cat.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: { xs: '100%', sm: 260 } }}>
            <InputLabel>Tense</InputLabel>
            <Select
              multiple
              value={filterTense}
              onChange={e => {
                setFilterTense(e.target.value);
                setPage(1);
              }}
              input={<OutlinedInput label="Tense" />}
              renderValue={selected =>
                selected.length === 0 ? '' : `${selected.length} selected`
              }
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
            >
              <MenuItem
                dense
                disabled={filterTense.length === 0}
                onMouseDown={e => {
                  e.preventDefault();
                  setFilterTense([]);
                  setPage(1);
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
              {dbTense.map(tense => (
                <MenuItem key={tense.id} value={tense.id}>
                  <Checkbox checked={filterTense.includes(tense.id)} />
                  <ListItemText primary={tense.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Search */}
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
          {paginated.map(item => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: '#00a76f1f' },
                }}
              >
                <CardMedia
                  component="img"
                  height="120"
                  image={
                    item.category_image
                      ? `/img/category/${item.category_image}`
                      : `/img/category/${item.id_category}.jpg`
                  }
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
                  <Stack
                    direction="row"
                    spacing={0.5}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {item.category_name && (
                      <Chip
                        label={item.category_name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {item.tense_name && (
                      <Chip label={item.tense_name} size="small" />
                    )}
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    component={Link}
                    href={`/pages/Practice`}
                    onClick={() => {
                      setSelectedQuestion(item);
                      setSelectedCategory(
                        dbCategory.find(c => c.id === item.id_category) ?? {}
                      );
                      setSelectedTense(
                        dbTense.find(t => t.id === item.id_tense) ?? {}
                      );
                      setCurrentAnswer(
                        dbAnswer.filter(a => a.id_question === item.id)
                      );
                    }}
                  >
                    Practice
                  </Button>
                  {/* <Typography variant="body2" color="text.secondary">
                                        {item.total_answers}
                                    </Typography> */}
                  <Chip
                    label={item.total_answers + ' answers'}
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
