'use client';

import { createContext, useState } from 'react';

export const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileDevice, setMobileDevice] = useState(false);

  return (
    <GlobalContext.Provider
      value={{
        darkMode,
        setDarkMode,
        mobileDevice,
        setMobileDevice,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
