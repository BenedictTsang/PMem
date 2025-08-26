export interface SavedContent {
  id: string;
  title: string;
  originalText: string;
  selectedWordIndices: number[];
  createdAt: Date;
}

export interface Word {
  text: string;
  index: number;
  isMemorized: boolean;
  isPunctuation: boolean;
  highlightGroup?: number;
  isParagraphBreak?: boolean;
}

export interface MemorizationState {
  originalText: string;
  words: Word[];
  selectedWordIndices: number[];
  hiddenWords: Set<number>;
}

export interface AppContextType {
  savedContents: SavedContent[];
  addSavedContent: (content: Omit<SavedContent, 'id' | 'createdAt'>) => boolean;
  deleteSavedContent: (id: string) => void;
  currentContent: MemorizationState | null;
  setCurrentContent: (content: MemorizationState | null) => void;
}