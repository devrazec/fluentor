'use client';

import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-reactjs';

const AUTOPLAY_INTERVAL = 3000;

function GroupCarousel({ group, visibleCount }) {
  const [startIndex, setStartIndex] = useState(0);
  const [isPlaying] = useState(true);
  const intervalRef = useRef(null);
  const questions = group.questions ?? [];
  const total = questions.length;

  const handleNext = useCallback(() => {
    setStartIndex((prev) => (prev >= total - visibleCount ? 0 : prev + 1));
  }, [total, visibleCount]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    intervalRef.current = setInterval(handleNext, AUTOPLAY_INTERVAL);
  }, [handleNext, stopAutoplay]);

  useEffect(() => {
    if (isPlaying && total > visibleCount) startAutoplay();
    else stopAutoplay();
    return stopAutoplay;
  }, [isPlaying, total, visibleCount, startAutoplay, stopAutoplay]);

  const handlePrev = () =>
    setStartIndex((prev) => (prev <= 0 ? Math.max(total - visibleCount, 0) : prev - 1));

  const visibleCards = questions.slice(startIndex, startIndex + visibleCount);
  if (total === 0) return null;

  return (
    <Box sx={{ mb: 5, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>{group.group_name}</Typography>
        <Typography variant="body2" color="info" sx={{ flex: 1 }}>({group.tense_names})</Typography>
        {/* <Typography variant="body2" color="text.secondary">
          {group.total_questions} question{group.total_questions !== 1 ? 's' : ''}
        </Typography> */}
        <Chip label={group.total_questions + " question" + (group.total_questions !== 1 ? 's' : '')} size="small" variant="outlined" color="success" />
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={handlePrev} color="primary" disabled={total <= visibleCount} sx={{ flexShrink: 0 }}>
          <ArrowLeft2 variant="Bulk" color="#00a76f" size={32} />
        </IconButton>

        <Box
          sx={{ display: 'flex', flex: 1, gap: 2, overflow: 'hidden' }}
          onMouseEnter={stopAutoplay}
          onMouseLeave={() => isPlaying && startAutoplay()}
        >
          {visibleCards.map((q) => (
            <Card key={q.id} sx={{ flex: `0 0 calc(100% / ${visibleCount} - ${(visibleCount - 1) * 16 / visibleCount}px)`, display: 'flex', mb: 0.1, flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="110"
                image={q.category_image ? `/img/${q.category_image}` : `/img/cat${q.id_category}.jpg`}
                alt={q.category_name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                <Typography variant="body2" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 'calc(2 * 1.43em)', mb: 1 }}>
                  {q.name}
                </Typography>
                <Chip label={q.tense_name} size="small" />
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button variant="contained" size="small" color="primary">Practice</Button>
                {/* <Typography variant="caption" color="text.secondary">
                  {q.total_answers}
                </Typography> */}
                <Chip label={q.total_answers + " answer" + (q.total_answers !== 1 ? 's' : '')} size="small" variant="outlined" color="error" />
              </CardActions>
            </Card>
          ))}
        </Box>

        <IconButton onClick={handleNext} color="primary" disabled={total <= visibleCount} sx={{ flexShrink: 0 }}>
          <ArrowRight2 variant="Bulk" color="#00a76f" size={32} />
        </IconButton>
      </Box>
    </Box>
  );
}

export default function MainGrid() {
  const { dbHome, mobileDevice } = useContext(GlobalContext);
  const visibleCount = mobileDevice ? 1 : 4;

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, px: { xs: 1, sm: 0 } }}>
      {/* <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Home</Typography> */}
      {dbHome.map((group) => (
        <GroupCarousel key={group.group_id} group={group} visibleCount={visibleCount} />
      ))}
    </Box>
  );
}
