import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Word } from '../../types';
import { processText, getSelectedWordIndices } from '../../utils/textProcessor';

const selectablePunctuations = new Set<string>();

interface WordSelectionProps {
  text: string;
  initialWords?: Word[];
  onNext: (words: Word[], selectedIndices: number[]) => void;
  onBack: () => void;
}

const WordSelection: React.FC<WordSelectionProps> = ({ text, initialWords, onNext, onBack }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [highlightGroups, setHighlightGroups] = useState<number[][]>([]);
  const [historyStack, setHistoryStack] = useState<{ words: Word[]; groups: number[][] }[]>([]);
  const [isHighlightModeActive, setIsHighlightModeActive] = useState(false);

  // Highlight mode drag states
  const [isHighlightDragging, setIsHighlightDragging] = useState(false);
  const [highlightDragStartIndex, setHighlightDragStartIndex] = useState<number | null>(null);
  const [tempHighlightedIndices, setTempHighlightedIndices] = useState<Set<number>>(new Set());

  // Selection mode drag states
  const [isSelectionDragging, setIsSelectionDragging] = useState(false);
  const [selectionDragStartIndex, setSelectionDragStartIndex] = useState<number | null>(null);
  const [tempSelectionIndices, setTempSelectionIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (initialWords) {
      // Use the provided words with their existing selection and highlight states
      setWords(initialWords);

      // Reconstruct highlight groups from the words
      const groups: number[][] = [];
      const groupMap = new Map<number, number[]>();

      initialWords.forEach(word => {
        if (word.highlightGroup !== undefined) {
          if (!groupMap.has(word.highlightGroup)) {
            groupMap.set(word.highlightGroup, []);
          }
          groupMap.get(word.highlightGroup)!.push(word.index);
        }
      });

      // Convert map to array, ensuring proper order
      for (let i = 0; i < groupMap.size; i++) {
        if (groupMap.has(i)) {
          groups.push(groupMap.get(i)!);
        }
      }

      setHighlightGroups(groups);
      setHistoryStack([]);
    } else {
      // Fresh start - process the text
      const processed = processText(text);
      setWords(processed);
      setHistoryStack([]);
      setHighlightGroups([]);
    }
  }, [text, initialWords]);

  const pushHistory = (currentWords: Word[], currentGroups: number[][]) => {
    setHistoryStack(prev => [
      ...prev,
      {
        words: currentWords.map(word => ({ ...word })),
        groups: currentGroups.map(group => [...group]),
      },
    ]);
  };

