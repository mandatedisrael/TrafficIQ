import { useState, useEffect } from 'react';
import { TrafficData, Location } from '../types';
import { TrafficService } from '../services/trafficService';

export const useTrafficData = (userLocation: Location | null) => {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrafficData = async (isManualRefresh: boolean = false) => {
    if (!userLocation) {
      console.log('No user location available for traffic data');
      setTrafficData([]);
      return;
    }

    console.log('Fetching traffic data for location:', userLocation, isManualRefresh ? '(manual)' : '(auto)');
    
    // Only show loading indicator for manual refreshes
    if (isManualRefresh) {
      setIsLoading(true);
    } else {
      setIsAutoRefreshing(true);
    }
    setError(null);

    try {
      const conditions = await TrafficService.getCurrentTrafficConditions(userLocation, 10);
      console.log('Received traffic conditions:', conditions);
      
      // Convert TrafficCondition to TrafficData format
      const convertedData: TrafficData[] = conditions.map(condition => ({
        id: condition.id,
        location: condition.location,
        severity: condition.severity,
        speed: condition.speed,
        duration: condition.duration,
        confidence: condition.confidence,
        timestamp: condition.timestamp,
        predictedDuration: condition.predictedDuration,
        affectedRoutes: condition.affectedRoutes
      }));

      console.log('Converted traffic data:', convertedData);
      setTrafficData(convertedData);
      setLastUpdated(new Date());
      
      if (convertedData.length === 0) {
        setError('No traffic data available for your area. This could mean light traffic conditions.');
      }
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load traffic data. Please check your internet connection.');
      setTrafficData([]);
    } finally {
      if (isManualRefresh) {
        setIsLoading(false);
      } else {
        setIsAutoRefreshing(false);
      }
    }
  };

  useEffect(() => {
    // Initial fetch (show loading for first load)
    fetchTrafficData(true);
    
    // Auto-refresh every 5 minutes in background without loading indicator
    const interval = setInterval(() => fetchTrafficData(false), 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userLocation]);

  const refreshTrafficData = async () => {
    if (!userLocation) return;
    console.log('Manually refreshing traffic data');
    await fetchTrafficData(true); // Pass true for manual refresh to show loading
  };

  return { 
    trafficData, 
    lastUpdated, 
    isLoading, 
    isAutoRefreshing,
    error, 
    refreshTrafficData 
  };
};