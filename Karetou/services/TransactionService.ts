import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'reward_claimed';
  userId: string;
  userName: string;
  businessId: string;
  businessName: string;
  points: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  rewardName?: string;
}

class TransactionService {
  private static instance: TransactionService;

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  // Create a transaction record
  async createTransaction(
    type: 'sent' | 'received' | 'reward_claimed',
    userId: string,
    userName: string,
    businessId: string,
    businessName: string,
    points: number,
    status: 'completed' | 'pending' | 'failed' = 'completed',
    rewardName?: string
  ): Promise<string> {
    try {
      const transactionData = {
        type,
        userId,
        userName,
        businessId,
        businessName,
        points,
        timestamp: new Date().toISOString(),
        status,
        ...(rewardName && { rewardName }),
      };

      const docRef = await addDoc(collection(db, 'transactions'), transactionData);
      console.log('✅ Transaction recorded:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Get user's transaction history (sent points and claimed rewards)
  async getUserTransactions(userId: string, limitCount: number = 50): Promise<Transaction[]> {
    try {
      // Get both 'sent' and 'reward_claimed' transactions
      const sentQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('type', '==', 'sent')
      );
      
      const claimedQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('type', '==', 'reward_claimed')
      );

      const [sentSnapshot, claimedSnapshot] = await Promise.all([
        getDocs(sentQuery),
        getDocs(claimedQuery)
      ]);

      const transactions: Transaction[] = [];

      sentSnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
        } as Transaction);
      });

      claimedSnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
        } as Transaction);
      });

      // Sort by timestamp (newest first) in JavaScript
      transactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Return limited results
      return transactions.slice(0, limitCount);
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }

  // Get business owner's transaction history (received points and reward claims)
  async getBusinessOwnerTransactions(businessId: string, limitCount: number = 50): Promise<Transaction[]> {
    try {
      // Get both 'received' and 'reward_claimed' transactions
      const receivedQuery = query(
        collection(db, 'transactions'),
        where('businessId', '==', businessId),
        where('type', '==', 'received')
      );
      
      const claimedQuery = query(
        collection(db, 'transactions'),
        where('businessId', '==', businessId),
        where('type', '==', 'reward_claimed')
      );

      const [receivedSnapshot, claimedSnapshot] = await Promise.all([
        getDocs(receivedQuery),
        getDocs(claimedQuery)
      ]);

      const transactions: Transaction[] = [];

      receivedSnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
        } as Transaction);
      });

      claimedSnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
        } as Transaction);
      });

      // Sort by timestamp (newest first) in JavaScript
      transactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Return limited results
      return transactions.slice(0, limitCount);
    } catch (error) {
      console.error('Error getting business owner transactions:', error);
      return [];
    }
  }

  // Get all transactions for a business owner (across all their businesses)
  async getAllBusinessOwnerTransactions(userId: string, limitCount: number = 50): Promise<Transaction[]> {
    try {
      // First, get all businesses owned by this user
      const businessesQuery = query(
        collection(db, 'businesses'),
        where('userId', '==', userId)
      );
      const businessesSnapshot = await getDocs(businessesQuery);
      
      const businessIds: string[] = [];
      businessesSnapshot.forEach((doc) => {
        businessIds.push(doc.id);
      });

      if (businessIds.length === 0) {
        return [];
      }

      // Get all transactions for these businesses
      // Note: Firestore doesn't support 'in' queries with more than 10 items
      // So we'll need to fetch for each business and combine
      const allTransactions: Transaction[] = [];

      for (const businessId of businessIds) {
        // Get both 'received' and 'reward_claimed' transactions
        const receivedQuery = query(
          collection(db, 'transactions'),
          where('businessId', '==', businessId),
          where('type', '==', 'received')
        );
        
        const claimedQuery = query(
          collection(db, 'transactions'),
          where('businessId', '==', businessId),
          where('type', '==', 'reward_claimed')
        );

        const [receivedSnapshot, claimedSnapshot] = await Promise.all([
          getDocs(receivedQuery),
          getDocs(claimedQuery)
        ]);

        receivedSnapshot.forEach((doc) => {
          allTransactions.push({
            id: doc.id,
            ...doc.data(),
          } as Transaction);
        });

        claimedSnapshot.forEach((doc) => {
          allTransactions.push({
            id: doc.id,
            ...doc.data(),
          } as Transaction);
        });
      }

      // Sort by timestamp (newest first)
      allTransactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Return limited results
      return allTransactions.slice(0, limitCount);
    } catch (error) {
      console.error('Error getting all business owner transactions:', error);
      return [];
    }
  }
}

export default TransactionService;

