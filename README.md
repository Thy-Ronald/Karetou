# Karetou

Karetou is a mobile application that serves as your gateway to discovering the best local businesses and attractions in Silay City. The app helps users explore nearby places, read reviews, earn loyalty points, and access exclusive promotions.

## Features

- 🏢 **Discover Local Businesses** - Browse and explore businesses in Silay City
- 📍 **Find Nearby Places** - Use location services to find businesses near you
- ⭐ **Reviews & Ratings** - Read and write reviews for businesses
- 🎁 **Loyalty Points System** - Earn points through transactions and interactions
- 🎯 **Exclusive Promotions** - Access special deals and promotions from businesses
- 🗺️ **Navigation** - Get directions to businesses using Google Maps and OpenRouteService
- 📷 **QR Code Scanning** - Scan QR codes for quick access to business information
- 👥 **Social Features** - Follow businesses and see activity feeds
- 🎨 **Dark Mode Support** - Toggle between light and dark themes

## Tech Stack

### Mobile App (Karetou)
- **Framework**: React Native with Expo (~53.0)
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Maps**: React Native Maps with Google Maps API
- **Routing**: OpenRouteService API
- **State Management**: React Context API
- **UI Components**: Custom responsive components

### Admin Panel
- **Framework**: React with TypeScript
- **Build Tool**: Create React App
- **Backend**: Firebase Admin SDK

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Firebase account** with a project set up
- **Google Maps API key**
- **OpenRouteService API key**

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CAPSTONE
   ```

2. **Install dependencies for the mobile app**
   ```bash
   cd Karetou
   npm install
   ```

3. **Install dependencies for the admin panel** (optional)
   ```bash
   cd ../admin-panel
   npm install
   ```

## Environment Variables Setup

The application requires environment variables for API keys and Firebase configuration. **All API keys must be provided via environment variables** - hardcoded values have been removed for security.

### Mobile App (Karetou)

Create a `.env` file in the `Karetou` directory with the following variables:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# OpenRouteService API Key
EXPO_PUBLIC_ORS_API_KEY=your_ors_api_key
```

**Note**: Alternative variable names without the `EXPO_PUBLIC_` prefix are also supported for compatibility.

### Production Deployment

For production builds, use **EAS Secrets** instead of a `.env` file:

```bash
# Set secrets using EAS CLI
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value your_value
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value your_value
eas secret:create --scope project --name EXPO_PUBLIC_ORS_API_KEY --value your_value
# ... repeat for all required variables
```

### Admin Panel

Create a `.env` file in the `admin-panel` directory:

```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Running the Application

### Mobile App

1. **Start the development server**
   ```bash
   cd Karetou
   npm start
   ```

2. **Run on specific platform**
   ```bash
   # Android
   npm run android

   # iOS (macOS only)
   npm run ios

   # Web
   npm run web
   ```

### Admin Panel

1. **Start the development server**
   ```bash
   cd admin-panel
   npm start
   ```

2. The admin panel will open at `http://localhost:3000`

## Project Structure

```
CAPSTONE/
├── Karetou/                 # Mobile application
│   ├── screens/            # Screen components
│   │   └── userScreens/    # User-facing screens
│   │       └── businessOwnerScreens/  # Business owner screens
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React Context providers
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── assets/             # Images and media files
│   ├── app.config.js       # Expo configuration
│   ├── firebase.ts         # Firebase initialization
│   └── package.json
├── admin-panel/            # Admin web panel
│   ├── src/
│   │   ├── pages/          # Admin pages
│   │   ├── components/     # React components
│   │   └── contexts/       # Context providers
│   └── package.json
└── functions/              # Firebase Cloud Functions (if applicable)
```

## Key Files

- `Karetou/firebase.ts` - Firebase configuration and initialization
- `Karetou/app.config.js` - Expo app configuration with environment variables
- `Karetou/App.js` - Main app entry point with navigation setup
- `admin-panel/src/firebase.ts` - Admin panel Firebase configuration

## Security Notes

- ⚠️ **Never commit `.env` files** - They are already in `.gitignore`
- ⚠️ **Never commit API keys** - All keys must be provided via environment variables
- ⚠️ **Use EAS Secrets for production** - Environment variables in `.env` files are for development only

## Troubleshooting

### Firebase Configuration Errors

If you see errors about missing Firebase configuration:
1. Verify your `.env` file exists in the correct directory
2. Check that all required environment variables are set
3. Restart the Expo development server after creating/updating `.env`
4. For production builds, ensure EAS Secrets are properly configured

### API Key Errors

- **Google Maps**: Ensure the API key has the necessary APIs enabled (Maps SDK, Directions API)
- **OpenRouteService**: Verify your API key is valid and has sufficient quota
- **Firebase**: Check that your Firebase project is active and the configuration matches

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all environment variables are properly configured
4. Test on both development and production environments
5. Submit a pull request

## License

© 2025 Karetou. All rights reserved.

## Support

For issues and questions, please contact the development team or create an issue in the repository.

