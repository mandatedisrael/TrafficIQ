import React, { useState } from 'react';
import { Filter, Calendar, MapPin, Clock, Download, Share2, RefreshCw } from 'lucide-react';

interface FilterPanelProps {
  onFilterChange?: (filters: any) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange }) => {
  const [timeRange, setTimeRange] = useState('today');
  const [severity, setSeverity] = useState(['all']);
  const [radius, setRadius] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    
    // Trigger filter change to refresh data
    if (onFilterChange) {
      onFilterChange({ timeRange, severity, radius, refresh: Date.now() });
    }
  };

  const exportData = () => {
    // Simulate data export
    const data = {
      timestamp: new Date().toISOString(),
      filters: { timeRange, severity, radius },
      message: 'Traffic prediction data exported successfully'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareData = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Traffic Prediction Data',
          text: 'Check out the current traffic predictions in our area',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
        alert('Failed to copy link. Please try again.');
      }
    }
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    if (onFilterChange) {
      onFilterChange({ timeRange: value, severity, radius });
    }
  };

  const handleSeverityChange = (level: string, checked: boolean) => {
    let newSeverity;
    if (level === 'all') {
      newSeverity = checked ? ['all'] : [];
    } else {
      const filteredSeverity = severity.filter(s => s !== 'all');
      if (checked) {
        newSeverity = [...filteredSeverity, level];
      } else {
        newSeverity = filteredSeverity.filter(s => s !== level);
      }
    }
    setSeverity(newSeverity);
    if (onFilterChange) {
      onFilterChange({ timeRange, severity: newSeverity, radius });
    }
  };

  const handleRadiusChange = (value: number) => {
    setRadius(value);
    if (onFilterChange) {
      onFilterChange({ timeRange, severity, radius: value });
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Filters & Controls
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Time Range */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
            <Calendar className="h-4 w-4" />
            <span>Time Range</span>
          </label>
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          >
            <option value="now">Real-time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
            <MapPin className="h-4 w-4" />
            <span>Traffic Severity</span>
          </label>
          <div className="space-y-2">
            {['all', 'severe', 'high', 'moderate', 'low'].map((level) => (
              <label key={level} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={severity.includes(level)}
                  onChange={(e) => handleSeverityChange(level, e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 w-4 h-4"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize select-none">
                  {level} Traffic
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Radius Filter */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
            <MapPin className="h-4 w-4" />
            <span>Search Radius: {radius} miles</span>
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 mi</span>
            <span>50 mi</span>
          </div>
        </div>

        {/* Auto-refresh */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
            <Clock className="h-4 w-4" />
            <span>Auto-refresh</span>
          </label>
          <select className="w-full p-2 sm:p-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200">
            <option value="30">Every 30 seconds</option>
            <option value="60">Every minute</option>
            <option value="300">Every 5 minutes</option>
            <option value="0">Manual only</option>
          </select>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={exportData}
              className="flex items-center justify-center space-x-2 px-4 py-2 sm:py-2.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200 font-medium"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
            <button
              onClick={shareData}
              className="flex items-center justify-center space-x-2 px-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};