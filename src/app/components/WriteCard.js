'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Send2 } from 'iconsax-reactjs';

// ─── Message bubble ─────────────────────────────────────────────

function MessageBubble({ msg }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          bgcolor: theme => `${theme.palette.primary.main}22`,
          borderRadius: '12px 2px 12px 12px',
          px: 1.5,
          py: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {msg.text}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Main component ─────────────────────────────────────────────

export default function WriteCard() {
  const { mobileDevice } = useContext(GlobalContext);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: Date.now(), text }]);
    setInput('');
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Grid
      size={{ xs: 12, md: 6 }}
      sx={{ mb: mobileDevice ? 12 : 12, height: '70vh', minHeight: 400 }}
    >
      <Card
        sx={{
          borderRadius: 1,
          boxShadow: 2,
          mb: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            '&:last-child': { pb: 2 },
          }}
        >
          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              pr: 0.5,
            }}
          >
            {/* Initial instruction */}
            {messages.length === 0 && (
              <Box
                sx={{
                  textAlign: 'center',
                  px: 2,
                  py: 3,
                  color: 'text.secondary',
                }}
              >
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Practice your writing
                </Typography>
                <Typography variant="caption">
                  Type in English below and press Enter or the send button.
                  Review your sentences to practice writing.
                </Typography>
              </Box>
            )}

            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            <div ref={messagesEndRef} />
          </Box>
        </CardContent>
      </Card>

      {/* Floating input bar */}
      <Box
        sx={{
          borderRadius: { xs: '12px 12px 0 0', sm: 1 },
          boxShadow: { xs: 6, sm: 2 },
          mb: { xs: 0, sm: 2 },
          position: { xs: 'fixed', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          left: { xs: 0, sm: 'auto' },
          right: { xs: 0, sm: 'auto' },
          zIndex: { xs: 1200, sm: 'auto' },
          backgroundColor: 'background.paper',
          px: 2,
          py: 1.5,
        }}
      >
        <Stack direction="row" alignItems="flex-end" spacing={1}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Write something in English…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              sx: { borderRadius: 2 },
            }}
          />
          <IconButton
            onClick={handleSubmit}
            disabled={!input.trim()}
            sx={{
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              color: '#fff',
              '&:hover': { backgroundColor: 'primary.dark' },
              '&.Mui-disabled': {
                backgroundColor: 'action.disabledBackground',
              },
            }}
          >
            <Send2 size={20} variant="Bulk" />
          </IconButton>
        </Stack>
      </Box>
    </Grid>
  );
}
