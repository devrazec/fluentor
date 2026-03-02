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

  const [selectedPage, setSelectedPage] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedTense, setSelectedTense] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState([]);

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

    fetchTable('/api/home', setDbHome);
    fetchTable('/api/category', setDbCategory);
    fetchTable('/api/tense', setDbTense);
    fetchTable('/api/question', setDbQuestion);
    // answers are paginated — fetched on demand in the Answer page
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
        selectedCategory,
        setSelectedCategory,
        selectedTense,
        setSelectedTense,
        selectedQuestion,
        setSelectedQuestion,
        selectedAnswer,
        setSelectedAnswer,
      }}  
    >
      {children}
    </GlobalContext.Provider>
  );
}
