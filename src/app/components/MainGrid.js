'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { GlobalContext } from '../context/GlobalContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-reactjs';

const AUTOPLAY_INTERVAL = 3000;

function GroupCarousel({
  group,
  visibleCount,
  dbCategory,
  dbTense,
  dbAnswer,
  setSelectedQuestion,
  setSelectedCategory,
  setSelectedTense,
  setCurrentAnswer,
}) {
  const [startIndex, setStartIndex] = useState(0);
  const [isPlaying] = useState(true);
  const intervalRef = useRef(null);
  const questions = group.questions ?? [];
  const total = questions.length;

  const handleNext = useCallback(() => {
    setStartIndex(prev => (prev >= total - visibleCount ? 0 : prev + 1));
  }, [total, visibleCount]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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
    setStartIndex(prev =>
      prev <= 0 ? Math.max(total - visibleCount, 0) : prev - 1
    );

  const visibleCards = questions.slice(startIndex, startIndex + visibleCount);
  if (total === 0) return null;

  return (
    <Box sx={{ mb: 5, mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
          mb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {group.group_name}
        </Typography>
        {/* <Typography variant="body2" color="info" sx={{ flex: 1 }}>
          ({group.tense_names})
        </Typography> */}
        {/* <Typography variant="body2" color="text.secondary">
          {group.total_questions} question{group.total_questions !== 1 ? 's' : ''}
        </Typography> */}
        <Chip
          label={
            group.total_questions +
            ' question' +
            (group.total_questions !== 1 ? 's' : '')
          }
          size="small"
          variant="outlined"
          color="success"
        />
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={handlePrev}
          color="primary"
          disabled={total <= visibleCount}
          sx={{ flexShrink: 0 }}
        >
          <ArrowLeft2 variant="Bulk" color="#00a76f" size={32} />
        </IconButton>

        <Box
          sx={{ display: 'flex', flex: 1, gap: 2, overflow: 'hidden' }}
          onMouseEnter={stopAutoplay}
          onMouseLeave={() => isPlaying && startAutoplay()}
        >
          {visibleCards.map(q => (
            <Card
              key={q.id}
              sx={{
                flex: `0 0 calc(100% / ${visibleCount} - ${((visibleCount - 1) * 16) / visibleCount}px)`,
                display: 'flex',
                mb: 0.1,
                flexDirection: 'column',
                transition: 'background-color 0.2s',
                '&:hover': { bgcolor: '#00a76f1f' },
              }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '100%',
                  height: '110px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              >
                <source
                  src={`/mp4/category/${q.id_category}.mp4`}
                  type="video/mp4"
                />
              </video>
              <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: 'calc(2 * 1.43em)',
                    mb: 1,
                  }}
                >
                  {q.name}
                </Typography>
                <Chip label={q.tense_name} size="small" />
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  component={Link}
                  href={`/pages/Practice`}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setSelectedCategory(
                      dbCategory.find(c => c.id === q.id_category) ?? {}
                    );
                    setSelectedTense(
                      dbTense.find(t => t.id === q.id_tense) ?? {}
                    );
                    setCurrentAnswer(
                      dbAnswer.filter(a => a.id_question === q.id)
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
                    setSelectedQuestion(q);
                    setSelectedCategory(
                      dbCategory.find(c => c.id === q.id_category) ?? {}
                    );
                    setSelectedTense(
                      dbTense.find(t => t.id === q.id_tense) ?? {}
                    );
                    setCurrentAnswer(
                      dbAnswer.filter(a => a.id_question === q.id)
                    );
                  }}
                >
                  Test
                </Button>
                {/* <Typography variant="caption" color="text.secondary">
                  {q.total_answers}
                </Typography> */}
                {/* <Chip
                  label={
                    q.total_answers +
                    ' answer' +
                    (q.total_answers !== 1 ? 's' : '')
                  }
                  size="small"
                  variant="outlined"
                  color="error"
                /> */}
              </CardActions>
            </Card>
          ))}
        </Box>

        <IconButton
          onClick={handleNext}
          color="primary"
          disabled={total <= visibleCount}
          sx={{ flexShrink: 0 }}
        >
          <ArrowRight2 variant="Bulk" color="#00a76f" size={32} />
        </IconButton>
      </Box>
    </Box>
  );
}

export default function MainGrid() {
  const {
    dbHome,
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
    mobileDevice,
  } = useContext(GlobalContext);

  const visibleCount = mobileDevice ? 1 : 4;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { sm: '100%', md: '1700px' },
        px: { xs: 1, sm: 0 },
      }}
    >
      {/* <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Home</Typography> */}
      {dbHome.map(group => (
        <GroupCarousel
          key={group.group_id}
          group={group}
          visibleCount={visibleCount}
          dbCategory={dbCategory}
          dbTense={dbTense}
          dbAnswer={dbAnswer}
          setSelectedQuestion={setSelectedQuestion}
          setSelectedCategory={setSelectedCategory}
          setSelectedTense={setSelectedTense}
          setCurrentAnswer={setCurrentAnswer}
        />
      ))}
    </Box>
  );
}
