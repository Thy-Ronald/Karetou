import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  Switch,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import RewardsService, { Reward } from '../../../services/RewardsService';
import { useResponsive } from '../../../hooks/useResponsive';
import { ResponsiveText, ResponsiveView } from '../../../components';
import LoadingImage from '../../../components/LoadingImage';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase';

type RootStackParamList = {
  RewardsManagement: { businessId: string; businessName: string };
};

type RewardsManagementRouteProp = RouteProp<RootStackParamList, 'RewardsManagement'>;

const RewardsManagementScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RewardsManagementRouteProp>();
  const { theme, user } = useAuth();
  const { spacing, fontSizes, iconSizes, borderRadius: borderRadiusValues, dimensions } = useResponsive();
  const rewardsService = RewardsService.getInstance();

  const businessId = route.params?.businessId;
  const businessName = route.params?.businessName || 'Business';

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [rewardName, setRewardName] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [rewardPointsCost, setRewardPointsCost] = useState('');
  const [rewardImageUrl, setRewardImageUrl] = useState<string | null>(null);
  const [rewardIsActive, setRewardIsActive] = useState(true);

  const isSmallScreen = dimensions?.width < 360;
  const minTouchTarget = 44;

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const headerPaddingTop = Platform.OS === 'ios'
    ? (spacing?.md || 12) + (spacing?.md || 12)
    : statusBarHeight + (spacing?.sm || 8);

  const lightGradient = ['#F5F5F5', '#F5F5F5'] as const;
  const darkGradient = ['#232526', '#414345'] as const;

  // Load rewards
  useEffect(() => {
    if (!businessId) return;

    const unsubscribe = rewardsService.subscribeToRewards(businessId, (rewardsList) => {
      setRewards(rewardsList);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [businessId]);

  const onRefresh = () => {
    setRefreshing(true);
    // The real-time listener will update automatically
  };

  const resetForm = () => {
    setRewardName('');
    setRewardDescription('');
    setRewardPointsCost('');
    setRewardImageUrl(null);
    setRewardIsActive(true);
    setSelectedReward(null);
  };

  const openAddModal = () => {
    resetForm();
    setEditModalVisible(true);
  };

  const openEditModal = (reward: Reward) => {
    setSelectedReward(reward);
    setRewardName(reward.name);
    setRewardDescription(reward.description);
    setRewardPointsCost(reward.pointsCost.toString());
    setRewardImageUrl(reward.imageUrl || null);
    setRewardIsActive(reward.isActive !== false);
    setEditModalVisible(true);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        try {
          const imageUri = result.assets[0].uri;
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const imageRef = ref(storage, `rewards/${businessId}/${Date.now()}.jpg`);
          await uploadBytes(imageRef, blob);
          const downloadURL = await getDownloadURL(imageRef);
          setRewardImageUrl(downloadURL);
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!rewardName.trim()) {
      Alert.alert('Error', 'Please enter a reward name.');
      return;
    }
    if (!rewardDescription.trim()) {
      Alert.alert('Error', 'Please enter a reward description.');
      return;
    }
    const pointsCost = parseInt(rewardPointsCost);
    if (isNaN(pointsCost) || pointsCost <= 0) {
      Alert.alert('Error', 'Please enter a valid points cost (greater than 0).');
      return;
    }

    if (!businessId) {
      Alert.alert('Error', 'Business ID not found.');
      return;
    }

    setSaving(true);
    try {
      if (selectedReward?.id) {
        // Update existing reward
        const success = await rewardsService.updateReward(businessId, selectedReward.id, {
          name: rewardName.trim(),
          description: rewardDescription.trim(),
          pointsCost,
          imageUrl: rewardImageUrl || undefined,
          isActive: rewardIsActive,
        });

        if (success) {
          Alert.alert('Success', 'Reward updated successfully!');
          setEditModalVisible(false);
          resetForm();
        } else {
          Alert.alert('Error', 'Failed to update reward. Please try again.');
        }
      } else {
        // Add new reward
        const rewardId = await rewardsService.addReward(businessId, {
          name: rewardName.trim(),
          description: rewardDescription.trim(),
          pointsCost,
          imageUrl: rewardImageUrl || undefined,
          isActive: rewardIsActive,
        });

        if (rewardId) {
          Alert.alert('Success', 'Reward added successfully!');
          setEditModalVisible(false);
          resetForm();
        } else {
          Alert.alert('Error', 'Failed to add reward. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error saving reward:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (reward: Reward) => {
    if (!businessId || !reward.id) return;

    Alert.alert(
      'Delete Reward',
      `Are you sure you want to delete "${reward.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await rewardsService.deleteReward(businessId, reward.id!);
              if (success) {
                Alert.alert('Success', 'Reward deleted successfully!');
              } else {
                Alert.alert('Error', 'Failed to delete reward. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting reward:', error);
              Alert.alert('Error', 'An error occurred. Please try again.');
            }
          },
        },
      ]
    );
  };

  const toggleRewardActive = async (reward: Reward) => {
    if (!businessId || !reward.id) return;

    try {
      const success = await rewardsService.updateReward(businessId, reward.id, {
        isActive: !reward.isActive,
      });
      if (!success) {
        Alert.alert('Error', 'Failed to update reward status.');
      }
    } catch (error) {
      console.error('Error toggling reward:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    gradient: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: headerPaddingTop,
      paddingBottom: spacing?.md || 12,
      paddingHorizontal: spacing?.lg || 16,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
    },
    backButton: {
      marginRight: spacing?.md || 12,
      padding: spacing?.xs || 4,
      minWidth: minTouchTarget,
      minHeight: minTouchTarget,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      fontSize: fontSizes?.xl || 20,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    addButton: {
      backgroundColor: '#667eea',
      paddingHorizontal: spacing?.md || 12,
      paddingVertical: spacing?.sm || 8,
      borderRadius: borderRadiusValues?.md || 8,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: minTouchTarget,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '600',
      marginLeft: spacing?.xs || 4,
    },
    content: {
      flex: 1,
      padding: spacing?.md || 12,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing?.xl || 24,
    },
    emptyText: {
      fontSize: fontSizes?.lg || 18,
      fontWeight: '600',
      color: theme === 'light' ? '#666' : '#999',
      marginTop: spacing?.md || 12,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: fontSizes?.md || 16,
      color: theme === 'light' ? '#999' : '#666',
      marginTop: spacing?.sm || 8,
      textAlign: 'center',
    },
    rewardCard: {
      backgroundColor: theme === 'light' ? '#fff' : '#2a2a2a',
      borderRadius: borderRadiusValues?.lg || 12,
      padding: spacing?.md || 12,
      marginBottom: spacing?.md || 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    rewardCardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing?.sm || 8,
    },
    rewardImage: {
      width: 80,
      height: 80,
      borderRadius: borderRadiusValues?.md || 8,
      marginRight: spacing?.md || 12,
    },
    rewardImagePlaceholder: {
      width: 80,
      height: 80,
      borderRadius: borderRadiusValues?.md || 8,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing?.md || 12,
    },
    rewardInfo: {
      flex: 1,
    },
    rewardName: {
      fontSize: fontSizes?.md || 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: spacing?.xs || 4,
    },
    rewardDescription: {
      fontSize: fontSizes?.sm || 14,
      color: theme === 'light' ? '#666' : '#aaa',
      marginBottom: spacing?.xs || 4,
    },
    rewardCost: {
      fontSize: fontSizes?.sm || 14,
      color: '#FFD700',
      fontWeight: '600',
    },
    rewardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing?.sm || 8,
      paddingTop: spacing?.sm || 8,
      borderTopWidth: 1,
      borderTopColor: theme === 'light' ? '#e0e0e0' : '#444',
    },
    activeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    activeToggleText: {
      fontSize: fontSizes?.sm || 14,
      color: theme === 'light' ? '#666' : '#aaa',
      marginRight: spacing?.sm || 8,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing?.sm || 8,
    },
    actionButton: {
      padding: spacing?.sm || 8,
      minWidth: minTouchTarget,
      minHeight: minTouchTarget,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing?.md || 12,
    },
    modalContent: {
      backgroundColor: theme === 'light' ? '#fff' : '#2a2a2a',
      borderRadius: borderRadiusValues?.xl || 16,
      padding: spacing?.lg || 20,
      width: '100%',
      maxWidth: 500,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing?.lg || 20,
    },
    modalTitle: {
      fontSize: fontSizes?.xl || 20,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    formGroup: {
      marginBottom: spacing?.md || 12,
    },
    formLabel: {
      fontSize: fontSizes?.sm || 14,
      fontWeight: '600',
      color: theme === 'light' ? '#333' : '#fff',
      marginBottom: spacing?.xs || 4,
    },
    formInput: {
      borderWidth: 1,
      borderColor: theme === 'light' ? '#ddd' : '#555',
      borderRadius: borderRadiusValues?.md || 8,
      padding: spacing?.md || 12,
      fontSize: fontSizes?.md || 16,
      color: theme === 'light' ? '#000' : '#fff',
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
    },
    formTextArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    imagePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#667eea',
      borderRadius: borderRadiusValues?.md || 8,
      padding: spacing?.md || 12,
      marginTop: spacing?.sm || 8,
      minHeight: minTouchTarget,
    },
    imagePickerButtonText: {
      color: '#fff',
      fontWeight: '600',
      marginLeft: spacing?.xs || 4,
    },
    previewImage: {
      width: '100%',
      height: 200,
      borderRadius: borderRadiusValues?.md || 8,
      marginTop: spacing?.sm || 8,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: spacing?.lg || 20,
      gap: spacing?.md || 12,
    },
    cancelButton: {
      paddingHorizontal: spacing?.lg || 20,
      paddingVertical: spacing?.md || 12,
      borderRadius: borderRadiusValues?.md || 8,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#3a3a3a',
      minHeight: minTouchTarget,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButtonText: {
      color: theme === 'light' ? '#333' : '#fff',
      fontWeight: '600',
    },
    saveButton: {
      paddingHorizontal: spacing?.lg || 20,
      paddingVertical: spacing?.md || 12,
      borderRadius: borderRadiusValues?.md || 8,
      backgroundColor: '#667eea',
      minHeight: minTouchTarget,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    inactiveBadge: {
      backgroundColor: '#999',
      paddingHorizontal: spacing?.sm || 8,
      paddingVertical: spacing?.xs || 4,
      borderRadius: borderRadiusValues?.sm || 4,
      marginLeft: spacing?.sm || 8,
    },
    inactiveBadgeText: {
      color: '#fff',
      fontSize: fontSizes?.xs || 12,
      fontWeight: '600',
    },
  }), [spacing, fontSizes, borderRadiusValues, dimensions, theme, headerPaddingTop, minTouchTarget]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={theme === 'light' ? lightGradient : darkGradient} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={iconSizes?.lg || 24} color={theme === 'light' ? '#000' : '#fff'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rewards</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal} activeOpacity={0.7}>
            <Ionicons name="add" size={iconSizes?.md || 20} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme === 'dark' ? '#FFF' : '#333'} />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
            </View>
          ) : rewards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="gift-outline" size={iconSizes?.xxxl || 80} color="#ccc" />
              <Text style={styles.emptyText}>No rewards yet</Text>
              <Text style={styles.emptySubtext}>
                Add rewards that customers can claim with their loyalty points
              </Text>
            </View>
          ) : (
            rewards.map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardCardHeader}>
                  {reward.imageUrl ? (
                    <LoadingImage source={{ uri: reward.imageUrl }} style={styles.rewardImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.rewardImagePlaceholder}>
                      <Ionicons name="gift" size={iconSizes?.xl || 32} color="#ccc" />
                    </View>
                  )}
                  <View style={styles.rewardInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.rewardName}>{reward.name}</Text>
                      {reward.isActive === false && (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveBadgeText}>Inactive</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.rewardDescription} numberOfLines={2}>
                      {reward.description}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing?.xs || 4 }}>
                      <Ionicons name="star" size={iconSizes?.sm || 16} color="#FFD700" />
                      <Text style={styles.rewardCost}> {reward.pointsCost} points</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.rewardActions}>
                  <View style={styles.activeToggle}>
                    <Text style={styles.activeToggleText}>Active</Text>
                    <Switch
                      value={reward.isActive !== false}
                      onValueChange={() => toggleRewardActive(reward)}
                      trackColor={{ false: '#767577', true: '#81b0ff' }}
                      thumbColor={reward.isActive !== false ? '#667eea' : '#f4f3f4'}
                    />
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openEditModal(reward)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={iconSizes?.md || 20} color="#667eea" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(reward)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={iconSizes?.md || 20} color="#e91e63" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Edit/Add Modal */}
        <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setEditModalVisible(false);
            resetForm();
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedReward ? 'Edit Reward' : 'Add Reward'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditModalVisible(false);
                    resetForm();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={iconSizes?.lg || 24} color={theme === 'light' ? '#000' : '#fff'} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Reward Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={rewardName}
                    onChangeText={setRewardName}
                    placeholder="e.g., Free Coffee"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description *</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextArea]}
                    value={rewardDescription}
                    onChangeText={setRewardDescription}
                    placeholder="Describe the reward..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Points Cost *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={rewardPointsCost}
                    onChangeText={(text) => {
                      const numericText = text.replace(/[^0-9]/g, '');
                      setRewardPointsCost(numericText);
                    }}
                    placeholder="100"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Image (Optional)</Text>
                  {rewardImageUrl ? (
                    <>
                      <Image source={{ uri: rewardImageUrl }} style={styles.previewImage} resizeMode="cover" />
                      <TouchableOpacity
                        style={styles.imagePickerButton}
                        onPress={pickImage}
                        disabled={uploadingImage}
                        activeOpacity={0.7}
                      >
                        {uploadingImage ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="image-outline" size={iconSizes?.md || 20} color="#fff" />
                            <Text style={styles.imagePickerButtonText}>Change Image</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.imagePickerButton}
                      onPress={pickImage}
                      disabled={uploadingImage}
                      activeOpacity={0.7}
                    >
                      {uploadingImage ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="image-outline" size={iconSizes?.md || 20} color="#fff" />
                          <Text style={styles.imagePickerButtonText}>Pick Image</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.activeToggle}>
                    <Text style={styles.formLabel}>Active</Text>
                    <Switch
                      value={rewardIsActive}
                      onValueChange={setRewardIsActive}
                      trackColor={{ false: '#767577', true: '#81b0ff' }}
                      thumbColor={rewardIsActive ? '#667eea' : '#f4f3f4'}
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditModalVisible(false);
                      resetForm();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.7}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default RewardsManagementScreen;

