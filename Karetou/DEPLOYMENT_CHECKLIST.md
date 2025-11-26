# 📱 Karetou Mobile App - Pre-Deployment Checklist

## ✅ Configuration Files Status

### Current Status:
- ✅ `app.config.js` - Configured (converted from app.json, supports environment variables)
- ✅ `package.json` - Configured  
- ✅ `eas.json` - Configured
- ✅ App icon exists (`assets/logo3.png`)
- ✅ `.env.example` - Created (template for environment variables)
- ✅ `.env` - Created with Firebase, Google Maps, and ORS API keys
- ✅ `dotenv` package - Installed
- ✅ Firebase configuration - Updated to read from environment variables
- ✅ Google Maps API key - Moved to environment variables
- ✅ OpenRouteService API key - Moved to environment variables

---

## 🔴 CRITICAL - Must Do Before Deployment

### 1. **Security & API Keys** ⚠️ HIGH PRIORITY

#### Firebase Configuration
- [x] **MOVE Firebase API keys to environment variables** ✅ COMPLETED
  - ✅ Created `app.config.js` to support environment variables
  - ✅ Updated `firebase.ts` to read from `Constants.expoConfig.extra.firebase`
  - ✅ Created `.env.example` template file
  - ✅ Installed `dotenv` package
  - ✅ Created `.env` file with Firebase configuration
  - **Action Required**: 
    - [x] Create `.env` file manually ✅ COMPLETED
      - ✅ `.env` file created with all Firebase API keys
      - ✅ Google Maps API key included
      - ✅ File is in `.gitignore` (secure)
    - [x] **For production builds, set up EAS Environment Variables** ✅ COMPLETED
      - ✅ Created all 9 environment variables using `eas env:create`
      - ✅ All variables set with `--visibility sensitive` (required for EXPO_PUBLIC_ variables)
      - ✅ All variables configured for `production` environment
      - ✅ Variables created:
        - EXPO_PUBLIC_FIREBASE_API_KEY
        - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
        - EXPO_PUBLIC_FIREBASE_PROJECT_ID
        - EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
        - EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
        - EXPO_PUBLIC_FIREBASE_APP_ID
        - EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
        - EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        - EXPO_PUBLIC_ORS_API_KEY
      - ✅ Verified with `eas env:list` - all 9 variables present

#### Google Maps API Key
- [x] **Move Google Maps API Key to environment variables** ✅ COMPLETED
  - ✅ Updated `app.config.js` to read from `.env`
  - ✅ Updated `Navigate.tsx` to use environment variable
  - ✅ Created `GOOGLE_MAPS_API_VERIFICATION.md` guide
  - **Action Required**:
    - [ ] **Verify Google Maps API Key is production-ready**
      - Current key: `AIzaSyByXb-FgYHiNhVIsK00kM1jdXYr_OerV7Q`
      - [ ] Check API key restrictions (should allow your app bundle IDs)
        - See `GOOGLE_MAPS_API_VERIFICATION.md` for detailed steps
      - [ ] Verify billing is enabled for Google Maps API
      - [ ] Ensure API key has proper permissions (Maps SDK, Places API, etc.)
      - [ ] Enable required APIs in Google Cloud Console:
        - Maps SDK for Android
        - Directions API
        - Places API
        - Geocoding API

#### OpenRouteService API Key
- [x] **Move OpenRouteService API Key to environment variables** ✅ COMPLETED
  - ✅ Updated `Navigate.tsx` to use environment variable
  - ✅ Updated `app.config.js` to include ORS API key
  - ✅ Added to `.env` file
  - **Action Required**:
    - [ ] **Review ORS API Key usage**
      - Current key: `5b3ce3597851110001cf6248e6a2bc17f1e244d5bdc5cd334e10232b`
      - [ ] Check if this is a production key or test key
      - [ ] Verify API rate limits and billing
      - [ ] Review OpenRouteService account status
      - [ ] Check if key needs to be rotated for production

### 2. **App Configuration**

#### Version & Build Numbers
- [x] **Verify version numbers** ✅ VERIFIED
  - Current version: `1.0.0` (in both `app.config.js` and `package.json`) ✅
  - **Action Required**:
    - [ ] Decide on versioning strategy (semantic versioning recommended)
      - Current: `1.0.0` (initial release)
      - Consider: `1.0.0` for first production release
    - [ ] Update build numbers for Android (will be set during EAS build)
      - Android: Auto-incremented by EAS