const handleWordClick = (index: number) => {
  if (isHighlightModeActive) return;

  pushHistory(words, highlightGroups);

  setWords(prevWords => {
    const updatedWords = prevWords.map(word =>
      word.index === index ? { ...word, isMemorized: !word.isMemorized } : word
    );
    return updatedWords;
  });
};

  // Highlight mode drag handlers
  const handleHighlightMouseDown = (index: number) => {
    if (!isHighlightModeActive || words[index]?.isPunctuation) return;
    pushHistory(words, highlightGroups);
    setIsHighlightDragging(true);
    setHighlightDragStartIndex(index);
    setTempHighlightedIndices(new Set([index]));
  };

  const handleHighlightMouseEnter = (index: number) => {
    if (!isHighlightModeActive || !isHighlightDragging || highlightDragStartIndex === null || words[index]?.isPunctuation) return;
    const start = Math.min(highlightDragStartIndex, index);
    const end = Math.max(highlightDragStartIndex, index);
    const rangeIndices = new Set<number>();
    for (let i = start; i <= end; i++) {
      if (!words[i]?.isPunctuation) {
        rangeIndices.add(i);
      }
    }
    setTempHighlightedIndices(rangeIndices);
  };

  const handleHighlightMouseUp = () => {
    if (!isHighlightModeActive || !isHighlightDragging || tempHighlightedIndices.size === 0) {
      setIsHighlightDragging(false);
      setHighlightDragStartIndex(null);
      setTempHighlightedIndices(new Set());
      return;
    }

    const newGroupIndices = Array.from(tempHighlightedIndices);
    const isOverlap = highlightGroups.some(existingGroup =>
      existingGroup.some(index => tempHighlightedIndices.has(index))
    );

    if (isOverlap) {
      alert('This selection overlaps with an existing highlight group.');
    } else {
      setHighlightGroups(prev => {
        const newGroups = [...prev, newGroupIndices];

        setWords(prevWords =>
          prevWords.map(word =>
            newGroupIndices.includes(word.index)
              ? { ...word, highlightGroup: newGroups.length - 1 }
              : word
          )
        );

        return newGroups;
      });
    }

    setIsHighlightDragging(false);
    setHighlightDragStartIndex(null);
    setTempHighlightedIndices(new Set());
  };

  // Selection mode drag handlers
  const handleSelectionMouseDown = (index: number) => {
    if (isHighlightModeActive || words[index]?.isPunctuation) return;
    setIsSelectionDragging(true);
    setSelectionDragStartIndex(index);
    setTempSelectionIndices(new Set([index]));
  };

  const handleSelectionMouseEnter = (index: number) => {
    if (isHighlightModeActive || !isSelectionDragging || selectionDragStartIndex === null) return;
    const start = Math.min(selectionDragStartIndex, index);
    const end = Math.max(selectionDragStartIndex, index);
    const rangeIndices = new Set<number>();
    for (let i = start; i <= end; i++) {
      if (!words[i]?.isPunctuation) {
        rangeIndices.add(i);
      }
    }
    setTempSelectionIndices(rangeIndices);
  };

const handleSelectionMouseUp = () => {
  if (isHighlightModeActive || !isSelectionDragging || tempSelectionIndices.size === 0) {
    setIsSelectionDragging(false);
    setSelectionDragStartIndex(null);
    setTempSelectionIndices(new Set());
    return;
  }

  // Check if this was a single click (not a drag selection)
  const isSingleClick = tempSelectionIndices.size === 1 && 
                       selectionDragStartIndex !== null && 
                       tempSelectionIndices.has(selectionDragStartIndex);

  // Only process as drag selection if it's not a single click
  if (!isSingleClick) {
    pushHistory(words, highlightGroups);

    setWords(prevWords => {
      const updatedWords = prevWords.map(word =>
        tempSelectionIndices.has(word.index) ? { ...word, isMemorized: true } : word
      );
      return updatedWords;
    });
  }
  console.log('handleSelectionMouseUp called. Temp selection indices:', Array.from(tempSelectionIndices));
  console.log('History stack length before push:', historyStack.length);

  pushHistory(words, highlightGroups);
  // Clean up drag state immediately (no setTimeout)
  setIsSelectionDragging(false);
  setSelectionDragStartIndex(null);
  setTempSelectionIndices(new Set());

  console.log('History stack length after push:', historyStack.length);
};

const handleSelectAll = () => {
  console.log('handleSelectAll called. Current words:', words);
  console.log('History stack length before push:', historyStack.length);

  pushHistory(words, highlightGroups);

  setWords(prevWords => {
    const notSelectedIndices = prevWords.filter(word => !word.isPunctuation && !word.isMemorized).map(word => word.index);

    console.log('Word indices to be selected:', notSelectedIndices);
    if (notSelectedIndices.length === 0) return prevWords;

    const updatedWords = prevWords.map(word =>
      notSelectedIndices.includes(word.index) ? { ...word, isMemorized: true } : word
    );

    console.log('Words after select all:', updatedWords);
    return updatedWords;
  });

  console.log('History stack length after push:', historyStack.length);
};

