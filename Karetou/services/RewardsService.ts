import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';

export interface Reward {
  id?: string;
  name: string;
  description: string;
  pointsCost: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  businessId: string;
}

class RewardsService {
  private static instance: RewardsService;

  static getInstance(): RewardsService {
    if (!RewardsService.instance) {
      RewardsService.instance = new RewardsService();
    }
    return RewardsService.instance;
  }

  // Get all rewards for a business
  async getRewards(businessId: string): Promise<Reward[]> {
    try {
      const rewardsRef = collection(db, 'businesses', businessId, 'rewards');
      const q = query(rewardsRef, orderBy('pointsCost', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reward));
    } catch (error) {
      console.error('Error getting rewards:', error);
      return [];
    }
  }

  // Get active rewards only
  async getActiveRewards(businessId: string): Promise<Reward[]> {
    try {
      const rewards = await this.getRewards(businessId);
      return rewards.filter(reward => reward.isActive !== false);
    } catch (error) {
      console.error('Error getting active rewards:', error);
      return [];
    }
  }

  // Get a single reward
  async getReward(businessId: string, rewardId: string): Promise<Reward | null> {
    try {
      const rewardRef = doc(db, 'businesses', businessId, 'rewards', rewardId);
      const rewardSnap = await getDoc(rewardRef);
      
      if (rewardSnap.exists()) {
        return {
          id: rewardSnap.id,
          ...rewardSnap.data()
        } as Reward;
      }
      return null;
    } catch (error) {
      console.error('Error getting reward:', error);
      return null;
    }
  }

  // Add a new reward
  async addReward(businessId: string, reward: Omit<Reward, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const rewardsRef = collection(db, 'businesses', businessId, 'rewards');
      const newReward = {
        ...reward,
        businessId,
        isActive: reward.isActive !== undefined ? reward.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(rewardsRef, newReward);
      return docRef.id;
    } catch (error) {
      console.error('Error adding reward:', error);
      return null;
    }
  }

  // Update a reward
  async updateReward(businessId: string, rewardId: string, updates: Partial<Reward>): Promise<boolean> {
    try {
      const rewardRef = doc(db, 'businesses', businessId, 'rewards', rewardId);
      await updateDoc(rewardRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error updating reward:', error);
      return false;
    }
  }

  // Delete a reward
  async deleteReward(businessId: string, rewardId: string): Promise<boolean> {
    try {
      const rewardRef = doc(db, 'businesses', businessId, 'rewards', rewardId);
      await deleteDoc(rewardRef);
      return true;
    } catch (error) {
      console.error('Error deleting reward:', error);
      return false;
    }
  }

  // Subscribe to rewards changes (real-time)
  subscribeToRewards(
    businessId: string,
    callback: (rewards: Reward[]) => void
  ): () => void {
    const rewardsRef = collection(db, 'businesses', businessId, 'rewards');
    const q = query(rewardsRef, orderBy('pointsCost', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rewards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reward));
      callback(rewards);
    }, (error) => {
      console.error('Error subscribing to rewards:', error);
      callback([]);
    });

    return unsubscribe;
  }
}

export default RewardsService;







