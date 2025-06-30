import React, { useState, useEffect } from 'react';
import { Brain, Zap, Clock, AlertTriangle, TrendingUp, Lightbulb, Star, Target } from 'lucide-react';
import { TogetherAIService } from '../services/togetherAIService';
import { useGeolocation } from '../hooks/useGeolocation';

interface AITrafficInsightsProps {
  trafficData: any[];
  destination?: string;
  hasActiveRoute?: boolean;
  className?: string;
}

export const AITrafficInsights: React.FC<AITrafficInsightsProps> = ({ 
  trafficData, 
  destination, 
  hasActiveRoute = false,
  className = '' 
}) => {
  const { location: userLocation } = useGeolocation();
  const [insights, setInsights] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);

  useEffect(() => {
    const analyzeTraffic = async () => {
      // Only analyze if user has searched for a destination and we have route data
      if (!userLocation || !destination || !hasActiveRoute) {
        setInsights(null);
        setError(null);
        return;
      }

      console.log('AI analyzing route to:', destination);
      setIsAnalyzing(true);
      setError(null);

      try {
        const currentTime = new Date();
        const timeOfDay = currentTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });

        const analysisRequest = {
          currentTraffic: trafficData,
          userLocation,
          destination,
          timeOfDay,
          weatherConditions: 'clear' // You can integrate weather API later
        };

        const aiInsights = await TogetherAIService.analyzeTrafficConditions(analysisRequest);
        setInsights(aiInsights);
        setLastAnalysisTime(currentTime);
        
      } catch (error) {
        console.error('AI traffic analysis failed:', error);
        setError('AI analysis temporarily unavailable');
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Only analyze when user searches for a route (not continuously)
    analyzeTraffic();
  }, [userLocation, destination, hasActiveRoute]); // Removed trafficData from dependencies

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800';
      case 'severe': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'moderate': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'severe': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!userLocation) {
    return (
      <div className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-4 sm:p-6 ${className}`}>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">Location Required for AI Analysis</p>
        </div>
      </div>
    );
  }

  if (!hasActiveRoute || !destination) {
    return (
      <div className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-4 sm:p-6 ${className}`}>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">Search for a destination to get AI analysis</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">AI will analyze your route and provide smart recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Brain className="h-6 w-6 sm:h-7 sm:w-7 text-purple-600 dark:text-purple-400" />
            {isAnalyzing && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              AI Traffic Insights
            </h2>
                         <p className="text-xs text-gray-500 dark:text-gray-400">
               {isAnalyzing ? 'Analyzing with Llama 3.3...' : `Analyzing route to ${destination}`}
             </p>
          </div>
        </div>
        
        {insights && (
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full px-3 py-1">
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {Math.round(insights.confidence * 100)}% Confidence
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-700 dark:text-amber-300">{error}</span>
          </div>
        </div>
      )}

      {isAnalyzing ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <div className="absolute inset-0 rounded-full h-8 w-8 border-t-2 border-pink-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">AI analyzing traffic patterns...</span>
          </div>
        </div>
      ) : insights ? (
        <div className="space-y-6">
          {/* Current Situation */}
          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Current Traffic Situation</h3>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getSeverityColor(insights.severity)}`}>
                {getSeverityIcon(insights.severity)}
                <span className="text-sm font-medium capitalize">{insights.severity}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{insights.summary}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-900 dark:text-blue-300">Predicted Congestion</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{insights.predictedCongestion}%</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-900 dark:text-green-300">Best Time</span>
              </div>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{insights.bestTimeToTravel}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/50 col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-900 dark:text-amber-300">Estimated Delay</span>
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">+{insights.estimatedDelay} min</p>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-purple-900 dark:text-purple-200">AI Recommendations</h3>
            </div>
            <div className="space-y-2">
              {insights.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <Star className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-purple-800 dark:text-purple-200">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Route Alternatives Suggestion */}
          {insights.alternativeRoutesSuggestion && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-xl p-4 border border-indigo-200/50 dark:border-indigo-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-200">Route Optimization</h3>
              </div>
              <p className="text-sm text-indigo-800 dark:text-indigo-200">{insights.alternativeRoutesSuggestion}</p>
            </div>
          )}

          {/* Analysis Timestamp */}
          {lastAnalysisTime && (
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last analyzed: {lastAnalysisTime.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">Waiting for traffic data...</p>
        </div>
      )}
    </div>
  );
}; 