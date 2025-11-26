import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Firebase configuration from environment variables
// Reads from app.config.js -> extra.firebase (set via .env or EAS Secrets)
const firebaseConfigFromEnv = Constants.expoConfig?.extra?.firebase;

// Fallback to hardcoded values only if environment variables are not set
// This ensures backward compatibility during transition
const firebaseConfig = firebaseConfigFromEnv || {
    apiKey: "AIzaSyByXb-FgYHiNhVIsK00kM1jdXYr_OerV7Q",
    authDomain: "karetou-cfd5b.firebaseapp.com",
    projectId: "karetou-cfd5b",
    storageBucket: "karetou-cfd5b.firebasestorage.app",
    messagingSenderId: "40950648608",
    appId: "1:40950648608:web:91b4f1733a28173d2c9145",
    measurementId: "G-D4V96GLYED"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth - Firebase v11 automatically handles React Native persistence
// ReactNativeAsyncStorage is imported but not needed explicitly in v11
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);