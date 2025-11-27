// app.config.js - Supports environment variables
// For development: Create a .env file with your Firebase config
// For production: Use EAS Secrets (eas secret:create)

require('dotenv').config();

module.exports = {
  expo: {
    name: "Karetou",
    slug: "Karetou",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/logo3.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/Logo2.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      bundleIdentifier: "com.karetou.app",
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logo4.png",
        backgroundColor: "#ffffff"
      },
      package: "com.karetou.app",
      versionCode: 2,
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "AIzaSyByXb-FgYHiNhVIsK00kM1jdXYr_OerV7Q"
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "da892a88-29d0-488c-9043-83188426f1c2"
      },
      // Firebase configuration from environment variables
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "AIzaSyByXb-FgYHiNhVIsK00kM1jdXYr_OerV7Q",
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "karetou-cfd5b.firebaseapp.com",
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "karetou-cfd5b",
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "karetou-cfd5b.firebasestorage.app",
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "40950648608",
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "1:40950648608:web:91b4f1733a28173d2c9145",
        measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID || "G-D4V96GLYED"
      },
      // Google Maps API Key
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "AIzaSyByXb-FgYHiNhVIsK00kM1jdXYr_OerV7Q",
      // OpenRouteService API Key
      orsApiKey: process.env.EXPO_PUBLIC_ORS_API_KEY || process.env.ORS_API_KEY || "5b3ce3597851110001cf6248e6a2bc17f1e244d5bdc5cd334e10232b"
    },
    scheme: "karetou",
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow Karetou to use your location to show nearby places and provide navigation."
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/logo4.png",
          color: "#667eea",
          defaultChannel: "default"
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow Karetou to access your camera to scan QR codes."
        }
      ],
      "expo-video",
      "expo-asset"
    ]
  }
};