#### Bundle Identifiers
- [x] **Verify bundle identifiers are correct** ✅ VERIFIED
  - Android Package: `com.karetou.app` ✅
  - **Action Required**:
    - [ ] Ensure package name matches your Google Play Console account
      - Register package name in Google Play Console before Android submission
    - [ ] Check if package name is already registered
      - If already registered, ensure you have access to it
      - If not registered, register it in Google Play Console

#### App Name & Display
- [x] **Verify app display name**: "Karetou" ✅ VERIFIED
- [x] **Check app slug**: "Karetou" (used for Expo URLs) ✅ VERIFIED

### 3. **Assets & Icons**

#### App Icons
- [x] **Verify all icon sizes are present** ✅ VERIFIED
  - Main icon: `assets/logo3.png` ✅ (exists)
  - Current dimensions: `256x256` ⚠️
  - **Action Required**:
    - [x] **Resize icon to 1024x1024 for production** ✅ COMPLETED
      - Icon has been resized to meet production requirements ✅
    - [ ] Verify Android adaptive icon requirements
      - Android adaptive icon configured: ✅ (uses logo3.png)
      - Ensure icon looks good on Android devices
    - [ ] Verify Android adaptive icon requirements
      - Android adaptive icon configured: ✅ (uses logo3.png)
      - Background color: `#ffffff` ✅

#### Splash Screen
- [x] **Verify splash screen**: `assets/Logo2.png` ✅ VERIFIED
  - File exists: ✅
  - Background color: `#ffffff` ✅
  - Resize mode: `contain` ✅
  - **Action Required**:
    - [ ] Check splash screen dimensions and quality
      - Recommended: 1242x2436 (iPhone) or 2048x2732 (iPad)
      - Or use a vector/SVG that scales well

#### Other Assets
- [x] **Notification icon**: `assets/logo.png` ✅ VERIFIED
- [x] **Web favicon**: `assets/favicon.png` ✅ VERIFIED

### 4. **Permissions & Privacy**

#### Location Permissions
- [x] **Review location permission message** ✅ VERIFIED
  - Current: "Allow Karetou to use your location to show nearby places and provide navigation." ✅
  - Message is clear and descriptive ✅
  - **Action Required**:
    - [ ] Ensure message complies with Google Play Store policies
      - ✅ Message explains why location is needed
      - ✅ Message is user-friendly
    - [ ] Android location permissions are configured via expo-location plugin ✅
      - The `locationAlwaysAndWhenInUsePermission` is set in `app.config.js`
      - Expo will automatically configure Android permissions during build

#### Camera Permissions
- [x] **Review camera permission message** ✅ VERIFIED
  - Current: "Allow Karetou to access your camera to scan QR codes." ✅
  - Message is clear and explains the purpose ✅
  - **Action Required**:
    - [ ] Verify this is appropriate for your use case
      - ✅ Message explains QR code scanning purpose
      - ✅ Aligned with app functionality

#### Notification Permissions
- [x] **Verify notification configuration** ✅ VERIFIED
  - Icon: `./assets/logo.png` ✅
  - Color: `#667eea` ✅
  - Default channel: "default" ✅
  - All notification settings are properly configured ✅

### 5. **Platform-Specific Requirements** (Android Only)

#### Android Deployment
- [x] **Google Play Console** ✅ ACCOUNT EXISTS
  - [x] Google Play Developer account ✅ (Already have account)
  - **Action Required**:
    - [ ] Create app listing in Google Play Console
      - Go to Google Play Console → Create app
      - Enter app name: "Karetou"
      - Select default language
      - Choose app type: App
      - Select free or paid
    - [ ] Register package name: `com.karetou.app`
      - Verify package name is available
      - Register it in Play Console
    - [ ] Generate signing key (keystore) for production
      - EAS can auto-generate, or you can provide your own
      - If providing your own, ensure it's securely backed up
    - [ ] Configure app signing in Google Play Console
      - Use Google Play App Signing (recommended)
      - Upload signing key or let Google manage it

