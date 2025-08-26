import React, { useState } from 'react';
import { Trash2, Play, Calendar } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { SavedContent as SavedContentType, MemorizationState } from '../../types';
import { processText } from '../../utils/textProcessor';

interface SavedContentProps {
  onLoadContent: (content: MemorizationState) => void;
}

const SavedContent: React.FC<SavedContentProps> = ({ onLoadContent }) => {
  const { savedContents, deleteSavedContent } = useAppContext();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteSavedContent(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleLoad = (savedContent: SavedContentType) => {
    const words = processText(savedContent.originalText);
    // Mark selected words
    const wordsWithSelection = words.map(word => ({
      ...word,
      isMemorized: savedContent.selectedWordIndices.includes(word.index)
    }));

    const memorizationState: MemorizationState = {
      originalText: savedContent.originalText,
      words: wordsWithSelection,
      selectedWordIndices: savedContent.selectedWordIndices,
      hiddenWords: new Set(savedContent.selectedWordIndices),
    };

    onLoadContent(memorizationState);
  };

  return (
    <div 
      className="pt-20 min-h-screen bg-gray-50" 
      style={{ fontFamily: 'Times New Roman, serif' }}
      data-source-tsx="SavedContent|src/components/SavedContent/SavedContent.tsx"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 
            className="text-3xl font-bold text-gray-800 mb-6 text-center"
            data-source-tsx="SavedContent Title|src/components/SavedContent/SavedContent.tsx"
          >
            Saved Contents ({savedContents.length}/30)
          </h1>
          
          {savedContents.length === 0 ? (
            <div 
              className="text-center text-gray-500 py-12"
              data-source-tsx="SavedContent Empty Message Container|src/components/SavedContent/SavedContent.tsx"
            >
              <p 
                className="text-xl"
                data-source-tsx="SavedContent Empty Message Text|src/components/SavedContent/SavedContent.tsx"
              >
                No saved contents yet.
              </p>
              <p 
                className="text-lg mt-2"
                data-source-tsx="SavedContent Empty Message Text|src/components/SavedContent/SavedContent.tsx"
              >
                Create your first memorization exercise!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedContents.map(content => (
                <div
                  key={content.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  data-source-tsx="SavedContent Item Container|src/components/SavedContent/SavedContent.tsx"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-lg font-semibold text-gray-800 mb-2 truncate"
                        data-source-tsx="SavedContent Item Title|src/components/SavedContent/SavedContent.tsx"
                      >
                        {content.title}
                      </h3>
                      <p 
                        className="text-gray-600 text-sm mb-3 line-clamp-2"
                        data-source-tsx="SavedContent Item Original Text|src/components/SavedContent/SavedContent.tsx"
                      >
                        {content.originalText}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span 
                          className="flex items-center space-x-1"
                          data-source-tsx="SavedContent Item Date|src/components/SavedContent/SavedContent.tsx"
                        >
                          <Calendar size={16} />
                          <span>{content.createdAt.toLocaleDateString()}</span>
                        </span>
                        <span data-source-tsx="SavedContent Item Word Count|src/components/SavedContent/SavedContent.tsx">
                          {content.selectedWordIndices.length} words selected
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleLoad(content)}
                        className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        data-source-tsx="SavedContent Practice Button|src/components/SavedContent/SavedContent.tsx"
                      >
                        <Play size={16} />
                        <span>Practice</span>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(content.id)}
                        className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                          deleteConfirm === content.id
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        data-source-tsx="SavedContent Delete Button|src/components/SavedContent/SavedContent.tsx"
                      >
                        <Trash2 size={16} />
                        <span>{deleteConfirm === content.id ? 'Confirm?' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedContent;