'use client';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CardCategory from './CardCategory';
import CardTask from './CardTask';

export default function MainGrid() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Categories
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: theme => theme.spacing(2) }}
      >
        <CardCategory />
      </Grid>
      <Divider />
      <Typography component="h2" variant="h6" sx={{ mb: 2, mt: 2 }}>
        Tasks
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: theme => theme.spacing(2) }}
      >
        <CardTask />
      </Grid>
      <Divider />
      <Typography component="h2" variant="h6" sx={{ mb: 2, mt: 2 }}>
        Exams
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: theme => theme.spacing(2) }}
      >
        <CardCategory />
      </Grid>
    </Box>
  );
}