#### EAS Build Configuration
- [x] **Review `eas.json`** ✅ UPDATED
  - Development build: ✅ Configured (APK format)
  - Preview build: ✅ Configured (APK format)
  - Production build: ✅ Configured (App Bundle format)
  - ✅ Environment variables structure added for production builds
  - **Action Required**:
    - [x] **Set up EAS Environment Variables for production** ✅ COMPLETED
      - ✅ All 9 environment variables created using `eas env:create`
      - ✅ All variables configured for `production` environment with `--visibility sensitive`
      - ✅ Verified with `eas env:list` - all variables present and ready for production builds
    - [ ] Configure Google Play service account for submission (optional)
      - Download service account JSON from Google Play Console
      - Save as `google-service-account.json` (add to .gitignore)

### 6. **Code Quality & Optimization**

#### Performance
- [x] **Remove console.log statements** (or use babel plugin) ✅ CONFIGURED
  - Current: `babel-plugin-transform-remove-console` is in devDependencies ✅
  - ✅ Verified it's configured in `babel.config.js`
    - Plugin is set to remove console.log in production builds
    - console.error and console.warn are preserved for debugging
  - **Action Required**:
    - [ ] Test production build to ensure logs are removed
      - Run: `eas build --platform android --profile production`
      - Verify no console.log statements in production build

#### Error Handling
- [ ] **Review error handling**:
  - [ ] Check all API calls have proper error handling
  - [ ] Verify user-friendly error messages
  - [ ] Test offline scenarios

#### Testing
- [ ] **Test on real Android devices**:
  - [ ] Android device testing
  - [ ] Test all major features
  - [ ] Test on different Android screen sizes
  - [ ] Test on different Android OS versions (Android 8.0+)

### 7. **Firebase Backend**

#### Firebase Services
- [x] **Verify Firebase services are configured** ✅ VERIFIED
  - ✅ Authentication: Configured in `firebase.ts` (Email/Password)
    - `export const auth = getAuth(app);` ✅
  - ✅ Firestore Database: Configured in `firebase.ts`
    - `export const db = getFirestore(app);` ✅
  - ✅ Storage: Configured in `firebase.ts`
    - `export const storage = getStorage(app);` ✅
  - **Action Required**:
    - [ ] **Verify services are enabled in Firebase Console**:
      - 📄 See `FIREBASE_SERVICES_VERIFICATION.md` for detailed guide
      - Go to Firebase Console → Project Settings
      - Verify Authentication is enabled (Email/Password)
      - Verify Firestore Database is created and active
      - Verify Storage is enabled
      - Check that all services are in production mode
    - [ ] Check Cloud Functions (if used):
      - Review if any Cloud Functions are needed
      - Deploy functions if required

#### Security Rules
- [x] **Review Firestore security rules** ✅ IN PROGRESS
  - ✅ Rules file created (`firestore.rules`)
  - ✅ Rules deployed to Firebase Console
  - [ ] Test rules don't allow unauthorized access (test after deployment)
  - [ ] Verify rules are optimized for performance

- [ ] **Review Storage security rules**:
  - 📄 `storage.rules` file created with recommended rules
  - [ ] Deploy Storage rules to Firebase Console
    - Go to: Firebase Console → Storage → Rules
    - Copy content from `storage.rules`
    - Paste and click "Publish"
  - [ ] Ensure proper access controls
  - [ ] Verify file size limits (5MB for profiles, 10MB for businesses/posts)
  - [ ] Check allowed file types (images only)

#### Database
- [ ] **Backup production data** (if migrating from dev)
- [ ] **Verify indexes** are created for all queries
  - 📄 See `FIRESTORE_INDEXES_GUIDE.md` for detailed instructions
  - Check Firebase Console → Firestore → Indexes
  - Common indexes needed:
    - `notifications`: userId (Asc), createdAt (Desc)
    - `businesses`: status (Asc), displayInUserApp (Asc)
    - `promotions`: displayInUserApp (Asc), isActive (Asc)
- [ ] **Review data structure** for production readiness

### 8. **Third-Party Services**

#### Google Maps
- [ ] **Verify Google Maps SDK is properly configured**
- [ ] **Check API quotas and limits**
- [ ] **Enable required APIs**:
      - Maps SDK for Android
      - Places API
      - Directions API
      - Geocoding API

#### OpenRouteService
- [ ] **Verify ORS API key is production-ready**
- [ ] **Check rate limits**
- [ ] **Test routing functionality**

### 9. **App Store Listings** (Google Play Store)

