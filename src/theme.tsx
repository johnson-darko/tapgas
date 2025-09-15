
import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';
import type { Theme } from './ThemeContext';



export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('theme') as Theme) || 'light'
  );

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      return next;
    });
  };

  React.useEffect(() => {
    document.body.style.background = theme === 'dark'
      ? 'linear-gradient(180deg, #18181b 80%, #22223b 100%)'
      : 'linear-gradient(180deg, #f8fafc 80%, #38bdf8 100%)';
    document.body.style.color = theme === 'dark' ? '#f8fafc' : '#22223b';
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
