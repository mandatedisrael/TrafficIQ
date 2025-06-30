import React from 'react';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { TrafficData } from '../types';

interface TrafficMapProps {
  trafficData: TrafficData[];
  userLocation: { lat: number; lng: number } | null;
}

export const TrafficMap: React.FC<TrafficMapProps> = ({ trafficData, userLocation }) => {
  const getSeverityColor = (severity: TrafficData['severity']) => {
    switch (severity) {
      case 'severe': return 'bg-red-500';
      case 'high': return 'bg-red-400';
      case 'moderate': return 'bg-amber-400';
      case 'low': return 'bg-emerald-400';
      default: return 'bg-gray-400';
    }
  };

  const getSeverityLabel = (severity: TrafficData['severity']) => {
    switch (severity) {
      case 'severe': return 'Severe Congestion';
      case 'high': return 'Heavy Traffic';
      case 'moderate': return 'Moderate Traffic';
      case 'low': return 'Light Traffic';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Traffic Hotspots
        </h2>
        <div className="flex items-center space-x-2">
          <Navigation className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Real-time View
          </span>
        </div>
      </div>

      {/* Mock Map Container */}
      <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg h-96 overflow-hidden">
        {/* Grid overlay to simulate map */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border border-gray-300 dark:border-gray-600" />
            ))}
          </div>
        </div>

        {/* User Location */}
        {userLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300 mt-1 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
                You
              </span>
            </div>
          </div>
        )}

        {/* Traffic Hotspots */}
        {trafficData.slice(0, 8).map((traffic, index) => (
          <div
            key={traffic.id}
            className="absolute animate-pulse"
            style={{
              top: `${20 + (index % 4) * 20}%`,
              left: `${15 + Math.floor(index / 4) * 35}%`,
            }}
          >
            <div className="relative group">
              <div className={`w-3 h-3 ${getSeverityColor(traffic.severity)} rounded-full shadow-lg`}>
                <div className={`absolute inset-0 ${getSeverityColor(traffic.severity)} rounded-full animate-ping opacity-75`}></div>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                  <div className="font-medium">{getSeverityLabel(traffic.severity)}</div>
                  <div>{traffic.location.address}</div>
                  <div>Speed: {traffic.speed} mph</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {(['severe', 'high', 'moderate', 'low'] as const).map((severity) => (
          <div key={severity} className="flex items-center space-x-2">
            <div className={`w-3 h-3 ${getSeverityColor(severity)} rounded-full`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {getSeverityLabel(severity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};