import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import LoadingImage from '../../components/LoadingImage';
import { useResponsive } from '../../hooks/useResponsive';
import { ResponsiveText, ResponsiveView } from '../../components';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import FollowService from '../../services/FollowService';

interface Business {
  id: string;
  businessName: string;
  businessAddress?: string;
  businessImages?: string[];
  selectedType?: string;
  businessType?: string;
  rating?: number;
  averageRating?: number;
  followersCount?: number;
}

type RootStackParamList = {
  Navigate: { business?: any };
  ReviewsScreen: { businessToView?: any };
};

const FollowingListScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [followedBusinesses, setFollowedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [businessRatings, setBusinessRatings] = useState<{ [businessId: string]: { average: string, count: number } }>({});
  const { theme, user, registerCleanup } = useAuth();
  const followService = FollowService.getInstance();
  
  // Get responsive values
  const responsive = useResponsive();
  const { spacing, fontSizes, iconSizes, borderRadius: borderRadiusValues, getResponsiveWidth, getResponsiveHeight, dimensions, responsiveHeight, responsiveWidth, responsiveFontSize } = responsive;
  
  const isSmallScreen = dimensions?.width < 360;
  const minTouchTarget = 44;
  
  // Calculate header padding
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const headerPaddingTop = Platform.OS === 'ios' 
    ? (spacing?.md || 12) + (spacing?.md || 12)
    : statusBarHeight + (spacing?.sm || 8);
  
  // Calculate header content height (back button + title row)
  const headerContentHeight = minTouchTarget; // Height of the header row with back button and title
  const headerContentMarginBottom = spacing?.sm || 8;
  
  const searchBarHeight = minTouchTarget;
  const searchBarMarginTop = spacing?.sm || 8;
  const headerPaddingBottom = spacing?.md || 12;
  const headerTotalHeight = headerPaddingTop + headerContentHeight + headerContentMarginBottom + searchBarMarginTop + searchBarHeight + headerPaddingBottom;

  const lightGradient = ['#F5F5F5', '#F5F5F5'] as const;
  const darkGradient = ['#232526', '#414345'] as const;

  // Load business ratings
  useEffect(() => {
    if (followedBusinesses.length === 0) return;

    const loadRatings = async () => {
      const ratings: { [businessId: string]: { average: string, count: number } } = {};
      
      await Promise.all(
        followedBusinesses.map(async (business) => {
          try {
            const reviewsRef = collection(db, 'businesses', business.id, 'reviews');
            const reviewsSnapshot = await getDocs(reviewsRef);
            const reviews = reviewsSnapshot.docs.map(doc => doc.data());
            
            if (reviews.length > 0) {
              const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
              const average = (sum / reviews.length).toFixed(1);
              ratings[business.id] = {
                average,
                count: reviews.length,
              };
            } else {
              ratings[business.id] = {
                average: '0.0',
                count: 0,
              };
            }
          } catch (error) {
            console.error('Error loading ratings for business:', business.id, error);
            ratings[business.id] = {
              average: '0.0',
              count: 0,
            };
          }
        })
      );
      
      setBusinessRatings(ratings);
    };

    loadRatings();
  }, [followedBusinesses]);

  // Listen to user's follow list in real-time
  useEffect(() => {
    if (!user?.uid) {
      setFollowedBusinesses([]);
      setLoading(false);
      return;
    }

    const followsRef = collection(db, 'users', user.uid, 'follows');
    const unsubscribe = onSnapshot(followsRef, async (snap) => {
      const businessIds: string[] = [];
      snap.forEach((doc) => businessIds.push(doc.id));

      if (businessIds.length === 0) {
        setFollowedBusinesses([]);
        setLoading(false);
        return;
      }

      // Fetch business details for all followed businesses
      const businesses: Business[] = [];
      await Promise.all(
        businessIds.map(async (businessId) => {
          try {
            const businessDoc = await getDoc(doc(db, 'businesses', businessId));
            if (businessDoc.exists()) {
              const data = businessDoc.data();
              businesses.push({
                id: businessDoc.id,
                businessName: data.businessName || 'Unknown Business',
                businessAddress: data.businessAddress || '',
                businessImages: data.businessImages || [],
                selectedType: data.selectedType || data.businessType || '',
                businessType: data.businessType || data.selectedType || '',
                rating: data.rating || data.averageRating || 0,
                averageRating: data.averageRating || data.rating || 0,
                followersCount: data.followersCount || 0,
              });
            }
          } catch (error) {
            console.error('Error fetching business:', businessId, error);
          }
        })
      );

      // Sort by business name
      businesses.sort((a, b) => a.businessName.localeCompare(b.businessName));
      setFollowedBusinesses(businesses);
      setLoading(false);
    }, (err) => {
      console.error('Error listening to follows:', err);
      setFollowedBusinesses([]);
      setLoading(false);
    });

    // Register cleanup with AuthContext
    const unregister = registerCleanup(() => {
      console.log('🧹 AuthContext cleanup: Unsubscribing from FollowingListScreen follows listener');
      unsubscribe();
    });

    return () => {
      unsubscribe();
      unregister();
    };
  }, [user?.uid, registerCleanup]);

  const onRefresh = async () => {
    setRefreshing(true);
    // The real-time listener will automatically update the data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleUnfollow = async (businessId: string, businessName: string) => {
    if (!user?.uid) return;

    Alert.alert(
      'Unfollow Business',
      `Are you sure you want to unfollow ${businessName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: async () => {
            try {
              await followService.unfollowBusiness(user.uid, businessId);
            } catch (error) {
              console.error('Error unfollowing business:', error);
              Alert.alert('Error', 'Failed to unfollow business');
            }
          },
        },
      ]
    );
  };

  const handleBusinessPress = (business: Business) => {
    navigation.navigate('Navigate', { business });
  };

  const filteredBusinesses = followedBusinesses.filter(business =>
    (business.businessName || '').toLowerCase().includes(search.toLowerCase()) ||
    (business.businessAddress || '').toLowerCase().includes(search.toLowerCase()) ||
    (business.selectedType || business.businessType || '').toLowerCase().includes(search.toLowerCase())
  );

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    gradient: {
      flex: 1,
    },
    headerFixed: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      paddingTop: headerPaddingTop,
      paddingBottom: headerPaddingBottom,
      borderBottomLeftRadius: borderRadiusValues?.xl || 20,
      borderBottomRightRadius: borderRadiusValues?.xl || 20,
      borderWidth: 1,
      borderColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
      backgroundColor: theme === 'light' ? '#F5F5F5' : '#232526',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      borderTopWidth: 0,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: isSmallScreen ? spacing?.md : spacing?.lg,
      marginBottom: spacing?.sm,
      minHeight: minTouchTarget,
    },
    headerTitle: {
      fontSize: fontSizes?.xl,
      fontWeight: '700',
      color: '#000',
    },
    backButton: {
      marginRight: spacing?.md,
      padding: spacing?.xs,
      minWidth: minTouchTarget,
      minHeight: minTouchTarget,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: borderRadiusValues?.lg || 12,
      marginHorizontal: spacing?.md,
      paddingHorizontal: spacing?.sm,
      paddingVertical: spacing?.xs,
      minHeight: searchBarHeight,
    },
    searchIcon: {
      marginLeft: spacing?.sm,
    },
    searchBar: {
      flex: 1,
      fontSize: fontSizes?.md,
      color: '#222',
      padding: spacing?.sm,
      backgroundColor: 'transparent',
      minHeight: 36,
    },
    listContent: {
      paddingBottom: responsiveHeight(12),
      paddingTop: headerTotalHeight + (spacing?.md || 12),
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: borderRadiusValues?.lg || 12,
      padding: isSmallScreen ? spacing?.md : spacing?.lg,
      marginBottom: spacing?.lg,
      marginHorizontal: isSmallScreen ? spacing?.sm : spacing?.lg,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 3,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardImagePlaceholder: {
      width: 80,
      height: 80,
      borderRadius: borderRadiusValues?.md || 8,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing?.md,
      overflow: 'hidden',
    },
    cardImage: {
      width: '100%',
      height: '100%',
      borderRadius: borderRadiusValues?.md || 8,
    },
    cardContent: {
      flex: 1,
      minWidth: 0,
    },
    cardTitle: {
      fontSize: fontSizes?.md,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: spacing?.xs,
    },
    cardAddress: {
      fontSize: fontSizes?.sm,
      color: '#666',
      marginBottom: spacing?.xs,
    },
    cardType: {
      fontSize: fontSizes?.xs,
      color: '#667eea',
      marginBottom: spacing?.xs,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing?.xs,
    },
    ratingText: {
      fontSize: fontSizes?.sm,
      fontWeight: '600',
      color: '#333',
      marginLeft: spacing?.xs,
    },
    reviewText: {
      fontSize: fontSizes?.xs,
      color: '#666',
      marginLeft: spacing?.xs,
    },
    unfollowButton: {
      padding: spacing?.sm,
      minWidth: minTouchTarget,
      minHeight: minTouchTarget,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: responsiveHeight(20),
    },
    loadingText: {
      color: '#000',
      fontSize: fontSizes?.lg,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: responsiveHeight(15),
      paddingHorizontal: spacing?.lg,
    },
    emptyText: {
      color: '#000',
      fontSize: fontSizes?.lg,
      fontWeight: 'bold',
      marginTop: spacing?.lg,
      textAlign: 'center',
    },
    emptySubtext: {
      color: '#666',
      fontSize: fontSizes?.md,
      marginTop: spacing?.sm,
      textAlign: 'center',
      paddingHorizontal: spacing?.lg,
    },
  }), [spacing, fontSizes, borderRadiusValues, dimensions, responsiveHeight, isSmallScreen, headerPaddingTop, headerTotalHeight, theme, iconSizes]);

  const renderBusiness = ({ item }: { item: Business }) => {
    const rating = businessRatings[item.id] || { average: (item.rating || item.averageRating || 0).toFixed(1), count: 0 };
    const businessImage = item.businessImages && item.businessImages.length > 0 ? item.businessImages[0] : null;

    return (
      <ResponsiveView style={styles.card}>
        <TouchableOpacity
          style={styles.cardRow}
          onPress={() => handleBusinessPress(item)}
          activeOpacity={0.7}
        >
          <ResponsiveView style={styles.cardImagePlaceholder}>
            {businessImage && businessImage.startsWith('http') ? (
              <LoadingImage
                source={{ uri: businessImage }}
                style={styles.cardImage}
                resizeMode="cover"
                placeholder="business"
              />
            ) : (
              <Ionicons name="storefront" size={iconSizes?.xl || 32} color="#667eea" />
            )}
          </ResponsiveView>
          <ResponsiveView style={styles.cardContent}>
            <ResponsiveText size="md" weight="bold" color="#333" style={styles.cardTitle} numberOfLines={1}>
              {item.businessName}
            </ResponsiveText>
            {item.businessAddress && (
              <ResponsiveText size="sm" color="#666" style={styles.cardAddress} numberOfLines={1}>
                {item.businessAddress}
              </ResponsiveText>
            )}
            {(item.selectedType || item.businessType) && (
              <ResponsiveText size="xs" color="#667eea" style={styles.cardType} numberOfLines={1}>
                {item.selectedType || item.businessType}
              </ResponsiveText>
            )}
            <ResponsiveView style={styles.ratingRow}>
              <Ionicons name="star" size={iconSizes?.sm || 16} color="#FFD700" />
              <ResponsiveText size="sm" weight="600" color="#333" style={styles.ratingText}>
                {rating.average}
              </ResponsiveText>
              <ResponsiveText size="xs" color="#666" style={styles.reviewText}>
                ({rating.count} {rating.count === 1 ? 'Review' : 'Reviews'})
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
          <TouchableOpacity
            style={styles.unfollowButton}
            onPress={() => handleUnfollow(item.id, item.businessName)}
            activeOpacity={0.7}
          >
            <Ionicons name="person-remove-outline" size={iconSizes?.lg || 24} color="#e91e63" />
          </TouchableOpacity>
        </TouchableOpacity>
      </ResponsiveView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={theme === 'light' ? lightGradient : darkGradient} style={styles.gradient}>
        {/* Fixed Header */}
        <ResponsiveView style={styles.headerFixed}>
          <ResponsiveView style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={iconSizes?.lg || 24} color="#000" />
            </TouchableOpacity>
            <ResponsiveText size="xl" weight="bold" color="#000" style={styles.headerTitle}>
              Following
            </ResponsiveText>
          </ResponsiveView>
          {/* Search Bar */}
          <ResponsiveView style={styles.searchBarContainer}>
            <Ionicons name="search" size={iconSizes?.md || 20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchBar}
              placeholder="Search businesses..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#888"
              returnKeyType="search"
            />
          </ResponsiveView>
        </ResponsiveView>

        {/* Business List */}
        {loading ? (
          <ResponsiveView style={styles.loadingContainer}>
            <ResponsiveText size="lg" weight="600" color="#000" style={styles.loadingText}>
              Loading...
            </ResponsiveText>
          </ResponsiveView>
        ) : (
          <FlatList
            data={filteredBusinesses}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={renderBusiness}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme === 'dark' ? '#FFF' : '#333'}
              />
            }
            ListEmptyComponent={
              <ResponsiveView style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={iconSizes?.xxxl || 80} color="#ccc" />
                <ResponsiveText size="lg" weight="600" color="#000" style={styles.emptyText}>
                  {search ? 'No businesses found' : 'Not following any businesses'}
                </ResponsiveText>
                <ResponsiveText size="md" color="#666" style={styles.emptySubtext}>
                  {search
                    ? 'Try adjusting your search terms'
                    : 'Follow businesses to see them here and view their posts in your feed'}
                </ResponsiveText>
              </ResponsiveView>
            }
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

export default FollowingListScreen;

