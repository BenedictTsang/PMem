import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import SourceInspector from './components/SourceInspector/SourceInspector';
import Navigation from './components/Navigation/Navigation';
import TextInput from './components/TextInput/TextInput';
import WordSelection from './components/WordSelection/WordSelection';
import MemorizationView from './components/MemorizationView/MemorizationView';
import SavedContent from './components/SavedContent/SavedContent';
import { Word, MemorizationState } from './types';

type AppState = 
  | { page: 'new'; step: 'input'; text?: string }
  | { page: 'new'; step: 'selection'; text: string; words?: Word[] }
  | { page: 'new'; step: 'memorization'; words: Word[]; selectedIndices: number[]; text: string }
  | { page: 'saved' }
  | { page: 'practice'; memorizationState: MemorizationState };

function AppContent() {
  const [appState, setAppState] = useState<AppState>({ page: 'new', step: 'input' });

  const handlePageChange = (page: 'new' | 'saved') => {
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
    }
  };

  const getCurrentPage = (): 'new' | 'saved' => {
    if (appState.page === 'practice') {
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