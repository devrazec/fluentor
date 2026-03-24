'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Question from '../../components/Question';
import RecordPlayer from '../../components/RecordPlayer';
import FeedbackTable from '../../components/FeedbackTable';
import ScoreTable from '../../components/ScoreTable';
import ErrorTable from '../../components/ErrorTable';
import ResultTable from '../../components/ResultTable';
import RecognizedText from '../../components/RecognizedText';
import VocabularyTable from '../../components/VocabularyTable';

import { GlobalContext } from '../../context/GlobalContext';

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
import {
  Play,
  Pause,
  DocumentDownload,
  ArrowDown2,
  ArrowUp2,
} from 'iconsax-reactjs';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';

export default function VocabularyPage() {
  //const [popoverAnchor, setPopoverAnchor] = React.useState(null);
  //const [popoverText, setPopoverText] = React.useState('');

  const {
    dbQuestion,
    dbCategory,
    dbTense,
    dbAnswer,

    dbRecord,
    setDbRecord,
    dbResult,
    setDbResult,

    selectedQuestion,
    currentAnswer,
    selectedAnswer,
    setSelectedAnswer,
    mobileDevice,
    filterQuestion,
    setFilterQuestion,

    pronunciationLabel,
    setPronunciationLabel,
    errorLabel,
    setErrorLabel,
    scoreLabel,
    setScoreLabel,

    testResult,
    setTestResult,
  } = useContext(GlobalContext);

  return (
    <DashboardLayout>
      <Box
        sx={{
          width: '100%',
          //maxWidth: 700,
          mx: 'auto',
          px: { xs: 2, sm: 0 },
          mt: 2,
        }}
      >
        <Grid container spacing={1} alignItems="stretch">
          <VocabularyTable />
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
