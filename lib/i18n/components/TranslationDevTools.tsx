/**
 * Development tools component for translation debugging
 * Only renders in development mode
 */

'use client';

import { useState, useEffect } from 'react';
import { getDevStats, generateTranslationReport, clearDevData } from '../utils/dev-tools';
import { getCacheStats } from '../utils/cache';
import { getLocaleModuleCacheStats } from '../utils/lazy-loader';

interface TranslationDevToolsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  minimized?: boolean;
}

export function TranslationDevTools({ 
  position = 'bottom-right', 
  minimized = true 
}: TranslationDevToolsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(minimized);
  const [stats, setStats] = useState(getDevStats());
  const [cacheStats, setCacheStats] = useState(getCacheStats());
  const [localeStats, setLocaleStats] = useState(getLocaleModuleCacheStats());

  // Only show in development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  // Update stats periodically
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setStats(getDevStats());
      setCacheStats(getCacheStats());
      setLocaleStats(getLocaleModuleCacheStats());
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const handleGenerateReport = () => {
    const report = generateTranslationReport();
    console.log(report);
    alert('Translation report generated in console');
  };

  const handleClearData = () => {
    clearDevData();
    setStats(getDevStats());
    alert('Development data cleared');
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 bg-gray-900 text-white text-xs rounded-lg shadow-lg border border-gray-700 font-mono`}
      style={{ maxWidth: '300px' }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-2 bg-gray-800 rounded-t-lg cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <span className="font-semibold">🌐 i18n Dev Tools</span>
        <span className="text-gray-400">
          {isMinimized ? '▼' : '▲'}
        </span>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-3 space-y-3">
          {/* Translation Stats */}
          <div>
            <div className="font-semibold text-blue-300 mb-1">Translation Stats</div>
            <div className="space-y-1 text-gray-300">
              <div>Used: {stats.usedTranslationsCount}</div>
              <div className="text-red-300">Missing: {stats.missingTranslationsCount}</div>
            </div>
          </div>

          {/* Cache Stats */}
          <div>
            <div className="font-semibold text-green-300 mb-1">Cache Stats</div>
            <div className="space-y-1 text-gray-300">
              <div>Size: {cacheStats.size}/{cacheStats.maxSize}</div>
              <div>Hit Rate: {cacheStats.hitRate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Locale Stats */}
          <div>
            <div className="font-semibold text-yellow-300 mb-1">Locale Cache</div>
            <div className="space-y-1 text-gray-300">
              <div>Loaded: {localeStats.cacheSize}</div>
              <div>Languages: {localeStats.cachedLanguages.join(', ')}</div>
            </div>
          </div>

          {/* Most Used Translations */}
          {stats.mostUsedTranslations.length > 0 && (
            <div>
              <div className="font-semibold text-purple-300 mb-1">Most Used</div>
              <div className="space-y-1 text-gray-300 max-h-20 overflow-y-auto">
                {stats.mostUsedTranslations.slice(0, 3).map(({ key, count }) => (
                  <div key={key} className="truncate">
                    {key.split(':').pop()}: {count}x
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Missing */}
          {stats.recentMissingTranslations.length > 0 && (
            <div>
              <div className="font-semibold text-red-300 mb-1">Recent Missing</div>
              <div className="space-y-1 text-gray-300 max-h-20 overflow-y-auto">
                {stats.recentMissingTranslations.slice(-3).map((key, index) => (
                  <div key={index} className="truncate text-red-200">
                    {key.split(':').slice(1).join(':')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-700">
            <button
              onClick={handleGenerateReport}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              Report
            </button>
            <button
              onClick={handleClearData}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}