const handleUndo = () => {
  setHistoryStack(prev => {
    console.log('Undo called. History stack size before:', prev.length);

    if (prev.length === 0) return prev;

    const newStack = [...prev];
    const prevState = newStack.pop();

    if (prevState) {
      console.log('Restoring words state from history:', prevState.words);
      setWords(prevState.words);
      setHighlightGroups(prevState.groups);
    }

    console.log('History stack size after:', newStack.length);
    return newStack;
  });
};

  const handleNext = () => {
    const selectedIndices = getSelectedWordIndices(words);
    if (selectedIndices.length > 0) {
      onNext(words, selectedIndices);
    }
  };

  const selectedCount = words.filter(word => word.isMemorized).length;

  return (
    <div className="pt-20 min-h-screen bg-gray-50" style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Words to Memorize</h1>
            <p className="text-gray-600 mb-4">
              {isHighlightModeActive
                ? 'Click and drag to highlight multiple words.'
                : 'Click and drag to select multiple words to memorize.'}
              <br />
              Selected: {selectedCount} words &nbsp;|&nbsp; Highlighted groups: {highlightGroups.length}
            </p>

            <div className="flex justify-end items-center space-x-4">
              <button
                onClick={() => setIsHighlightModeActive(!isHighlightModeActive)}
                className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                  isHighlightModeActive
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {isHighlightModeActive ? 'Disable Highlight' : 'Enable Highlight'}
              </button>
              <button
                onClick={handleUndo}
                disabled={historyStack.length === 0}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
              >
                Undo
              </button>
              <button
                onClick={handleSelectAll}
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Select All Words
              </button>
            </div>
          </div>

          <div
            className="bg-gray-50 p-6 rounded-lg mb-6 min-h-64"
            onMouseUp={() => {
              if (isHighlightModeActive) handleHighlightMouseUp();
              else handleSelectionMouseUp();
            }}
          >
            <div className="text-xl leading-relaxed">
              {words.map((word) =>
                word.isParagraphBreak ? (
                  // Render paragraph breaks as vertical spacing divs
                  <div key={`para-break-${word.index}`} className="mb-6" /> // You may increase margin if desired
                ) : word.isPunctuation && !selectablePunctuations.has(word.text) ? (
                  // Render punctuation normally
                  <span key={word.index} className="text-gray-800">
                    {word.text}
                  </span>
                ) : (
                  // Render selectable words as buttons
                  <button
                    key={word.index}
                    onClick={() => !isHighlightModeActive && handleWordClick(word.index)}
                    onMouseDown={() =>
                      isHighlightModeActive
                        ? handleHighlightMouseDown(word.index)
                        : handleSelectionMouseDown(word.index)
                    }
                    onMouseEnter={() =>
                      isHighlightModeActive
                        ? handleHighlightMouseEnter(word.index)
                        : handleSelectionMouseEnter(word.index)
                    }
                    className={(() => {
                      let baseClasses = 'inline-block px-1 py-1 rounded transition-colors select-none';
                      
                      if (isHighlightModeActive) {
                        if (tempHighlightedIndices.has(word.index)) {
                          return `${baseClasses} bg-red-100 text-gray-800`;
                        } else if (word.isMemorized && word.highlightGroup !== undefined) {
                          return `${baseClasses} bg-purple-300 text-gray-800`;
                        } else if (word.highlightGroup !== undefined) {
                          return `${baseClasses} bg-red-300 text-gray-800`;
                        } else if (word.isMemorized) {
                          return `${baseClasses} bg-green-300 text-gray-800`;
                        } else {
                          return `${baseClasses} cursor-pointer hover:bg-red-100 text-gray-800`;
                        }
                      } else {
                        if (tempSelectionIndices.has(word.index)) {
                          return `${baseClasses} bg-green-100 text-gray-800`;
                        } else if (word.isMemorized && word.highlightGroup !== undefined) {
                          return `${baseClasses} bg-purple-300 text-gray-800`;
                        } else if (word.highlightGroup !== undefined) {
                          return `${baseClasses} bg-red-300 text-gray-800`;
                        } else if (word.isMemorized) {
                          return `${baseClasses} bg-green-300 text-gray-800`;
                        } else {
                          return `${baseClasses} cursor-pointer hover:bg-green-100 text-gray-800`;
                        }
                      }
                    })()}
                                      >
                                        {word.text}
                                      </button>
                )
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-8 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={selectedCount === 0}
              className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordSelection;