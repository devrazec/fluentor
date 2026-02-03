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
    title: 'Talk about & Personal Life',
    description:
      'family, childhood, background, daily routine, lifestyle, hometown',
  },
  {
    id: 2,
    title: 'Talk about & Work & Education',
    description: 'job, career, profession, studies, education, current project',
  },
  {
    id: 3,
    title: 'Talk about & Hobbies & Interests',
    description: 'hobbies, interests, favorite activities, free time, passions',
  },
  {
    id: 4,
    title: 'Talk about & Experiences & Life Events',
    description:
      'travel experiences, last vacation, most memorable experience, biggest challenge',
  },
  {
    id: 5,
    title: 'Talk about & Skills & Abilities',
    description: 'skills, talents, strengths, things you’re good at',
  },
  {
    id: 6,
    title: 'Talk about & Health & Lifestyle',
    description: 'diet, exercise routine, healthy habits, well-being',
  },
  {
    id: 7,
    title: 'Talk about & Opinions & Preferences',
    description: 'favorite movie, favorite book, favorite food, favorite place',
  },
  {
    id: 8,
    title: 'Talk about & Goals & Future',
    description: 'plans, goals, ambitions, dreams',
  },
  {
    id: 9,
    title: 'How often & Daily Life & Routines',
    description:
      'wake up early, go to bed late, cook at home, eat out, exercise, commute to work, clean your house',
  },
  {
    id: 10,
    title: 'How often & Work & Study',
    description:
      'work remotely, attend meetings, write reports, study English, learn new skills, use AI tools',
  },
  {
    id: 11,
    title: 'How often & Hobbies & Free Time',
    description:
      'read books, watch TV, listen to music, play video games, play sports, practice an instrument',
  },
  {
    id: 12,
    title: 'How often & Social & Communication',
    description:
      'meet friends, call your family, send messages, use social media, go out at night',
  },
];

function CardCategory() {
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

export default CardCategory;
