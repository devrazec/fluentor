'use client';

import { createContext, useState, useEffect } from 'react';

export const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileDevice, setMobileDevice] = useState(false);

  const [dbHome, setDbHome] = useState([]);
  const [dbCategory, setDbCategory] = useState([]);
  const [dbTense, setDbTense] = useState([]);
  const [dbQuestion, setDbQuestion] = useState([]);
  const [dbAnswer, setDbAnswer] = useState([]);
  const [dbRecord, setDbRecord] = useState([]);
  const [dbResult, setDbResult] = useState([]);

  const [selectedPage, setSelectedPage] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedTense, setSelectedTense] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState([]); // id of the selected answer
  const [currentAnswer, setCurrentAnswer] = useState([]); // answers of the selected question

  const [filterCategory, setFilterCategory] = useState([]);
  const [filterTense, setFilterTense] = useState([]);
  const [filterQuestion, setFilterQuestion] = useState([]);

  const [selectedRecord, setSelectedRecord] = useState([]);
  const [selectedResult, setSelectedResult] = useState([]);

  const [pronunciationLabel, setPronunciationLabel] = useState([
    {
      label: '0–59',
      color: '#f44336',
      level: 'Basic',
      cefr: 'A1–A2',
      ielts: '0–3.5',
      toefl: '0–40',
      feedback:
        'Based on your performance, your speaking skills are at the basic level. You are able to use simple words and phrases to communicate in familiar situations. To reach the intermediate level, focus on expanding your vocabulary, practicing sentence structure, and improving pronunciation.',
      note: 'Speech has many pronunciation errors. Listeners may struggle to understand without repetition. Limited fluency and accuracy.',
    },
    {
      label: '60–79',
      color: '#ffc107',
      level: 'Intermediate',
      cefr: 'B1–B2',
      ielts: '4.0–6.0',
      toefl: '41–90',
      feedback:
        'Based on your performance, your speaking skills are at the intermediate level. You have a good grasp of basic pronunciation and can communicate effectively in familiar situations. To reach the advanced level, focus on improving your fluency, expanding your vocabulary.',
      note: 'Pronunciation is generally understandable but contains noticeable errors. Fluency is moderate. Communication works but with some effort.',
    },
    {
      label: '80–100',
      color: '#4caf50',
      level: 'Advanced',
      cefr: 'C1–C2',
      ielts: '6.5–9.0',
      toefl: '91–120',
      feedback:
        'Based on your performance, your speaking skills are at the advanced level. You communicate clearly and confidently in a wide range of situations, with good control of vocabulary and pronunciation. To continue improving, focus on refining your fluency, using more nuanced expressions.',
      note: 'Clear pronunciation close to native-like patterns. High fluency and accuracy. Easy to understand.',
    },
  ]);

  const [errorLabel, setErrorLabel] = useState([
    {
      label: 'Mispronunciation',
      value: 0,
      color: '#e53935',
      note: 'The words that are spoken incorrectly. This can include wrong vowel or consonant sounds, stress on the wrong syllable, or incorrect intonation patterns.',
    },
    {
      label: 'Omission',
      value: 0,
      color: '#fb8c00',
      note: 'The words that are provided in the script but are not spoken. This can indicate difficulty in recalling or pronouncing certain words, or it may reflect a lack of familiarity with the vocabulary.',
    },
    {
      label: 'Insertion',
      value: 0,
      color: '#8e24aa',
      note: 'The words that are not in the script but are detected in the recording. This can indicate overcompensation or misunderstanding of the content.',
    },
    {
      label: 'Unexpected break',
      value: 0,
      color: '#1e88e5',
      note: 'Improperly paused in between words within same sentence. This can indicate hesitation, difficulty in recalling the next word, or uncertainty in pronunciation.',
    },
    {
      label: 'Missing break',
      value: 0,
      color: '#00897b',
      note: 'Missing pauses between words when there is a punctuation in present between them. This can indicate a lack of awareness of natural speech patterns or difficulty in controlling the flow of speech.',
    },
    {
      label: 'Monotone',
      value: 0,
      color: '#6d4c41',
      note: 'The words are being read in a flat and unexciting tone, without any rhythm or expression. This can indicate a lack of engagement with the content or difficulty in conveying emotions through speech.',
    },
  ]);

  const [scoreLabel, setScoreLabel] = useState([
    {
      label: 'Accuracy',
      value: 0,
      note: 'Pronunciation accuracy of the speech. Accuracy indicates how closely the phonemes match a native speaker`s pronunciation. Word and full text accuracy scores are aggregated from phoneme-level accuracy score.',
    },
    {
      label: 'Fluency',
      value: 0,
      note: 'Fluency of the given speech. Fluency indicates how closely the speech matches a native speaker`s use of silent breaks between words.',
    },
    {
      label: 'Completeness',
      value: 0,
      note: 'Completeness of the speech, calculated by the ratio of pronounced words to the input reference text.',
    },
    {
      label: 'Prosody',
      value: 0,
      note: 'Prosody of the given speech. Prosody indicates how nature of the given speech, including stress, intonation, speaking speed and rhythm.',
    },
  ]);

  useEffect(() => {
    const fetchTable = async (url, setter) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${url} → ${res.status}`);
        setter(await res.json());
      } catch (err) {
        console.error('[GlobalContext] fetch error:', err.message);
      }
    };

    const fetchAllAnswers = async () => {
      try {
        const PAGE_SIZE = 100;
        let allData = [];
        let page = 1;
        let total = null;

        do {
          const res = await fetch(
            `/api/answer?page=${page}&pageSize=${PAGE_SIZE}`
          );
          if (!res.ok) throw new Error(`/api/answer → ${res.status}`);
          const json = await res.json();
          allData = allData.concat(json.data);
          total = json.total;
          page++;
        } while (allData.length < total);

        setDbAnswer(allData);
      } catch (err) {
        console.error('[GlobalContext] fetch answers error:', err.message);
      }
    };

    fetchTable('/api/home', setDbHome);
    fetchTable('/api/category', setDbCategory);
    fetchTable('/api/tense', setDbTense);
    fetchTable('/api/question', setDbQuestion);
    fetchTable('/api/record', setDbRecord);

    fetchAllAnswers();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        darkMode,
        setDarkMode,
        mobileDevice,
        setMobileDevice,
        dbHome,
        setDbHome,

        selectedPage,
        setSelectedPage,

        dbCategory,
        setDbCategory,
        dbTense,
        setDbTense,
        dbQuestion,
        setDbQuestion,
        dbAnswer,
        setDbAnswer,
        dbRecord,
        setDbRecord,
        dbResult,
        setDbResult,

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
        filterQuestion,
        setFilterQuestion,

        selectedRecord,
        setSelectedRecord,
        selectedResult,
        setSelectedResult,

        pronunciationLabel,
        setPronunciationLabel,
        errorLabel,
        setErrorLabel,
        scoreLabel,
        setScoreLabel,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
