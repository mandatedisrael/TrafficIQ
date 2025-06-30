import React from 'react';
import { Clock, MapPin, AlertTriangle, TrendingUp, Route, Zap, Activity } from 'lucide-react';
import { TrafficData } from '../types';

interface TrafficListProps {
  trafficData: TrafficData[];
}

export const TrafficList: React.FC<TrafficListProps> = ({ trafficData }) => {
  const getSeverityColor = (severity: TrafficData['severity']) => {
    switch (severity) {
      case 'severe': return 'text-red-600 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-400 border-red-200/50 dark:border-red-700/50';
      case 'high': return 'text-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 dark:text-red-400 border-red-200/50 dark:border-red-700/50';
      case 'moderate': return 'text-amber-600 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 dark:text-amber-400 border-amber-200/50 dark:border-amber-700/50';
      case 'low': return 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-700/50';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/50';
    }
  };

  const getSeverityIcon = (severity: TrafficData['severity']) => {
    if (severity === 'severe' || severity === 'high') {
      return <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />;
    }
    return <Activity className="h-3 w-3 sm:h-4 sm:w-4" />;
  };

  const sortedData = [...trafficData].sort((a, b) => {
    const severityOrder = { severe: 4, high: 3, moderate: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  // Show only top 5 most severe traffic conditions
  const topTrafficData = sortedData.slice(0, 5);

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Route className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Live Traffic Alerts
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Real-time conditions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full px-3 py-1 border border-blue-200/50 dark:border-blue-700/50">
          <Zap className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
            Top {Math.min(trafficData.length, 5)} alerts
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto custom-scrollbar">
        {topTrafficData.map((traffic, index) => (
          <div
            key={traffic.id}
            className="border rounded-xl p-3 sm:p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'slideInUp 0.5s ease-out forwards'
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(traffic.severity)}`}>
                    {getSeverityIcon(traffic.severity)}
                    <span className="capitalize">{traffic.severity}</span>
                  </span>
                  <div className="flex items-center space-x-1 bg-gray-100/50 dark:bg-gray-700/50 rounded-full px-2 py-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {traffic.confidence}% confident
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 mb-3">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {traffic.location.address}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-2">
                    <Clock className="h-3 w-3 flex-shrink-0 text-blue-500" />
                    <div>
                      <div className="font-medium text-blue-700 dark:text-blue-300">{traffic.duration}min</div>
                      <div className="text-xs opacity-75">Duration</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-50/50 dark:bg-green-900/10 rounded-lg p-2">
                    <TrendingUp className="h-3 w-3 flex-shrink-0 text-green-500" />
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-300">{traffic.speed} mph</div>
                      <div className="text-xs opacity-75">Speed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar for severity */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Traffic Intensity</span>
                <span>{traffic.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                    traffic.severity === 'severe' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    traffic.severity === 'high' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                    traffic.severity === 'moderate' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                  style={{ 
                    width: `${traffic.confidence}%`,
                    animationDelay: `${index * 200}ms`
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}

        {trafficData.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="relative mb-4">
              <Route className="h-12 w-12 mx-auto opacity-30" />
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-green-500/20 rounded-full animate-ping"></div>
            </div>
            <p className="text-sm font-medium">Analyzing your area...</p>
            <p className="text-xs mt-1">Traffic conditions will appear here when available</p>
          </div>
        )}
      </div>

      {trafficData.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all duration-200 hover:scale-105 bg-blue-50/50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-200/50 dark:border-blue-700/50">
            View All {trafficData.length} Conditions →
          </button>
        </div>
      )}
    </div>
  );
};