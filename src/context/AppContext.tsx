import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, SavedContent, MemorizationState } from '../types';
import { supabase } from '../lib/supabase';
import { processText } from '../utils/textProcessor';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedContents, setSavedContents] = useState<SavedContent[]>([]);
  const [currentContent, setCurrentContent] = useState<MemorizationState | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved contents from Supabase on mount
  useEffect(() => {
    const fetchSavedContents = async () => {
      try {
        const { data, error } = await supabase
          .from('saved_contents')
          .select('id, title, originalText, selectedWordIndices, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching saved contents:', error);
        } else {
          const formattedData = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            originalText: item.originalText,
            selectedWordIndices: item.selectedWordIndices,
            createdAt: new Date(item.created_at),
            isPublished: false,
            publicId: null,
          }));
          setSavedContents(formattedData);
        }
      } catch (error) {
        console.error('Failed to fetch saved contents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedContents();
  }, []);

  const addSavedContent = async (content: Omit<SavedContent, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('saved_contents')
        .insert([{
          title: content.title,
          originalText: content.originalText,
          selectedWordIndices: content.selectedWordIndices,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding saved content:', error);
        return false;
      }

      const newContent: SavedContent = {
        id: data.id,
        title: data.title,
        originalText: data.originalText,
        selectedWordIndices: data.selectedWordIndices,
        createdAt: new Date(data.created_at),
        isPublished: false,
        publicId: null,
      };

      setSavedContents(prev => [newContent, ...prev]);
      return true;
    } catch (error) {
      console.error('Failed to add saved content:', error);
      return false;
    }
  };

  const deleteSavedContent = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('saved_contents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting saved content:', error);
        return;
      }

      setSavedContents(prev => prev.filter(content => content.id !== id));
    } catch (error) {
      console.error('Failed to delete saved content:', error);
    }
  };

  const publishSavedContent = async (id: string): Promise<string | null> => {
    try {
      // TODO: Implement after adding is_published and public_id columns to database
      console.warn('Publishing feature requires database schema update');
      return null;
    } catch (error) {
      console.error('Failed to publish content:', error);
      return null;
    }
  };

  const fetchPublicContent = async (publicId: string): Promise<MemorizationState | null> => {
    try {
      // TODO: Implement after adding is_published and public_id columns to database
      console.warn('Public content feature requires database schema update');
      return null;
    } catch (error) {
      console.error('Failed to fetch public content:', error);
      return null;
    }
  };

  const value: AppContextType = {
    savedContents,
    addSavedContent,
    deleteSavedContent,
    publishSavedContent,
    fetchPublicContent,
    currentContent,
    setCurrentContent,
    loading,
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