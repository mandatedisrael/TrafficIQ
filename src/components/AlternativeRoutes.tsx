import React, { useState, useEffect } from 'react';
import { Route, Navigation, Clock, MapPin, TrendingUp, Zap, Star, Award, AlertCircle } from 'lucide-react';
import { RouteService, RouteResult } from '../services/routeService';
import { SupabaseService } from '../services/supabaseService';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuth } from '../contexts/AuthContext';

interface AlternativeRoute extends RouteResult {
  timeSavings: number;
  distanceDifference: number;
}

interface AlternativeRoutesProps {
  className?: string;
  routes?: RouteResult[];
  destination?: string;
  mainRoute?: RouteResult;
}

export const AlternativeRoutes: React.FC<AlternativeRoutesProps> = ({ 
  className = '', 
  routes: providedRoutes = [], 
  destination = '', 
  mainRoute 
}) => {
  const { location: userLocation } = useGeolocation();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Filter routes to only show alternatives that are better than the main route
  const alternativeRoutes = providedRoutes.filter((route, index) => {
    if (!mainRoute || index === 0) return false; // Skip the main route itself
    
    // Only show routes that are faster (have less duration with traffic)
    const timeSavings = mainRoute.durationWithTraffic - route.durationWithTraffic;
    return timeSavings > 0; // Only routes that save time
  });

  // Calculate savings for each alternative route
  const routesWithSavings: AlternativeRoute[] = alternativeRoutes.map(route => ({
    ...route,
    timeSavings: mainRoute ? mainRoute.durationWithTraffic - route.durationWithTraffic : 0,
    distanceDifference: mainRoute ? route.distance - mainRoute.distance : 0
  }));

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'severe': return 'text-red-600 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-400 border-red-200/50 dark:border-red-700/50';
      case 'high': return 'text-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 dark:text-red-400 border-red-200/50 dark:border-red-700/50';
      case 'moderate': return 'text-amber-600 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 dark:text-amber-400 border-amber-200/50 dark:border-amber-700/50';
      case 'low': return 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-700/50';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 border-gray-200/50 dark:border-gray-700/50';
    }
  };

  const getBestAlternative = () => {
    if (routesWithSavings.length === 0) return null;
    return routesWithSavings.reduce((best, current) => {
      return current.timeSavings > best.timeSavings ? current : best;
    });
  };

  const bestAlternative = getBestAlternative();

  const calculateRating = (route: AlternativeRoute): number => {
    // Calculate rating based on traffic level, duration, and savings
    let rating = 5.0;
    
    // Reduce rating based on traffic level
    switch (route.trafficLevel) {
      case 'severe': rating -= 2.5; break;
      case 'high': rating -= 1.5; break;
      case 'moderate': rating -= 0.5; break;
      case 'low': rating += 0; break;
    }
    
    // Boost rating for recommended routes
    if (route.isRecommended) rating += 0.5;
    
    // Boost rating for time savings
    if (route.timeSavings && route.timeSavings > 0) rating += Math.min(1.0, route.timeSavings / 10);
    
    return Math.max(1.0, Math.min(5.0, rating));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  if (!userLocation) {
    return (
      <div className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-4 sm:p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3 py-8">
          <MapPin className="h-6 w-6 text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400">
            Location access required for route alternatives
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-4 sm:p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3 py-8">
          <AlertCircle className="h-6 w-6 text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400">
            Sign in to see personalized route alternatives
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Navigation className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Better Route Alternatives
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {destination ? `To ${destination}` : 'Faster routes available'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full px-3 py-1 border border-green-200/50 dark:border-green-700/50">
          <Zap className="h-3 w-3 text-green-600 dark:text-green-400" />
          <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
            {routesWithSavings.length} Better Routes
          </span>
        </div>
      </div>

      {routesWithSavings.length === 0 ? (
        <div className="text-center py-8">
          <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No faster alternatives found</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">The main route is already the best option</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Best Alternative Highlight */}
          {bestAlternative && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-2 border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-800 dark:text-green-200">Best Alternative</span>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(calculateRating(bestAlternative))}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{bestAlternative.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{bestAlternative.description}</p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    -{bestAlternative.timeSavings} min
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">Time Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {bestAlternative.distance.toFixed(1)} mi
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {bestAlternative.durationWithTraffic} min
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">Total Time</div>
                </div>
              </div>
            </div>
          )}

          {/* Other Alternatives */}
          {routesWithSavings.filter(route => route !== bestAlternative).map((route, index) => (
            <div key={index} className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{route.name}</h3>
                <div className="flex items-center space-x-1">
                  {renderStars(calculateRating(route))}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{route.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      -{route.timeSavings} min
                    </div>
                    <div className="text-xs text-gray-500">Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {route.distance.toFixed(1)} mi
                    </div>
                    <div className="text-xs text-gray-500">Distance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {route.durationWithTraffic} min
                    </div>
                    <div className="text-xs text-gray-500">Time</div>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getTrafficColor(route.trafficLevel || 'low')}`}>
                  {route.trafficLevel ? route.trafficLevel.charAt(0).toUpperCase() + route.trafficLevel.slice(1) : 'Light'} Traffic
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};