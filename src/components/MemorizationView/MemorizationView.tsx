import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Word } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { getWordWidth } from '../../utils/textProcessor';

interface MemorizationViewProps {
  words: Word[];
  selectedIndices: number[];
  originalText: string;
  onBack: () => void;
  onSave: () => void;
}

const MemorizationView: React.FC<MemorizationViewProps> = ({ 
  words, selectedIndices, originalText, onBack, onSave 
}) => {
  const [hiddenWords, setHiddenWords] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const { addSavedContent, savedContents } = useAppContext();

  // 顯示所有選中詞
  const revealAllWords = () => {
    setHiddenWords(new Set());
  };

  // 遮蔽所有選中詞
  const coverAllWords = () => {
    setHiddenWords(new Set(selectedIndices));
  };

  // 切換指定詞的顯示/隱藏狀態
  const toggleWordVisibility = (index: number) => {
    setHiddenWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // 儲存目前內容
  const handleSave = async () => {
    setIsSaving(true);
    const title = originalText.substring(0, 50) + (originalText.length > 50 ? '...' : '');
    
    const success = await addSavedContent({
      title,
      originalText,
      selectedWordIndices: selectedIndices,
    });

    if (success) {
      alert('Content saved successfully!');
      onSave();
    } else {
      alert('Failed to save content. Storage limit reached.');
    }
    setIsSaving(false);
  };

  return (
    <div 
      className="pt-20 min-h-screen bg-gray-50" 
      style={{ fontFamily: 'Times New Roman, serif' }}
      data-source-tsx="MemorizationView|src/components/MemorizationView/MemorizationView.tsx"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 
            className="text-3xl font-bold text-gray-800 mb-6 text-center"
            data-source-tsx="MemorizationView Title|src/components/MemorizationView/MemorizationView.tsx"
          >
            Practice Memorization
          </h1>

          {/* 新增 Reveal / Cover 全部按鈕 */}
          <div className="flex justify-end space-x-4 mb-6">
            <button 
              onClick={revealAllWords}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Reveal all Words
            </button>
            <button 
              onClick={coverAllWords}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Cover all Words
            </button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6 min-h-64">
            <div 
              className="text-xl leading-relaxed"
              data-source-tsx="MemorizationView Text Display|src/components/MemorizationView/MemorizationView.tsx"
            >
              {words.map((word, idx) => {
                const isMemorized = selectedIndices.includes(word.index);
                const isHidden = hiddenWords.has(word.index);
                
                if (word.isParagraphBreak) {
                  return <div key={`para-break-${word.index}`} className="mb-4" />;
                }
                
                if (word.text === '\n' || word.text === '\r\n') {
                  return <br key={word.index} />;
                }
                
                if (isMemorized) {
                  return isHidden ? (
                    <button
                      key={idx}
                      onClick={() => toggleWordVisibility(word.index)}
                      className="inline-block bg-gray-400 hover:bg-gray-500 rounded transition-colors"
                      style={{
                        width: getWordWidth(word.text),
                        height: '1.5rem'
                      }}
                      data-source-tsx="MemorizationView Word Rectangle|src/components/MemorizationView/MemorizationView.tsx"
                    />
                  ) : (
                    <button
                      key={idx}
                      onClick={() => toggleWordVisibility(word.index)}
                      className="inline-block px-1 py-1 bg-green-100 text-gray-800 hover:bg-green-200 rounded transition-colors"
                      data-source-tsx="MemorizationView Word Button|src/components/MemorizationView/MemorizationView.tsx"
                    >
                      {word.text}
                    </button>
                  );
                } else {
                  return (
                    <span 
                      key={idx}
                      className="text-gray-800"
                      data-source-tsx="MemorizationView Word Text|src/components/MemorizationView/MemorizationView.tsx"
                    >
                      {word.text}
                    </span>
                  );
                }
              })}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-8 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              data-source-tsx="MemorizationView Back Button|src/components/MemorizationView/MemorizationView.tsx"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              data-source-tsx="MemorizationView Save Button|src/components/MemorizationView/MemorizationView.tsx"
            >
              <Save size={20} />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
          
          <div 
            className="mt-4 text-sm text-gray-600 text-center"
            data-source-tsx="MemorizationView Instructions Container|src/components/MemorizationView/MemorizationView.tsx"
          >
            <p data-source-tsx="MemorizationView Instructions Text|src/components/MemorizationView/MemorizationView.tsx">
              Click rectangles to reveal words • Click revealed words to hide them again
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemorizationView;