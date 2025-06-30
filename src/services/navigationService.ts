export interface NavigationApp {
  name: string;
  url: string;
  icon: string;
  condition?: boolean;
}

export interface NavigationOptions {
  origin: { lat: number; lng: number };
  destination: string;
  waypoints?: string[];
}

export class NavigationService {
  private static detectPlatform() {
    const userAgent = navigator.userAgent;
    return {
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      isMobile: /Mobi|Android/i.test(userAgent)
    };
  }

  static generateNavigationUrls(options: NavigationOptions): NavigationApp[] {
    const { origin, destination, waypoints } = options;
    const platform = this.detectPlatform();
    const originStr = `${origin.lat},${origin.lng}`;
    const destStr = encodeURIComponent(destination);
    
    const apps: NavigationApp[] = [
      {
        name: 'Google Maps',
        url: waypoints && waypoints.length > 0 
          ? `https://www.google.com/maps/dir/${originStr}/${waypoints.map(w => encodeURIComponent(w)).join('/')}/${destStr}`
          : `https://www.google.com/maps/dir/${originStr}/${destStr}`,
        icon: '🗺️'
      },
      {
        name: 'Waze',
        url: `https://waze.com/ul?ll=${origin.lat},${origin.lng}&navigate=yes&q=${destStr}`,
        icon: '🚗'
      }
    ];

    // Add Apple Maps for iOS devices
    if (platform.isIOS) {
      apps.splice(1, 0, {
        name: 'Apple Maps',
        url: waypoints && waypoints.length > 0
          ? `https://maps.apple.com/?saddr=${originStr}&daddr=${destStr}&dirflg=d`
          : `https://maps.apple.com/?saddr=${originStr}&daddr=${destStr}`,
        icon: '🍎',
        condition: true
      });
    }

    return apps;
  }

  static async openNavigation(app: NavigationApp): Promise<boolean> {
    try {
      // Try to open in the native app first (mobile)
      if (this.detectPlatform().isMobile) {
        const nativeUrls: Record<string, string> = {
          'Google Maps': app.url.replace('https://www.google.com/maps', 'comgooglemaps://'),
          'Apple Maps': app.url,
          'Waze': app.url.replace('https://waze.com', 'waze://')
        };

        const nativeUrl = nativeUrls[app.name];
        if (nativeUrl && app.name !== 'Apple Maps') {
          // Try native app first
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = nativeUrl;
          document.body.appendChild(iframe);
          
          // Fallback to web version after a short delay
          setTimeout(() => {
            document.body.removeChild(iframe);
            window.open(app.url, '_blank');
          }, 1000);
          
          return true;
        }
      }
      
      // Open web version
      window.open(app.url, '_blank');
      return true;
    } catch (error) {
      console.error('Failed to open navigation app:', error);
      return false;
    }
  }
}