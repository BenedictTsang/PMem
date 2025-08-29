import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './context/AppContext';
import Navigation from './components/Navigation/Navigation';
import TextInput from './components/TextInput/TextInput';
import WordSelection from './components/WordSelection/WordSelection';
import MemorizationView from './components/MemorizationView/MemorizationView';
import SavedContent from './components/SavedContent/SavedContent';
import SourceInspector from './components/SourceInspector/SourceInspector';
import { Word, MemorizationState } from './types';

type AppState = 
  | { page: 'new'; step: 'input'; text?: string }
  | { page: 'new'; step: 'selection'; text: string; words?: Word[] }
  | { page: 'new'; step: 'memorization'; words: Word[]; selectedIndices: number[]; text: string }
  | { page: 'saved' }
  | { page: 'practice'; memorizationState: MemorizationState }
  | { page: 'publicPractice'; memorizationState: MemorizationState };

function AppContent() {
  const [appState, setAppState] = useState<AppState>({ page: 'new', step: 'input' });
  const { fetchPublicContent } = useAppContext();

  // Handle hash-based routing for public links
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash;
      const publicMatch = hash.match(/^#\/public\/(.+)$/);
      
      if (publicMatch) {
        const publicId = publicMatch[1];
        const publicContent = await fetchPublicContent(publicId);
        
        if (publicContent) {
          setAppState({ page: 'publicPractice', memorizationState: publicContent });
        } else {
          // Content not found, redirect to home
          window.location.hash = '';
          setAppState({ page: 'new', step: 'input' });
          alert('The requested practice content was not found or is no longer available.');
        }
      }
    };

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [fetchPublicContent]);

  const handlePageChange = (page: 'new' | 'saved') => {
    // Clear hash when navigating normally
    window.location.hash = '';
    
    if (page === 'new') {
      setAppState({ page: 'new', step: 'input' });
    } else if (page === 'saved') {
      setAppState({ page: 'saved' });
    }
  };

  const handleTextSubmit = (text: string) => {
    setAppState({ page: 'new', step: 'selection', text });
  };

  const handleWordsSelected = (words: Word[], selectedIndices: number[]) => {
    if (appState.page === 'new' && appState.step === 'selection') {
      setAppState({
        page: 'new',
        step: 'memorization',
        words,
        selectedIndices,
        text: appState.text,
      });
    }
  };

  const handleBackToInput = () => {
    if (appState.page === 'new' && appState.step === 'selection') {
      setAppState({ page: 'new', step: 'input', text: appState.text });
    } else {
      setAppState({ page: 'new', step: 'input' });
    }
  };

  const handleBackToSelection = () => {
    if (appState.page === 'new' && appState.step === 'memorization') {
      setAppState({ page: 'new', step: 'selection', text: appState.text, words: appState.words });
    }
  };

  const handleSave = () => {
    setAppState({ page: 'saved' });
  };

  const handleLoadContent = (memorizationState: MemorizationState) => {
    setAppState({ page: 'practice', memorizationState });
  };

  const handleBackFromPractice = () => {
    setAppState({ page: 'saved' });
  };

  const renderCurrentView = () => {
    switch (appState.page) {
      case 'new':
        switch (appState.step) {
          case 'input':
            return <TextInput onNext={handleTextSubmit} initialText={appState.text} />;
          case 'selection':
            return (
              <WordSelection
                text={appState.text}
                initialWords={appState.words}
                onNext={handleWordsSelected}
                onBack={handleBackToInput}
              />
            );
          case 'memorization':
            return (
              <MemorizationView
                words={appState.words}
                selectedIndices={appState.selectedIndices}
                originalText={appState.text}
                onBack={handleBackToSelection}
                onSave={handleSave}
              />
            );
        }
        break;
      case 'saved':
        return <SavedContent onLoadContent={handleLoadContent} />;
      case 'practice':
        return (
          <MemorizationView
            words={appState.memorizationState.words}
            selectedIndices={appState.memorizationState.selectedWordIndices}
            originalText={appState.memorizationState.originalText}
            onBack={handleBackFromPractice}
            onSave={() => {}}
          />
        );
      case 'publicPractice':
        return (
          <MemorizationView
            words={appState.memorizationState.words}
            selectedIndices={appState.memorizationState.selectedWordIndices}
            originalText={appState.memorizationState.originalText}
            onBack={() => {
              window.location.hash = '';
              setAppState({ page: 'new', step: 'input' });
            }}
            onSave={() => {}}
            isPublicView={true}
          />
        );
    }
  };

  const getCurrentPage = (): 'new' | 'saved' => {
    if (appState.page === 'practice' || appState.page === 'publicPractice') {
      return 'saved';
    }
    return appState.page;
  };

  return (
    <>
      <Navigation 
        currentPage={getCurrentPage()} 
        onPageChange={handlePageChange}
        userRole={null}
      />
      {renderCurrentView()}
    </>
  );
}

function App() {
  return (
      <AppProvider>
        <SourceInspector />
        <AppContent />
      </AppProvider>
  );
}

export default App;