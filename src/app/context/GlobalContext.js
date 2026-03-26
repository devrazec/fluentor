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
  const [dbVocabulary, setDbVocabulary] = useState([]);
  const [dbCatVocab, setDbCatVocab] = useState([]);
  const [dbSubCatVocab, setDbSubCatVocab] = useState([]);

  const [selectedPage, setSelectedPage] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedTense, setSelectedTense] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState([]); // id of the selected answer
  const [currentAnswer, setCurrentAnswer] = useState([]); // answers of the selected question

  const [filterCategory, setFilterCategory] = useState([]);
  const [filterTense, setFilterTense] = useState([]);
  const [filterQuestion, setFilterQuestion] = useState([]);

  const [testResult, setTestResult] = useState([
    {
      reference_text: '',
      recognized_text: '',
      pronunciation: 0,
      accuracy: 0,
      fluency: 0,
      completeness: 0,
      prosody: 0,
      mispronunciation: 0,
      omission: 0,
      insertion: 0,
      unexpected_break: 0,
      missing_break: 0,
      monotone: 0,
      words: [],
    },
  ]);

  const [scriptedWord, setScriptedWord] = useState(true);

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
    fetchTable('/api/vocabulary', setDbVocabulary);
    fetchTable('/api/catvocab', setDbCatVocab);
    fetchTable('/api/subcatvocab', setDbSubCatVocab);
    //fetchTable('/api/record', setDbRecord);

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
        dbVocabulary,
        setDbVocabulary,
        dbCatVocab,
        setDbCatVocab,
        dbSubCatVocab,
        setDbSubCatVocab,

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

        testResult,
        setTestResult,

        scriptedWord,
        setScriptedWord,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
