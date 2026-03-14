'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import { GlobalContext } from '../context/GlobalContext';
import RecordPlayer from './RecordPlayer';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import { Play, Pause, DocumentDownload, Record } from 'iconsax-reactjs';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function Question() {
  const {
    dbQuestion,
    dbCategory,
    dbTense,
    dbAnswer,
    selectedQuestion,
    setSelectedQuestion,
    currentAnswer,
    setCurrentAnswer,
    selectedAnswer,
    setSelectedAnswer,
    setSelectedCategory,
    setSelectedTense,
    mobileDevice,
    filterQuestion,
    setFilterQuestion,
    scriptedWord,
    setScriptedWord,
  } = useContext(GlobalContext);

  const answer = currentAnswer?.find(a => a.id === selectedAnswer);

  useEffect(() => {
    if (currentAnswer?.length > 0) {
      const alreadyValid = currentAnswer.some(a => a.id === selectedAnswer);
      if (!alreadyValid) setSelectedAnswer(currentAnswer[0].id);
    }
  }, [currentAnswer]);

  useEffect(() => {
    if (!selectedQuestion?.id && dbQuestion?.length > 0) {
      const first = [...dbQuestion].sort((a, b) =>
        a.name.localeCompare(b.name)
      )[0];
      setFilterQuestion(first.id);
      setSelectedQuestion(first);
      setSelectedCategory(
        dbCategory.find(c => c.id === first.id_category) ?? {}
      );
      setSelectedTense(dbTense.find(t => t.id === first.id_tense) ?? {});
    }
  }, [dbQuestion]);

  useEffect(() => {
    if (selectedQuestion?.id && dbAnswer?.length > 0) {
      const answers = dbAnswer.filter(
        a => a.id_question === selectedQuestion.id
      );
      setCurrentAnswer(answers);
      const alreadyValid = answers.some(a => a.id === selectedAnswer);
      if (!alreadyValid && answers.length > 0) setSelectedAnswer(answers[0].id);
    }
  }, [selectedQuestion, dbAnswer]);

  function getPreviewQuestion(name) {
    if (mobileDevice) {
      return name.length > 25 ? name.slice(0, 25) + '…' : name;
    }
    return name;
  }

  function getPreviewAnswer(name) {
    return name.length > 15 ? name.slice(0, 15) + '…' : name;
  }

  return (
    <Card sx={{ borderRadius: 1, boxShadow: 2, mb: 3 }}>
      <CardMedia
        component="img"
        height={mobileDevice ? '120' : '200'}
        image={
          selectedQuestion?.category_image
            ? `/img/category/${selectedQuestion.category_image}`
            : `/img/category/${selectedQuestion?.id_category}.jpg`
        }
        alt={selectedQuestion?.category_name}
        sx={{ objectFit: 'cover', objectPosition: 'top' }}
      />
      <CardContent>
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
          {/* Filter Question */}
          <FormControl size="small" sx={{ width: { xs: '100%' } }}>
            <InputLabel>Question</InputLabel>
            <Select
              value={selectedQuestion?.id ?? ''}
              onChange={e => {
                const question = dbQuestion.find(q => q.id === e.target.value);
                if (question) {
                  setFilterQuestion(question.id);
                  setSelectedQuestion(question);
                  setSelectedCategory(
                    dbCategory.find(c => c.id === question.id_category) ?? {}
                  );
                  setSelectedTense(
                    dbTense.find(t => t.id === question.id_tense) ?? {}
                  );
                }
              }}
              renderValue={selected => {
                const q = dbQuestion.find(item => item.id === selected);
                return q ? getPreviewQuestion(q.name) : '';
              }}
              input={<OutlinedInput label="Question" />}
              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
              displayEmpty
            >
              {[...dbQuestion]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(q => (
                  <MenuItem key={q.id} value={q.id}>
                    {q.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>

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
          {/* Answer Selector */}
          <ToggleButtonGroup
            value={selectedAnswer}
            exclusive
            onChange={(_, val) => {
              if (val !== null) {
                setSelectedAnswer(val);
                setScriptedWord(val !== 'free');
              }
            }}
            sx={{
              display: 'flex',
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              width: '100%',
              gap: 1,
              //mb: 2,
              '& .MuiToggleButtonGroup-grouped': {
                borderRadius: '8px !important',
                border: '1px solid rgba(0,0,0,0.12) !important',
                mx: 0,
              },
            }}
          >
            {currentAnswer?.map((a, index) => (
              <ToggleButton
                key={a.id}
                value={a.id}
                sx={{
                  flex: { xs: '1 1 calc(50% - 4px)', sm: 1 },
                  minWidth: 0,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  px: 1.5,
                  py: 1,
                  textAlign: 'left',
                  textTransform: 'none',
                  position: 'relative',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: '#00a76f1f' },
                  backgroundColor:
                    selectedAnswer === a.id
                      ? '#00a76f1f !important'
                      : undefined,
                  borderColor:
                    selectedAnswer === a.id
                      ? '#00a76f1f !important'
                      : undefined,
                }}
              >
                {selectedAnswer === a.id && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 7,
                      right: 7,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#00a76f',
                      boxShadow: '0 0 0 2px rgba(0,167,111,0.25)',
                    }}
                  />
                )}
                <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5 }}>
                  Answer {index + 1}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ width: '100%', display: 'block' }}
                >
                  {getPreviewAnswer(a.name)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                  <Chip
                    label={`${a.timed} sec`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ pointerEvents: 'none' }}
                  />
                  {/* <Chip
                      label={`${a.word}words`}
                      size="small"
                      variant="outlined"
                      sx={{ pointerEvents: 'none' }}
                    /> */}
                </Box>
              </ToggleButton>
            ))}
            <ToggleButton
              key="free"
              value="free"
              sx={{
                flex: { xs: '1 1 calc(50% - 4px)', sm: 1 },
                minWidth: 0,
                flexDirection: 'column',
                alignItems: 'flex-start',
                px: 1.5,
                py: 1,
                textAlign: 'left',
                textTransform: 'none',
                position: 'relative',
                transition: 'background-color 0.2s',
                '&:hover': { bgcolor: '#00a76f1f' },
                backgroundColor:
                  selectedAnswer === 'free'
                    ? '#00a76f1f !important'
                    : undefined,
                borderColor:
                  selectedAnswer === 'free'
                    ? '#00a76f1f !important'
                    : undefined,
              }}
            >
              {selectedAnswer === 'free' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 7,
                    right: 7,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#00a76f',
                    boxShadow: '0 0 0 2px rgba(0,167,111,0.25)',
                  }}
                />
              )}
              <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5 }}>
                Free Answer
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ width: '100%', display: 'block' }}
              >
                Your own words
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                <Chip
                  label="60 sec"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ pointerEvents: 'none' }}
                />
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {selectedAnswer !== 'free' && (
          <Box
            sx={{
              mb: 2,
              lineHeight: 1.9,
              fontSize: '1.25rem',
              fontWeight: 700,
            }}
          >
            <span
              style={{
                transition: 'background 0.15s, color 0.15s',
                borderRadius: 4,
                padding: '1px 3px',
                marginRight: 2,
                display: 'inline-block',
              }}
            >
              {selectedAnswer
                ? answer?.name
                : 'Please select an answer to see details'}
            </span>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
