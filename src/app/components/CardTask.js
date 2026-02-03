'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';

const cards = [
  {
    id: 1,
    title: 'Read Text Aloud',
    description:
      'Pronunciation, stress, intonation, rhythm, and clarity of speech.',
  },
  {
    id: 2,
    title: 'Listening and Repeat Sentence',
    description:
      'Listening accuracy, short-term memory, pronunciation, and fluency.',
  },
  {
    id: 3,
    title: 'Describe Picture / Image',
    description:
      'Describing visual information, using appropriate vocabulary, organizing ideas, and speaking fluently.',
  },
  {
    id: 4,
    title: 'Re-tell Lecture / Speak About Lecture',
    description:
      'Summarizing key points, identifying main ideas and details, paraphrasing, and organizing spoken information clearly.',
  },
  {
    id: 5,
    title: 'Answer / Respond to Questions',
    description:
      'Understanding questions, giving relevant responses, accuracy, and natural fluency.',
  },
  {
    id: 6,
    title: '',
    description: '',
  },
  {
    id: 7,
    title: '',
    description: '',
  },
  {
    id: 8,
    title: '',
    description: '',
  },
  {
    id: 9,
    title: '',
    description: '',
  },
  {
    id: 10,
    title: '',
    description: '',
  },
  {
    id: 11,
    title: '',
    description: '',
  },
  {
    id: 12,
    title: '',
    description: '',
  },
];

function CardTask() {
  const [selectedCard, setSelectedCard] = React.useState(0);
  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
        gap: 2,
      }}
    >
      {cards.map((card, index) => (
        <Card key={card.id}>
          <CardMedia
            component="img"
            height="140"
            image={`/img/cat${index + 1}.jpg`}
            alt="Cat 1"
          />
          <CardActionArea
            onClick={() => setSelectedCard(index)}
            data-active={selectedCard === index ? '' : undefined}
            sx={{
              height: '100%',
              '&[data-active]': {
                backgroundColor: 'action.selected',
                '&:hover': {
                  backgroundColor: 'action.selectedHover',
                },
              },
            }}
          >
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h5" component="div">
                {card.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.description}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}

export default CardTask;
