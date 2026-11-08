import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  dark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightTheme: Theme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#ffffff',
    surface: '#f7fafc',
    text: '#1a202c',
    textSecondary: '#718096',
    border: '#e2e8f0',
    error: '#f56565',
    success: '#48bb78',
    warning: '#ed8936',
  },
  dark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#1a202c',
    surface: '#2d3748',
    text: '#f7fafc',
    textSecondary: '#cbd5e0',
    border: '#4a5568',
    error: '#fc8181',
    success: '#68d391',
    warning: '#f6ad55',
  },
  dark: true,
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
