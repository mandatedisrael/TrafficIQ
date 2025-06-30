import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create a fallback client if environment variables are missing (for development/demo purposes)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface TrafficRecord {
  id?: string;
  location_lat: number;
  location_lng: number;
  location_address: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  speed: number;
  duration: number;
  confidence: number;
  timestamp: string;
  predicted_duration: number;
  affected_routes: string[];
  cause?: string;
  description?: string;
  user_id?: string;
}

export interface RouteRecord {
  id?: string;
  user_id?: string;
  origin_lat: number;
  origin_lng: number;
  destination: string;
  destination_lat?: number;
  destination_lng?: number;
  route_name: string;
  distance: number;
  duration: number;
  duration_with_traffic: number;
  traffic_delay: number;
  traffic_level: string;
  description: string;
  is_recommended: boolean;
  savings?: number;
  waypoints?: string[];
  polyline?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  id?: string;
  user_id: string;
  avoid_tolls: boolean;
  avoid_highways: boolean;
  preferred_routes: string[];
  notification_settings: {
    traffic_alerts: boolean;
    route_suggestions: boolean;
    departure_reminders: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export class SupabaseService {
  // Traffic Conditions
  static async saveTrafficCondition(condition: Omit<TrafficRecord, 'id'>): Promise<TrafficRecord | null> {
    if (!supabase) {
      console.warn('Supabase not configured - skipping traffic condition save');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('traffic_conditions')
        .insert([condition])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving traffic condition:', error);
      return null;
    }
  }

  static async getTrafficConditions(
    location: { lat: number; lng: number },
    radius: number = 10
  ): Promise<TrafficRecord[]> {
    if (!supabase) {
      console.warn('Supabase not configured - returning empty traffic conditions');
      return [];
    }

    try {
      // Using PostGIS functions for location-based queries
      const { data, error } = await supabase
        .from('traffic_conditions')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // Last 2 hours
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Filter by distance (simplified - in production use PostGIS)
      const filtered = data?.filter(condition => {
        const distance = this.calculateDistance(
          location.lat,
          location.lng,
          condition.location_lat,
          condition.location_lng
        );
        return distance <= radius;
      }) || [];

      return filtered;
    } catch (error) {
      console.error('Error fetching traffic conditions:', error);
      return [];
    }
  }

  // Route Management
  static async saveRoute(route: Omit<RouteRecord, 'id'>): Promise<RouteRecord | null> {
    try {
      const { data, error } = await supabase
        .from('saved_routes')
        .insert([route])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving route:', error);
      return null;
    }
  }

  static async getUserRoutes(userId: string): Promise<RouteRecord[]> {
    try {
      const { data, error } = await supabase
        .from('saved_routes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user routes:', error);
      return [];
    }
  }

  static async deleteRoute(routeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_routes')
        .delete()
        .eq('id', routeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting route:', error);
      return false;
    }
  }

  // User Preferences
  static async saveUserPreferences(preferences: Omit<UserPreferences, 'id'>): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert([preferences])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return null;
    }
  }

  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  // Analytics
  static async logRouteUsage(routeId: string, userId?: string): Promise<void> {
    try {
      await supabase
        .from('route_analytics')
        .insert([{
          route_id: routeId,
          user_id: userId,
          used_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error logging route usage:', error);
    }
  }

  static async getPopularRoutes(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('route_analytics')
        .select(`
          route_id,
          saved_routes (
            route_name,
            destination,
            distance,
            duration
          )
        `)
        .gte('used_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching popular routes:', error);
      return [];
    }
  }

  // Utility Functions
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Real-time subscriptions
  static subscribeToTrafficUpdates(
    location: { lat: number; lng: number },
    callback: (payload: any) => void
  ) {
    return supabase
      .channel('traffic_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'traffic_conditions'
        },
        callback
      )
      .subscribe();
  }

  static subscribeToRouteUpdates(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('route_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_routes',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
}