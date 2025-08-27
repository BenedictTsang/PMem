import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { SupabaseProvider, useSupabase } from './context/SupabaseContext';
import SourceInspector from './components/SourceInspector/SourceInspector';
import AuthForm from './components/Auth/AuthForm';
import AuthStatus from './components/Auth/AuthStatus';
import Navigation from './components/Navigation/Navigation';
import TextInput from './components/TextInput/TextInput';
import WordSelection from './components/WordSelection/WordSelection';
import MemorizationView from './components/MemorizationView/MemorizationView';
import SavedContent from './components/SavedContent/SavedContent';
import AdminPanel from './components/AdminPanel/AdminPanel';
import { Word, MemorizationState } from './types';

type AppState = 
  | { page: 'new'; step: 'input'; text?: string }
  | { page: 'new'; step: 'selection'; text: string; words?: Word[] }
  | { page: 'new'; step: 'memorization'; words: Word[]; selectedIndices: number[]; text: string }
  | { page: 'saved' }
  | { page: 'admin' }
  | { page: 'practice'; memorizationState: MemorizationState };

function AppContent() {
  const { session, loading, userRole } = useSupabase();
  const [appState, setAppState] = useState<AppState>({ page: 'new', step: 'input' });

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  const handlePageChange = (page: 'new' | 'saved' | 'admin') => {
    if (page === 'new') {
      setAppState({ page: 'new', step: 'input' });
    } else if (page === 'saved') {
      setAppState({ page: 'saved' });
    } else if (page === 'admin') {
      setAppState({ page: 'admin' });
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
      case 'admin':
        return <AdminPanel />;
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

  const getCurrentPage = (): 'new' | 'saved' | 'admin' => {
    if (appState.page === 'practice') {
      return 'saved';
    }
    return appState.page;
  };

  return (
    <>
      <AuthStatus />
      <Navigation 
        currentPage={getCurrentPage()} 
        onPageChange={handlePageChange}
        userRole={userRole}
      />
      {renderCurrentView()}
    </>
  );
}

function App() {
  return (
    <SupabaseProvider>
      <AppProvider>
        <SourceInspector />
        <AppContent />
      </AppProvider>
    </SupabaseProvider>
  );
}

export default App;