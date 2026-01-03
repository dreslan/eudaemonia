import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Moon, Sun, LogIn } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PublicLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dcc-dark text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <nav className="bg-white dark:bg-dcc-card shadow-md border-b dark:border-dcc-system/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="font-black text-xl text-orange-600 dark:text-dcc-system tracking-wider uppercase">
                    QuestVault <span className="text-xs align-top opacity-70">PUB</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-dcc-system hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <Link 
                    to="/login"
                    className="p-2 rounded-full text-gray-500 dark:text-dcc-system hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none flex items-center gap-2"
                    title="Login"
                >
                    <span className="text-sm font-medium hidden sm:block">Login</span>
                    <LogIn className="w-5 h-5" />
                </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
