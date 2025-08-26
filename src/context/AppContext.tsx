import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, SavedContent, MemorizationState } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

const MAX_SAVED_CONTENTS = 30;
const STORAGE_KEY = 'paragraph-memorization-data';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedContents, setSavedContents] = useState<SavedContent[]>([]);
  const [currentContent, setCurrentContent] = useState<MemorizationState | null>(null);

  // Load saved contents from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedContents(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        })));
      } catch (error) {
        console.error('Failed to load saved contents:', error);
      }
    }
  }, []);

  // Save to localStorage whenever savedContents changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedContents));
  }, [savedContents]);

  const addSavedContent = (content: Omit<SavedContent, 'id' | 'createdAt'>): boolean => {
    if (savedContents.length >= MAX_SAVED_CONTENTS) {
      return false;
    }

    const newContent: SavedContent = {
      ...content,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    setSavedContents(prev => [newContent, ...prev]);
    return true;
  };

  const deleteSavedContent = (id: string) => {
    setSavedContents(prev => prev.filter(content => content.id !== id));
  };

  const value: AppContextType = {
    savedContents,
    addSavedContent,
    deleteSavedContent,
    currentContent,
    setCurrentContent,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};