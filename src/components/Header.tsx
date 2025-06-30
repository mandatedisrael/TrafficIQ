import React, { useState } from 'react';
import { MapPin, Moon, Sun, Settings, Bell, Zap, User, LogOut } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { Location } from '../types';

interface HeaderProps {
  userLocation: Location | null;
  lastUpdated: Date;
}

export const Header: React.FC<HeaderProps> = ({ userLocation, lastUpdated }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleAuthClick = () => {
    if (user) {
      setShowUserMenu(!showUserMenu);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className="flex items-center space-x-2 min-w-0 group">
                <div className="relative">
                  <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent truncate">
                    TrafficIQ
                  </h1>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span>AI-Powered</span>
                  </div>
                </div>
              </div>
              {userLocation && (
                <div className="hidden md:flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 min-w-0 bg-gray-100/50 dark:bg-gray-800/50 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="truncate" title={userLocation.address || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}>
                    {userLocation.address || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {/* Powered by Bolt.new Logo */}
              <a 
                href="https://bolt.new/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center mr-1 sm:mr-2 opacity-70 hover:opacity-100 transition-opacity duration-200 group"
                title="Built with Bolt.new"
              >
                <img 
                  src="/bolt-powered-by.png" 
                  alt="Powered by Bolt" 
                  className="h-4 w-auto sm:h-5 md:h-6 transition-transform duration-200 group-hover:scale-105"
                />
              </a>

              <div className="hidden lg:flex items-center text-xs text-gray-500 dark:text-gray-400 mr-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                <span className="whitespace-nowrap">Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
              
              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:scale-105 relative group">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
              
              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:scale-105">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 hover:rotate-90 transition-transform duration-300" />
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:scale-105 relative overflow-hidden"
              >
                <div className="relative">
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 hover:rotate-12" />
                  ) : (
                    <Sun className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 hover:rotate-180" />
                  )}
                </div>
              </button>

              <div className="relative">
                <button
                  onClick={handleAuthClick}
                  className="flex items-center space-x-2 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:scale-105"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  {user && (
                    <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.email?.split('@')[0]}
                    </span>
                  )}
                </button>

                {showUserMenu && user && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};