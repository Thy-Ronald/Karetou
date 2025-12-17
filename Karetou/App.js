import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { enableScreens } from 'react-native-screens';

// Enable screens for better performance
enableScreens();
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/userScreens/Login';
import SignupScreen from './screens/userScreens/SignupScreen';
import EmailVerificationScreen from './screens/userScreens/EmailVerificationScreen';
import MainTabNavigator from './components/MainTabNavigator';
import { SearchBarScreen } from './screens/userScreens/SearchBarScreen';
import ReviewsScreen from './screens/userScreens/ReviewsScreen';
import BusinessSignUp from './screens/userScreens/businessOwnerScreens/BusinessSignUp';
import BusinessHomeScreen from './screens/userScreens/businessOwnerScreens/BusinessHomeScreen';
import BusinessTabNavigator from './components/BusinessTabNavigator';
import RegisterBusinessScreen from './screens/userScreens/businessOwnerScreens/RegisterBusinessScreen';
import EditBusinessScreen from './screens/userScreens/businessOwnerScreens/EditBusinessScreen';
import BusinessIDVerification from './screens/userScreens/businessOwnerScreens/BusinessIDVerification';
import BusinessLocation from './screens/userScreens/businessOwnerScreens/BusinessLocation';
import MyPostsScreen from './screens/userScreens/businessOwnerScreens/MyPostsScreen';
import MyBusinessScreen from './screens/userScreens/businessOwnerScreens/MyBusinessScreen';
import PromotionsScreen from './screens/userScreens/businessOwnerScreens/PromotionsScreen';
import NotificationScreen from './screens/userScreens/NotificationScreen';
import DiscoverSilayScreen from './screens/userScreens/DiscoverSilayScreen';
import QRScannerScreen from './screens/userScreens/QRScannerScreen';
import TransactionHistoryScreen from './screens/userScreens/TransactionHistoryScreen';
import BusinessTransactionHistoryScreen from './screens/userScreens/businessOwnerScreens/BusinessTransactionHistoryScreen';
import FollowingListScreen from './screens/userScreens/FollowingListScreen';
import RewardsManagementScreen from './screens/userScreens/businessOwnerScreens/RewardsManagementScreen';


const Stack = createStackNavigator();

const AuthStack = ({ lastUserType }) => {
  // Always use Login screen since it now handles both user and business owner login
  const initialRoute = 'Login';
  
  console.log('🔐 AuthStack - lastUserType:', lastUserType, 'initialRoute:', initialRoute);
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="BusinessSignUp" component={BusinessSignUp} />
    </Stack.Navigator>
  );
};

const UserAppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Main" component={MainTabNavigator} />
    <Stack.Screen name="SearchBarScreen" component={SearchBarScreen} />
    <Stack.Screen name="ReviewsScreen" component={ReviewsScreen} />
    <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
    <Stack.Screen name="DiscoverSilay" component={DiscoverSilayScreen} />
    <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />
    <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen} />
    <Stack.Screen name="FollowingListScreen" component={FollowingListScreen} />
  </Stack.Navigator>
);

const BusinessAppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="BusinessMain" component={BusinessTabNavigator} />
    <Stack.Screen name="RegisterBusiness" component={RegisterBusinessScreen} />
    <Stack.Screen name="EditBusiness" component={EditBusinessScreen} />
    <Stack.Screen name="BusinessIDVerification" component={BusinessIDVerification} />
    <Stack.Screen name="BusinessLocation" component={BusinessLocation} />
    <Stack.Screen name="MyPosts" component={MyPostsScreen} />
    <Stack.Screen name="MyBusiness" component={MyBusinessScreen} />
    <Stack.Screen name="Promotions" component={PromotionsScreen} />
    <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
    <Stack.Screen name="BusinessTransactionHistoryScreen" component={BusinessTransactionHistoryScreen} />
    <Stack.Screen name="RewardsManagement" component={RewardsManagementScreen} />
  </Stack.Navigator>
);

const Navigation = () => {
  const { user, userType, lastUserType, theme } = useAuth();
  
  console.log('🧭 Navigation state - user:', !!user, 'userType:', userType, 'lastUserType:', lastUserType);
  
  if (!user) {
    console.log('📱 No user - showing AuthStack with lastUserType:', lastUserType);
    return <AuthStack lastUserType={lastUserType} />;
  }
  
  // If user is logged in but userType is not set, show auth stack
  if (!userType) {
    console.log('📱 User exists but no userType - showing AuthStack with lastUserType:', lastUserType);
    return <AuthStack lastUserType={lastUserType} />;
  }
  
  // Show appropriate 
  if (userType === 'business') {
    console.log('📱 Business user - showing BusinessAppStack');
    return <BusinessAppStack />;
  }
  
  console.log('📱 Regular user - showing UserAppStack');
  return <UserAppStack />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
    </GestureHandlerRootView>
  );
}

const AppContent = () => {
  const { theme } = useAuth();
  const navigationTheme = theme === 'light' ? DefaultTheme : DarkTheme;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Navigation />
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
    </NavigationContainer>
  );
};
