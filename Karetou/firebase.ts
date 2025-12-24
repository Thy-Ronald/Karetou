import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Firebase configuration from environment variables
// Reads from app.config.js -> extra.firebase (set via .env or EAS Secrets)
const firebaseConfigFromEnv = Constants.expoConfig?.extra?.firebase;

// Validate that Firebase config is provided via environment variables
if (!firebaseConfigFromEnv) {
    throw new Error(
        'Firebase configuration is missing. Please set environment variables:\n' +
        'EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, ' +
        'EXPO_PUBLIC_FIREBASE_PROJECT_ID, EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET, ' +
        'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, EXPO_PUBLIC_FIREBASE_APP_ID, ' +
        'EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID\n' +
        'Create a .env file in the Karetou directory or use EAS Secrets for production.'
    );
}

const firebaseConfig = firebaseConfigFromEnv;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth - Firebase v11 automatically handles React Native persistence
// ReactNativeAsyncStorage is imported but not needed explicitly in v11
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);