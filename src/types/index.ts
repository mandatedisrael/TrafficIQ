export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface TrafficData {
  id: string;
  location: Location;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  speed: number;
  duration: number;
  confidence: number;
  timestamp: Date;
  predictedDuration: number;
  affectedRoutes: string[];
}

export interface Route {
  id: string;
  name: string;
  distance: number;
  duration: number;
  trafficLevel: 'low' | 'moderate' | 'high' | 'severe';
  alternativeRoutes?: Route[];
}

export interface PredictionModel {
  accuracy: number;
  lastUpdated: Date;
  factors: {
    rushHour: number;
    weather: number;
    events: number;
    historical: number;
  };
}

export interface FilterOptions {
  timeRange: {
    start: Date;
    end: Date;
  };
  severity: string[];
  area: {
    center: Location;
    radius: number;
  };
}