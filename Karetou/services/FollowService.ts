import { db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc, runTransaction, increment } from 'firebase/firestore';
import NotificationService from './NotificationService';

class FollowService {
  private static instance: FollowService;

  static getInstance(): FollowService {
    if (!FollowService.instance) {
      FollowService.instance = new FollowService();
    }
    return FollowService.instance;
  }

  async isFollowing(userId: string, businessId: string): Promise<boolean> {
    if (!userId || !businessId) return false;
    const followerRef = doc(db, 'businesses', businessId, 'followers', userId);
    const snap = await getDoc(followerRef);
    return snap.exists();
  }

  async getFollowersCount(businessId: string): Promise<number> {
    if (!businessId) return 0;
    const businessRef = doc(db, 'businesses', businessId);
    const snap = await getDoc(businessRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.followersCount || 0;
    }
    return 0;
  }

  async followBusiness(
    userId: string,
    businessId: string,
    businessOwnerId?: string,
    businessName?: string
  ): Promise<boolean> {
    if (!userId || !businessId) return false;
    const followerRef = doc(db, 'businesses', businessId, 'followers', userId);
    const businessRef = doc(db, 'businesses', businessId);

    const didFollow = await runTransaction(db, async (transaction) => {
      const followerSnap = await transaction.get(followerRef);
      if (followerSnap.exists()) {
        // Already following; treat as success (idempotent)
        return true;
      }
      transaction.set(followerRef, {
        userId,
        createdAt: new Date().toISOString(),
      });
      transaction.set(
        businessRef,
        {
          followersCount: increment(1),
        },
        { merge: true }
      );

      // Mirror follow under user document for persistence
      const userFollowRef = doc(db, 'users', userId, 'follows', businessId);
      transaction.set(
        userFollowRef,
        {
          businessId,
          followedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    });

    // Notify business owner of new follower
    if (didFollow && businessOwnerId && businessOwnerId !== userId) {
      try {
        const notificationService = NotificationService.getInstance();
        await notificationService.createNotification({
          title: 'New Follower',
          body: `${businessName || 'Your business'} has a new follower.`,
          type: 'business_follow',
          userId: businessOwnerId,
          read: false,
          data: {
            businessId,
            businessName,
            followerId: userId,
          },
        });
      } catch (err) {
        console.error('Error sending follow notification:', err);
      }
    }

    return didFollow;
  }

  async unfollowBusiness(userId: string, businessId: string): Promise<boolean> {
    if (!userId || !businessId) return false;
    const followerRef = doc(db, 'businesses', businessId, 'followers', userId);
    const businessRef = doc(db, 'businesses', businessId);

    const didUnfollow = await runTransaction(db, async (transaction) => {
      const followerSnap = await transaction.get(followerRef);
      if (!followerSnap.exists()) {
        // Already not following; treat as success (idempotent)
        return true;
      }
      transaction.delete(followerRef);
      transaction.set(
        businessRef,
        {
          followersCount: increment(-1),
        },
        { merge: true }
      );

      // Remove mirrored follow under user document
      const userFollowRef = doc(db, 'users', userId, 'follows', businessId);
      transaction.delete(userFollowRef);
      return true;
    });

    return didUnfollow;
  }
}

export default FollowService;

