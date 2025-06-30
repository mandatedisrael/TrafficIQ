export interface GoogleMapsConfig {
  apiKey: string;
  libraries: string[];
}

export interface PlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  types: string[];
}

export interface DirectionsResult {
  routes: GoogleRoute[];
  status: string;
}

export interface GoogleRoute {
  legs: RouteLeg[];
  overview_polyline: {
    points: string;
  };
  summary: string;
  warnings: string[];
  waypoint_order: number[];
}

export interface RouteLeg {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  duration_in_traffic?: {
    text: string;
    value: number;
  };
  end_address: string;
  start_address: string;
  steps: RouteStep[];
}

export interface RouteStep {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  html_instructions: string;
  start_location: {
    lat: number;
    lng: number;
  };
  end_location: {
    lat: number;
    lng: number;
  };
  travel_mode: string;
}

export class GoogleMapsService {
  private static instance: GoogleMapsService;
  private apiKey: string;
  private isLoaded = false;

  private constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Google Maps API key is required. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file');
    }
  }

  static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  async loadGoogleMaps(): Promise<void> {
    if (this.isLoaded && window.google && window.google.maps) {
      console.log('Google Maps already loaded and verified, skipping initialization');
      return;
    }

    if (!this.apiKey) {
      throw new Error('Google Maps API key is not configured. Please check your environment variables.');
    }

    console.log('Loading Google Maps API with key:', this.apiKey.substring(0, 20) + '...');

    return new Promise((resolve, reject) => {
      // Check if already loaded by another instance
      if (window.google && window.google.maps) {
        this.isLoaded = true;
        console.log('Google Maps API already available in window object');
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script already exists, waiting for load...');
        
        // Wait for the existing script to finish loading
        const waitForGoogle = () => {
          if (window.google && window.google.maps) {
            this.isLoaded = true;
            console.log('Google Maps API loaded successfully via existing script');
            resolve();
          } else {
            setTimeout(waitForGoogle, 100);
          }
        };
        waitForGoogle();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      // Set up timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.error('Google Maps API loading timed out after 15 seconds');
        reject(new Error('Google Maps API loading timed out'));
      }, 15000);

      (window as any).initGoogleMaps = () => {
        clearTimeout(timeout);
        this.isLoaded = true;
        console.log('Google Maps API loaded successfully via callback');
        
        // Verify all required services are available
        const servicesCheck = {
          maps: !!window.google?.maps,
          places: !!window.google?.maps?.places,
          directionsService: !!window.google?.maps?.DirectionsService,
          placesService: !!window.google?.maps?.places?.PlacesService
        };
        
        console.log('Available services:', servicesCheck);
        
        // Check if all required services are loaded
        if (!servicesCheck.maps || !servicesCheck.places || !servicesCheck.directionsService) {
          console.error('Some Google Maps services failed to load:', servicesCheck);
          reject(new Error('Google Maps services not fully loaded'));
          return;
        }
        
        resolve();
      };

      script.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Failed to load Google Maps API script:', error);
        reject(new Error('Failed to load Google Maps API script'));
      };

      console.log('Adding Google Maps script to document head');
      document.head.appendChild(script);
    });
  }

  async searchPlaces(query: string): Promise<PlaceResult[]> {
    console.log('Searching for places:', query);
    await this.loadGoogleMaps();

    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Maps not loaded'));
        return;
      }

      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      service.textSearch(
        {
          query,
          fields: ['place_id', 'formatted_address', 'geometry', 'name', 'types']
        },
        (results, status) => {
          console.log('Places search status:', status);
          console.log('Places search results:', results);
          
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const places: PlaceResult[] = results.map(place => {
              let displayAddress = place.formatted_address!;
              
              // If the formatted address is a Plus Code, try to use the place name instead
              if (this.isPlusCode(displayAddress) && place.name) {
                console.log(`Replacing Plus Code "${displayAddress}" with place name "${place.name}"`);
                displayAddress = place.name;
                
                // Try to add some location context if available
                if (place.vicinity) {
                  displayAddress += `, ${place.vicinity}`;
                }
              }
              
              return {
                place_id: place.place_id!,
                formatted_address: displayAddress,
                geometry: {
                  location: {
                    lat: place.geometry!.location!.lat(),
                    lng: place.geometry!.location!.lng()
                  }
                },
                name: place.name!,
                types: place.types!
              };
            });
            console.log('Found places:', places.length);
            resolve(places);
          } else {
            console.error('Places search failed with status:', status);
            reject(new Error(`Places search failed: ${status}`));
          }
        }
      );
    });
  }

  async calculateDirections(
    origin: { lat: number; lng: number },
    destination: string,
    options: {
      travelMode?: google.maps.TravelMode;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
      provideRouteAlternatives?: boolean;
    } = {}
  ): Promise<DirectionsResult> {
    console.log('=== CALCULATING DIRECTIONS ===');
    console.log('Origin:', origin);
    console.log('Destination:', destination);
    console.log('Options:', options);
    
    await this.loadGoogleMaps();

    return new Promise((resolve, reject) => {
      if (!window.google) {
        console.error('Google Maps not loaded when trying to calculate directions');
        reject(new Error('Google Maps not loaded'));
        return;
      }

      if (!window.google.maps?.DirectionsService) {
        console.error('DirectionsService not available');
        reject(new Error('DirectionsService not available'));
        return;
      }

      const directionsService = new google.maps.DirectionsService();
      console.log('DirectionsService created successfully');

      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination,
        travelMode: options.travelMode || google.maps.TravelMode.DRIVING,
        avoidHighways: options.avoidHighways || false,
        avoidTolls: options.avoidTolls || false,
        provideRouteAlternatives: options.provideRouteAlternatives || true,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      };

      console.log('Making directions request:', {
        origin: `${origin.lat}, ${origin.lng}`,
        destination,
        travelMode: request.travelMode,
        departureTime: request.drivingOptions?.departureTime
      });

      directionsService.route(request, (result, status) => {
        console.log('Directions API response received');
        console.log('Status:', status);
        console.log('Result available:', !!result);
        
        if (status === google.maps.DirectionsStatus.OK && result) {
          console.log('Success! Number of routes:', result.routes.length);
          
          result.routes.forEach((route, index) => {
            const leg = route.legs[0];
            console.log(`Route ${index + 1}:`, {
              summary: route.summary,
              distance: leg.distance?.text,
              duration: leg.duration?.text,
              durationInTraffic: leg.duration_in_traffic?.text,
              hasTrafficData: !!leg.duration_in_traffic
            });
          });
          
          resolve({
            routes: result.routes.map(route => ({
              legs: route.legs.map(leg => ({
                distance: {
                  text: leg.distance!.text,
                  value: leg.distance!.value
                },
                duration: {
                  text: leg.duration!.text,
                  value: leg.duration!.value
                },
                duration_in_traffic: leg.duration_in_traffic ? {
                  text: leg.duration_in_traffic.text,
                  value: leg.duration_in_traffic.value
                } : undefined,
                end_address: leg.end_address,
                start_address: leg.start_address,
                steps: leg.steps.map(step => ({
                  distance: {
                    text: step.distance.text,
                    value: step.distance.value
                  },
                  duration: {
                    text: step.duration.text,
                    value: step.duration.value
                  },
                  html_instructions: step.instructions,
                  start_location: {
                    lat: step.start_location.lat(),
                    lng: step.start_location.lng()
                  },
                  end_location: {
                    lat: step.end_location.lat(),
                    lng: step.end_location.lng()
                  },
                  travel_mode: step.travel_mode
                }))
              })),
              overview_polyline: {
                points: route.overview_polyline.points
              },
              summary: route.summary,
              warnings: route.warnings,
              waypoint_order: route.waypoint_order
            })),
            status
          });
        } else {
          console.error('Directions request failed with status:', status);
          console.error('Available status codes:', {
            OK: google.maps.DirectionsStatus.OK,
            NOT_FOUND: google.maps.DirectionsStatus.NOT_FOUND,
            ZERO_RESULTS: google.maps.DirectionsStatus.ZERO_RESULTS,
            MAX_WAYPOINTS_EXCEEDED: google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED,
            INVALID_REQUEST: google.maps.DirectionsStatus.INVALID_REQUEST,
            OVER_QUERY_LIMIT: google.maps.DirectionsStatus.OVER_QUERY_LIMIT,
            REQUEST_DENIED: google.maps.DirectionsStatus.REQUEST_DENIED,
            UNKNOWN_ERROR: google.maps.DirectionsStatus.UNKNOWN_ERROR
          });
          reject(new Error(`Directions request failed: ${status}`));
        }
      });
    });
  }

  /**
   * Detects if a string is a Plus Code (Google's Open Location Code)
   * Plus Codes have patterns like: "8Q7X+2F", "FGX6+58X", "G2CX+2G"
   */
  private isPlusCode(text: string): boolean {
    // Plus Code patterns: 2-8 chars + "+" + 2-3 chars
    const plusCodePattern = /^[23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{2,3}$/i;
    
    // Check if the entire string is a Plus Code
    if (plusCodePattern.test(text.trim())) {
      return true;
    }
    
    // Check if it starts with a Plus Code (common in formatted addresses)
    const startsWithPlusCode = /^[23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{2,3}/i;
    if (startsWithPlusCode.test(text.trim())) {
      return true;
    }
    
    return false;
  }

  /**
   * Extracts a readable location name from a geocoding result, avoiding Plus Codes
   */
  private getReadableLocationName(result: google.maps.GeocoderResult): string | null {
    // First, check if the formatted_address is a Plus Code and try to find alternatives
    if (this.isPlusCode(result.formatted_address)) {
      console.log('Detected Plus Code in formatted_address:', result.formatted_address);
      
      // Try to find a better name from address_components
      const addressComponents = result.address_components || [];
      
      // Look for meaningful location components in order of preference
      const preferredTypes = [
        'establishment',
        'point_of_interest', 
        'subpremise',
        'premise',
        'neighborhood',
        'sublocality_level_1',
        'sublocality',
        'locality',
        'administrative_area_level_3',
        'administrative_area_level_2'
      ];
      
      for (const preferredType of preferredTypes) {
        const component = addressComponents.find(comp => 
          comp.types.includes(preferredType) && 
          !this.isPlusCode(comp.long_name) &&
          comp.long_name.length > 1
        );
        
        if (component) {
          console.log(`Found better name from ${preferredType}:`, component.long_name);
          
          // If we found a good component, try to build a more complete address
          const locality = addressComponents.find(comp => comp.types.includes('locality'))?.long_name;
          const adminArea = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.short_name;
          
          let readableName = component.long_name;
          if (locality && locality !== component.long_name) {
            readableName += `, ${locality}`;
          }
          if (adminArea && adminArea !== locality) {
            readableName += `, ${adminArea}`;
          }
          
          return readableName;
        }
      }
      
      // If no good components found, try to build from basic components
      const locality = addressComponents.find(comp => comp.types.includes('locality'))?.long_name;
      const adminArea = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.long_name;
      const country = addressComponents.find(comp => comp.types.includes('country'))?.long_name;
      
      if (locality && !this.isPlusCode(locality)) {
        let name = locality;
        if (adminArea && adminArea !== locality && !this.isPlusCode(adminArea)) {
          name += `, ${adminArea}`;
        } else if (country && country !== locality && !this.isPlusCode(country)) {
          name += `, ${country}`;
        }
        return name;
      }
      
      if (adminArea && !this.isPlusCode(adminArea)) {
        return country && !this.isPlusCode(country) ? `${adminArea}, ${country}` : adminArea;
      }
      
      if (country && !this.isPlusCode(country)) {
        return country;
      }
      
      // Last resort: return "Unknown Location" instead of Plus Code
      console.warn('Could not find readable alternative to Plus Code, using fallback');
      return 'Unknown Location';
    }
    
    // If it's not a Plus Code, return the formatted address as is
    return result.formatted_address;
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    console.log(`Reverse geocoding coordinates: ${lat}, ${lng}`);
    await this.loadGoogleMaps();

    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Maps not loaded'));
        return;
      }

      const geocoder = new google.maps.Geocoder();
      const latlng = new google.maps.LatLng(lat, lng);

      geocoder.geocode({ location: latlng }, (results, status) => {
        console.log('Reverse geocoding status:', status);
        console.log('Reverse geocoding results:', results);
        
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          // Try to find the best result that's not a Plus Code
          let bestResult = null;
          let bestAddress = null;
          
          // First, try to find a result with a specific address type that's not a Plus Code
          const preferredResults = results.filter(result => 
            (result.types.includes('street_address') || 
             result.types.includes('premise') ||
             result.types.includes('subpremise') ||
             result.types.includes('establishment') ||
             result.types.includes('point_of_interest') ||
             result.types.includes('route')) &&
            !this.isPlusCode(result.formatted_address)
          );
          
          if (preferredResults.length > 0) {
            bestResult = preferredResults[0];
            bestAddress = this.getReadableLocationName(bestResult);
          } else {
            // If no preferred results without Plus Codes, try all results
            for (const result of results) {
              const readableName = this.getReadableLocationName(result);
              if (readableName && readableName !== 'Unknown Location') {
                bestResult = result;
                bestAddress = readableName;
                break;
              }
            }
          }
          
          // Final fallback
          if (!bestAddress) {
            bestResult = results[0];
            bestAddress = this.getReadableLocationName(bestResult);
          }
          
          console.log('Selected best result:', bestResult?.types);
          console.log('Final address:', bestAddress);
          resolve(bestAddress);
        } else {
          console.error('Reverse geocoding failed with status:', status);
          resolve(null);
        }
      });
    });
  }

  /**
   * Public utility method to format location names for display
   * This can be used by other services to ensure consistent location formatting
   */
  formatLocationForDisplay(address: string, placeName?: string): string {
    // If the address is a Plus Code, prefer the place name
    if (this.isPlusCode(address)) {
      if (placeName && !this.isPlusCode(placeName)) {
        return placeName;
      }
      return 'Unknown Location';
    }
    
    // If we have both address and place name, and they're different, 
    // prefer the place name if it's more descriptive
    if (placeName && placeName !== address && !this.isPlusCode(placeName)) {
      // If the address is very long and the place name is concise, prefer place name
      if (address.length > 50 && placeName.length < 30) {
        return placeName;
      }
      
      // If the place name contains useful info not in address, prefer it
      if (placeName.toLowerCase().includes('mall') || 
          placeName.toLowerCase().includes('center') ||
          placeName.toLowerCase().includes('hospital') ||
          placeName.toLowerCase().includes('school') ||
          placeName.toLowerCase().includes('airport')) {
        return placeName;
      }
    }
    
    return address;
  }
}

// Global type declarations
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}