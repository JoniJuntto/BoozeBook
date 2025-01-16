import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

type ThemeContextType = {
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({ isDark: false });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
        document.body.classList.toggle('dark-mode', e.matches);
      };

      // Set initial state
      setIsDark(darkModeMediaQuery.matches);
      document.body.classList.toggle('dark-mode', darkModeMediaQuery.matches);

      if (darkModeMediaQuery.addEventListener) {
        darkModeMediaQuery.addEventListener('change', handleChange);
        return () => darkModeMediaQuery.removeEventListener('change', handleChange);
      } else {
        darkModeMediaQuery.addListener(handleChange);
        return () => darkModeMediaQuery.removeListener(handleChange);
      }
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);