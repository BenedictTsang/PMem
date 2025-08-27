import React from 'react';
import { Home, BookOpen, Shield } from 'lucide-react';

interface NavigationProps {
  currentPage: 'new' | 'saved' | 'admin';
  onPageChange: (page: 'new' | 'saved' | 'admin') => void;
  userRole: string | null;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange, userRole }) => {
  return (
    <nav 
      className="fixed top-0 left-0 right-0 bg-white border-b-2 border-gray-200 z-50 shadow-sm" 
      style={{ fontFamily: 'Times New Roman, serif' }}
      data-source-tsx="Navigation|src/components/Navigation/Navigation.tsx"
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-8 py-4">
          <button
            onClick={() => onPageChange('new')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              currentPage === 'new'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            data-source-tsx="Navigation New Button|src/components/Navigation/Navigation.tsx"
          >
            <Home size={20} />
            <span>New</span>
          </button>
          
          <button
            onClick={() => onPageChange('saved')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              currentPage === 'saved'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            data-source-tsx="Navigation Saved Button|src/components/Navigation/Navigation.tsx"
          >
            <BookOpen size={20} />
            <span>Saved</span>
          </button>
          
          {userRole === 'admin' && (
            <button
              onClick={() => onPageChange('admin')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'admin'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              data-source-tsx="Navigation Admin Button|src/components/Navigation/Navigation.tsx"
            >
              <Shield size={20} />
              <span>Admin Panel</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;