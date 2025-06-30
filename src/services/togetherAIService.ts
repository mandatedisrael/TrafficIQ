interface TogetherAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface TrafficAnalysisRequest {
  currentTraffic: any[];
  userLocation: { lat: number; lng: number };
  destination?: string;
  timeOfDay: string;
  weatherConditions?: string;
}

interface AITrafficInsight {
  severity: 'low' | 'moderate' | 'high' | 'severe';
  confidence: number;
  summary: string;
  recommendations: string[];
  predictedCongestion: number;
  bestTimeToTravel: string;
  alternativeRoutesSuggestion: string;
  estimatedDelay: number;
}

export class TogetherAIService {
  private static readonly API_URL = 'https://api.together.xyz/v1/chat/completions';
  private static readonly MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';
  
  private static getApiKey(): string {
    // In production, this should be from environment variables
    const apiKey = import.meta.env.VITE_TOGETHER_API_KEY;
    if (!apiKey) {
      throw new Error('Together AI API key not found. Please add VITE_TOGETHER_API_KEY to your environment variables.');
    }
    return apiKey;
  }

  static async analyzeTrafficConditions(request: TrafficAnalysisRequest): Promise<AITrafficInsight> {
    try {
      const prompt = this.buildTrafficAnalysisPrompt(request);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert traffic analyst AI with deep knowledge of traffic patterns, route optimization, and transportation systems. Provide detailed, actionable traffic insights based on real-time data.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`Together AI API error: ${response.status}`);
      }

      const data: TogetherAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response content from Together AI');
      }

      // Parse the JSON response
      const analysis = JSON.parse(content);
      return this.validateAndFormatResponse(analysis);
      
    } catch (error) {
      console.error('Together AI analysis failed:', error);
      // Return fallback analysis
      return this.getFallbackAnalysis();
    }
  }

  static async optimizeRoute(currentRoute: any, trafficData: any[], userPreferences: any): Promise<string> {
    try {
      const prompt = `
        Analyze this route and current traffic data to provide optimization suggestions:
        
        Current Route: ${JSON.stringify(currentRoute, null, 2)}
        Traffic Data: ${JSON.stringify(trafficData, null, 2)}
        User Preferences: ${JSON.stringify(userPreferences, null, 2)}
        
        Provide specific, actionable route optimization recommendations considering:
        - Current traffic conditions
        - Time savings potential
        - Alternative route options
        - User preferences (fastest, shortest, avoid tolls, etc.)
        
        Format your response as practical advice that a driver can immediately act on.
      `;

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a route optimization expert. Provide clear, actionable driving recommendations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.6
        })
      });

      const data: TogetherAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate route optimization at this time.';
      
    } catch (error) {
      console.error('Route optimization failed:', error);
      return 'Route optimization temporarily unavailable. Please try again later.';
    }
  }

  static async predictTrafficTrends(historicalData: any[], currentConditions: any): Promise<any> {
    try {
      const prompt = `
        Based on this traffic data, predict traffic trends for the next 2-4 hours:
        
        Historical Patterns: ${JSON.stringify(historicalData, null, 2)}
        Current Conditions: ${JSON.stringify(currentConditions, null, 2)}
        
        Provide predictions in JSON format with:
        {
          "nextHour": { "congestion": number, "confidence": number },
          "next2Hours": { "congestion": number, "confidence": number },
          "next4Hours": { "congestion": number, "confidence": number },
          "peakTime": "HH:MM",
          "reasoning": "explanation of prediction factors"
        }
      `;

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a traffic prediction specialist. Analyze patterns and provide accurate forecasts.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 600,
          temperature: 0.5,
          response_format: { type: 'json_object' }
        })
      });

      const data: TogetherAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      
      return content ? JSON.parse(content) : this.getFallbackPrediction();
      
    } catch (error) {
      console.error('Traffic prediction failed:', error);
      return this.getFallbackPrediction();
    }
  }

  private static buildTrafficAnalysisPrompt(request: TrafficAnalysisRequest): string {
    const { currentTraffic, userLocation, destination, timeOfDay, weatherConditions } = request;
    
    return `
      Analyze current traffic conditions and provide intelligent insights:
      
      Current Traffic Data: ${JSON.stringify(currentTraffic, null, 2)}
      User Location: ${userLocation.lat}, ${userLocation.lng}
      ${destination ? `Destination: ${destination}` : ''}
      Time of Day: ${timeOfDay}
      ${weatherConditions ? `Weather: ${weatherConditions}` : ''}
      
      Please provide a comprehensive traffic analysis in the following JSON format:
      {
        "severity": "low|moderate|high|severe",
        "confidence": 0.0-1.0,
        "summary": "Brief overview of current traffic situation",
        "recommendations": ["specific actionable advice"],
        "predictedCongestion": 0-100,
        "bestTimeToTravel": "HH:MM format or description",
        "alternativeRoutesSuggestion": "AI recommendation for route alternatives",
        "estimatedDelay": 0-60
      }
      
      Focus on practical, actionable insights that help users make better travel decisions.
    `;
  }

  private static validateAndFormatResponse(analysis: any): AITrafficInsight {
    return {
      severity: analysis.severity || 'moderate',
      confidence: Math.min(Math.max(analysis.confidence || 0.7, 0), 1),
      summary: analysis.summary || 'Traffic analysis completed',
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : ['Check traffic before traveling'],
      predictedCongestion: Math.min(Math.max(analysis.predictedCongestion || 50, 0), 100),
      bestTimeToTravel: analysis.bestTimeToTravel || 'Now',
      alternativeRoutesSuggestion: analysis.alternativeRoutesSuggestion || 'Consider alternative routes',
      estimatedDelay: Math.min(Math.max(analysis.estimatedDelay || 0, 0), 60)
    };
  }

  private static getFallbackAnalysis(): AITrafficInsight {
    return {
      severity: 'moderate',
      confidence: 0.6,
      summary: 'Traffic analysis temporarily unavailable. Using basic traffic data.',
      recommendations: ['Check current traffic conditions', 'Allow extra travel time'],
      predictedCongestion: 45,
      bestTimeToTravel: 'Now',
      alternativeRoutesSuggestion: 'Consider checking alternative routes',
      estimatedDelay: 5
    };
  }

  private static getFallbackPrediction(): any {
    return {
      nextHour: { congestion: 50, confidence: 0.6 },
      next2Hours: { congestion: 45, confidence: 0.5 },
      next4Hours: { congestion: 40, confidence: 0.4 },
      peakTime: "17:30",
      reasoning: "Prediction service temporarily unavailable"
    };
  }
} 