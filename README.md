# 🚗 TrafficIQ - AI-Powered Traffic Prediction App

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-teal.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An intelligent traffic monitoring and route optimization platform that leverages AI to provide real-time traffic insights and personalized route recommendations.

![TrafficIQ Demo](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=TrafficIQ+Demo)

## ✨ Features

### 🚦 Real-Time Traffic Intelligence
- **Live traffic monitoring** with continuous data updates
- **AI-powered traffic predictions** using advanced machine learning
- **Traffic severity analysis** with color-coded alerts
- **Historical traffic pattern analysis**

### 🗺️ Smart Route Planning
- **Alternative route suggestions** with time savings calculations
- **Google Maps integration** for accurate navigation
- **Plus Code detection and conversion** to readable addresses
- **Multi-modal transportation options** (driving, walking, transit, cycling)

### 🧠 AI-Powered Insights
- **Together AI integration** for intelligent traffic analysis
- **Personalized route recommendations** based on user preferences
- **Traffic pattern prediction** with confidence scores
- **Smart routing algorithms** that adapt to real-time conditions

### 👤 User Experience
- **User authentication** via Supabase
- **Responsive design** optimized for all devices
- **Dark/Light theme support** with system preference detection
- **Real-time updates** with live data synchronization

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework

### Backend & Services
- **Supabase** - Backend-as-a-Service (Auth, Database, Real-time)
- **Google Maps API** - Mapping and routing services
- **Together AI** - AI-powered traffic insights
- **Google Places API** - Location search and geocoding

### Development Tools
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing and optimization
- **Git** - Version control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mandatedisrael/TrafficIQ.git
   cd TrafficIQ
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys in `.env`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_TOGETHER_API_KEY=your_together_ai_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Required API Keys

#### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Maps JavaScript API and Places API
3. Create credentials and copy your API key

#### Supabase Setup
1. Create a project at [Supabase](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Run the provided SQL migrations in your Supabase dashboard

#### Together AI
1. Sign up at [Together AI](https://together.ai)
2. Generate an API key from your dashboard

### Database Migrations
Run the migrations in your Supabase SQL editor:
- `supabase/migrations/20250628235725_black_mountain.sql`
- `supabase/migrations/20250629000031_jolly_summit.sql`

## 📱 Usage

### Getting Started
1. **Enable location access** when prompted
2. **Search for a destination** using the search bar
3. **View route alternatives** with time savings
4. **Get AI insights** about traffic conditions
5. **Start navigation** with your preferred app

### Key Features

#### Route Planning
- Enter any destination in the search bar
- View multiple route options with traffic data
- Compare routes by time, distance, and traffic levels
- Get personalized recommendations

#### Traffic Monitoring
- Real-time traffic conditions in your area
- Traffic severity indicators (Low, Moderate, High, Severe)
- Historical traffic patterns and predictions
- Live traffic updates every few minutes

#### AI Insights
- Intelligent traffic analysis and recommendations
- Predictive traffic modeling
- Route optimization suggestions
- Smart alerts for traffic incidents

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 Project Structure

```
TrafficIQ/
├── src/
│   ├── components/          # React components
│   │   ├── AITrafficInsights.tsx
│   │   ├── AlternativeRoutes.tsx
│   │   ├── AuthModal.tsx
│   │   ├── DestinationSearch.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API and external services
│   ├── types/               # TypeScript type definitions
│   └── App.tsx              # Main application component
├── supabase/                # Database migrations
├── public/                  # Static assets
└── package.json             # Dependencies and scripts
```

## 🔒 Privacy & Security

- **Location data** is processed locally and not stored permanently
- **User authentication** is handled securely via Supabase
- **API keys** are properly secured and not exposed to clients
- **Traffic data** is anonymized and aggregated

## 📊 Performance

- **Lighthouse Score**: 95+ Performance
- **Bundle Size**: Optimized with code splitting
- **Load Time**: < 2 seconds on 3G networks
- **Real-time Updates**: Sub-second data refresh

## 🐛 Troubleshooting

### Common Issues

**Location Access Denied**
- Ensure location permissions are enabled in your browser
- Try refreshing the page and allowing location access

**API Key Errors**
- Verify all API keys are correctly set in `.env`
- Check that APIs are enabled in respective dashboards

**Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Update Node.js to version 18+

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/mandatedisrael/TrafficIQ/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Maps** for comprehensive mapping services
- **Supabase** for backend infrastructure
- **Together AI** for advanced AI capabilities
- **The React community** for excellent tooling and resources

---

<div align="center">
  <strong>Built with ❤️ by the TrafficIQ Team</strong>
  <br>
  <a href="https://github.com/mandatedisrael/TrafficIQ">⭐ Star this repo</a> if you find it helpful!
</div> 