#### Google Play Store (Android)
- [ ] **Prepare Play Store assets**:
  - [ ] App screenshots (phone, tablet, TV)
  - [ ] Feature graphic (1024x500)
  - [ ] App description
  - [ ] Short description
  - [ ] Privacy policy URL
  - [ ] Support URL

### 10. **Privacy & Compliance**

#### Privacy Policy
- [ ] **Create privacy policy**:
  - [ ] Must cover data collection (location, camera, etc.)
  - [ ] Must explain how data is used
  - [ ] Must comply with GDPR (if EU users), CCPA (if CA users)
  - [ ] Host privacy policy online
  - [ ] Add privacy policy URL to Google Play Store

#### Terms of Service
- [ ] **Create terms of service** (recommended)
- [ ] Host terms online
- [ ] Link in app (optional but recommended)

#### Data Collection
- [ ] **Document all data collected**:
  - Location data
  - User authentication data
  - Business data
  - Images/photos
  - [ ] Ensure compliance with Google Play Store policies

### 11. **Build & Distribution**

#### Pre-Build Checks
- [ ] **Run production build locally**:
  ```bash
  eas build --platform android --profile production
  ```
- [ ] **Test production builds** on Internal Testing (Android)
- [ ] **Verify all features work** in production builds

#### App Signing
- [ ] **Android**: Generate and secure keystore
  - EAS can auto-generate keystore, or you can provide your own
  - If using your own, ensure it's securely backed up
- [ ] **Backup signing keys** securely
  - Store keystore file in secure location
  - Never commit keystore to version control

### 12. **Monitoring & Analytics**

#### Crash Reporting
- [ ] **Set up crash reporting**:
  - [ ] Consider Sentry, Firebase Crashlytics, or similar
  - [ ] Test crash reporting works

#### Analytics
- [ ] **Set up analytics** (optional but recommended):
  - [ ] Firebase Analytics
  - [ ] Or other analytics service
  - [ ] Verify events are tracked correctly

### 13. **Final Checks**

#### Before Submission
- [ ] **Remove all test/development code**
- [ ] **Remove console.log statements** (or ensure they're stripped)
- [ ] **Test app on clean install** (not from development)
- [ ] **Verify app works offline** (if required)
- [ ] **Check app size** (optimize if too large)
- [ ] **Test app updates** (if updating existing app)

#### Submission
- [ ] **Google Play Store**:
  - [ ] Upload AAB (Android App Bundle) - recommended format
  - [ ] Complete store listing with all required information
  - [ ] Add screenshots, descriptions, and graphics
  - [ ] Submit for review
  - [ ] Monitor review status and respond to any feedback

---

## 📝 Recommended Actions (Priority Order)

### 🔴 **IMMEDIATE (Before any build)**
1. Move Firebase API keys to environment variables
2. Verify Google Maps API key restrictions and billing
3. Review and secure all API keys
4. Test production build locally

### 🟡 **HIGH PRIORITY (Before submission)**
1. Create privacy policy and terms of service
2. Prepare app store assets (screenshots, descriptions)
3. Set up crash reporting
4. Remove console.logs from production
5. Test on real devices

### 🟢 **MEDIUM PRIORITY (Can do after initial release)**
1. Set up analytics
2. Optimize app size
3. Add app preview videos
4. Set up monitoring dashboards

---

## 🛠️ Quick Commands

### Build for Production (Android)
```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android --profile production
```

### Test Production Build
```bash
# Install on device via Internal Testing (Android)
# Or download build artifact (AAB) and install manually
# Use: adb install app-release.aab (after converting or using bundle tool)
```

### Submit to Google Play Store
```bash
# Android (after Play Console setup)
eas submit --platform android
```

---

## 📚 Resources

- [Expo Deployment Guide](https://docs.expo.dev/distribution/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

---

## ⚠️ Security Notes

**CRITICAL**: Currently, your Firebase API keys and Google Maps API key are visible in the codebase. For production:

1. **Use EAS Secrets** for sensitive keys:
   ```bash
   eas secret:create --scope project --name FIREBASE_API_KEY --value "your-key"
   ```

2. **Update `firebase.ts`** to read from environment:
   ```typescript
   const firebaseConfig = {
     apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || Constants.expoConfig?.extra?.firebaseApiKey,
     // ... other config
   };
   ```

3. **Restrict API keys** in Google Cloud Console to only allow your app bundle IDs.

---

**Last Updated**: Based on current codebase analysis
**Next Review**: Before each production deployment

