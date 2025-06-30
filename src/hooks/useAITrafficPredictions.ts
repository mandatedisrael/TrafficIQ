import { useState, useEffect } from 'react';
import { TogetherAIService } from '../services/togetherAIService';
import { TrafficService } from '../services/trafficService';
import { Location } from '../types';

interface AIPrediction {
  nextHour: { congestion: number; confidence: number };
  next2Hours: { congestion: number; confidence: number };
  next4Hours: { congestion: number; confidence: number };
  peakTime: string;
  reasoning: string;
}

interface EnhancedPredictionData {
  time: string;
  current: number;
  predicted: number;
  aiPredicted: number;
  confidence: number;
  historical: number;
}

export const useAITrafficPredictions = (userLocation: Location | null, trafficData: any[], hasActiveRoute: boolean = false, destination?: string) => {
  const [predictions, setPredictions] = useState<any | null>(null);
  const [aiPredictions, setAIPredictions] = useState<AIPrediction | null>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedPredictionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!userLocation) return;

      setIsLoading(true);
      setError(null);

      try {
        // Get traditional traffic predictions
        const traditionalPredictions = await TrafficService.getTrafficPredictions(userLocation);
        setPredictions(traditionalPredictions);

        // Get AI-enhanced predictions only if user has searched for a route
        if (hasActiveRoute && destination && trafficData.length > 0) {
          setIsAIAnalyzing(true);
          
          try {
            const aiPredictionData = await TogetherAIService.predictTrafficTrends(
              traditionalPredictions.predictions || [],
              {
                location: userLocation,
                currentTraffic: trafficData,
                timestamp: new Date().toISOString()
              }
            );
            
            setAIPredictions(aiPredictionData);
            
            // Combine traditional and AI predictions
            const enhanced = combineTraditionalAndAIPredictions(
              traditionalPredictions,
              aiPredictionData
            );
            
            setEnhancedData(enhanced);
            
          } catch (aiError) {
            console.error('AI predictions failed:', aiError);
            // Continue with traditional predictions only
            const traditionalOnly = convertTraditionalPredictions(traditionalPredictions);
            setEnhancedData(traditionalOnly);
          } finally {
            setIsAIAnalyzing(false);
          }
        } else {
          // No traffic data available, use traditional predictions only
          const traditionalOnly = convertTraditionalPredictions(traditionalPredictions);
          setEnhancedData(traditionalOnly);
        }

        setLastUpdated(new Date());
        
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
        setError('Failed to load traffic predictions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
    
    // Only refresh automatically if there's an active route, otherwise just run once
    let interval: NodeJS.Timeout | null = null;
    if (hasActiveRoute && destination) {
      interval = setInterval(fetchPredictions, 15 * 60 * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userLocation, hasActiveRoute, destination]);

  const combineTraditionalAndAIPredictions = (
    traditional: any,
    ai: AIPrediction
  ): EnhancedPredictionData[] => {
    if (!traditional.predictions || traditional.predictions.length === 0) {
      return generateFallbackData(ai);
    }

    const currentHour = new Date().getHours();
    
    return traditional.predictions.map((pred: any, index: number) => {
      const hour = (currentHour + index) % 24;
      
      // Get corresponding AI prediction
      let aiPredicted = pred.congestionLevel;
      let confidence = 0.7;
      
      if (index === 0 && ai.nextHour) {
        aiPredicted = ai.nextHour.congestion;
        confidence = ai.nextHour.confidence;
      } else if (index === 1 && ai.next2Hours) {
        aiPredicted = ai.next2Hours.congestion;
        confidence = ai.next2Hours.confidence;
      } else if (index <= 3 && ai.next4Hours) {
        aiPredicted = ai.next4Hours.congestion;
        confidence = ai.next4Hours.confidence;
      }

      // Blend traditional and AI predictions based on confidence
      const blendedPrediction = Math.round(
        (pred.congestionLevel * (1 - confidence * 0.3)) + 
        (aiPredicted * (confidence * 0.3))
      );

      return {
        time: pred.time,
        current: index === 0 ? pred.congestionLevel : 0,
        predicted: pred.congestionLevel,
        aiPredicted: blendedPrediction,
        confidence,
        historical: Math.max(5, pred.congestionLevel - (10 + Math.random() * 10))
      };
    });
  };

  const convertTraditionalPredictions = (traditional: any): EnhancedPredictionData[] => {
    if (!traditional.predictions || traditional.predictions.length === 0) {
      return [];
    }

    return traditional.predictions.map((pred: any, index: number) => ({
      time: pred.time,
      current: index === 0 ? pred.congestionLevel : 0,
      predicted: pred.congestionLevel,
      aiPredicted: pred.congestionLevel, // Same as predicted when no AI
      confidence: 0.6,
      historical: Math.max(5, pred.congestionLevel - (10 + Math.random() * 10))
    }));
  };

  const generateFallbackData = (ai: AIPrediction | null): EnhancedPredictionData[] => {
    const currentHour = new Date().getHours();
    const fallbackData = [];

    for (let i = 0; i < 6; i++) {
      const hour = (currentHour + i) % 24;
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      
      let congestion = 40 + Math.random() * 30; // Random baseline
      let confidence = 0.5;
      
      // Apply AI predictions if available
      if (ai) {
        if (i === 0 && ai.nextHour) {
          congestion = ai.nextHour.congestion;
          confidence = ai.nextHour.confidence;
        } else if (i === 1 && ai.next2Hours) {
          congestion = ai.next2Hours.congestion;
          confidence = ai.next2Hours.confidence;
        } else if (i <= 3 && ai.next4Hours) {
          congestion = ai.next4Hours.congestion;
          confidence = ai.next4Hours.confidence;
        }
      }

      fallbackData.push({
        time: timeString,
        current: i === 0 ? congestion : 0,
        predicted: congestion,
        aiPredicted: congestion,
        confidence,
        historical: Math.max(5, congestion - 15)
      });
    }

    return fallbackData;
  };

  // Calculate enhanced metrics
  const currentCongestion = enhancedData.length > 0 ? enhancedData[0].aiPredicted : 0;
  const nextHourPrediction = enhancedData.length > 1 ? enhancedData[1].aiPredicted : currentCongestion;
  const averageConfidence = enhancedData.length > 0 
    ? enhancedData.reduce((sum, d) => sum + d.confidence, 0) / enhancedData.length 
    : 0;

  const peakHour = enhancedData.reduce((peak, current) => 
    current.aiPredicted > peak.aiPredicted ? current : peak, 
    { time: 'N/A', aiPredicted: 0 }
  );

  return {
    predictions,
    aiPredictions,
    enhancedData,
    isLoading,
    isAIAnalyzing,
    error,
    lastUpdated,
    metrics: {
      currentCongestion,
      nextHourPrediction,
      averageConfidence,
      peakHour,
      accuracy: predictions?.accuracy || averageConfidence * 100,
      isAIEnhanced: !!aiPredictions && enhancedData.length > 0
    }
  };
}; 