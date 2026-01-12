// Money Escrow Service - Stripe Connect Integration for Social Battles
// Handles money stakes in competitive battles with secure escrow
import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import authService from './authService';
import subscriptionService from './subscriptionService';

class MoneyEscrowService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_RAILWAY_API_URL || 'https://helio-wellness-app-production.up.railway.app';
    this.escrowCollection = collection(db, 'battle_escrow');
  }

  /**
   * Check if user can participate in money battles
   * Requires: Premium plan + 18+ age verification + Stripe Connect account
   */
  async canUseMoneyBattles() {
    try {
      // Check subscription level
      const hasPremium = await subscriptionService.hasAccess('premium');
      if (!hasPremium) {
        return { 
          allowed: false, 
          reason: 'Requires Premium plan or higher' 
        };
      }

      // Check age verification (stored in user profile)
      const user = authService.getCurrentUser();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData?.ageVerified || !userData?.over18) {
        return {
          allowed: false,
          reason: 'Age verification required (18+)'
        };
      }

      // Check Stripe Connect onboarding status
      if (!userData?.stripeConnectId || userData?.stripeConnectStatus !== 'active') {
        return {
          allowed: false,
          reason: 'Complete Stripe Connect onboarding to enable money battles'
        };
      }

      return { allowed: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Error checking money battle eligibility:', error);
      return { allowed: false, reason: 'Error verifying eligibility' };
    }
  }

  /**
   * Create escrow for battle with money stakes
   * @param {Object} battleData - { battleId, amount, participants }
   */
  async createEscrow(battleId, amount, participants) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Validate amount (£5 - £100 range)
      if (amount < 5 || amount > 100) {
        throw new Error('Stake amount must be between £5 and £100');
      }

      // Check eligibility
      const eligibility = await this.canUseMoneyBattles();
      if (!eligibility.allowed) {
        throw new Error(eligibility.reason);
      }

      // Create Stripe payment intent via Railway API
      const response = await fetch(`${this.apiUrl}/api/stripe/create-escrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          battleId,
          amount: Math.round(amount * 100), // Convert to cents
          userId: user.uid,
          participants
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create escrow payment intent');
      }

      const { clientSecret, escrowId, paymentIntentId } = await response.json();

      // Store escrow record in Firestore
      const escrowDoc = {
        escrowId,
        battleId,
        paymentIntentId,
        amount,
        currency: 'gbp',
        status: 'pending', // 'pending', 'held', 'released', 'refunded'
        creatorId: user.uid,
        participants,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        releaseCondition: 'battle_complete',
        winnerId: null,
        distributedAt: null
      };

      await setDoc(doc(this.escrowCollection, escrowId), escrowDoc);

      if(import.meta.env.DEV)console.log('✅ Escrow created:', escrowId);

      return {
        success: true,
        clientSecret,
        escrowId,
        message: 'Payment intent created'
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to create escrow:', error);
      throw error;
    }
  }

  /**
   * Confirm escrow payment after Stripe confirmation
   */
  async confirmEscrowPayment(escrowId) {
    try {
      const escrowRef = doc(this.escrowCollection, escrowId);
      await updateDoc(escrowRef, {
        status: 'held',
        confirmedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if(import.meta.env.DEV)console.log('✅ Escrow payment confirmed:', escrowId);
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to confirm escrow:', error);
      return false;
    }
  }

  /**
   * Release escrow to winner when battle completes
   */
  async releaseEscrow(battleId, winnerId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Get escrow record
      const escrowQuery = await getDoc(doc(this.escrowCollection, battleId));
      if (!escrowQuery.exists()) {
        throw new Error('Escrow not found');
      }

      const escrow = escrowQuery.data();

      // Validate escrow status
      if (escrow.status !== 'held') {
        throw new Error(`Cannot release escrow in status: ${escrow.status}`);
      }

      // Release funds via Railway API
      const response = await fetch(`${this.apiUrl}/api/stripe/release-escrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          escrowId: escrow.escrowId,
          battleId,
          winnerId,
          amount: escrow.amount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to release escrow funds');
      }

      const { transferId } = await response.json();

      // Update escrow record
      await updateDoc(doc(this.escrowCollection, battleId), {
        status: 'released',
        winnerId,
        transferId,
        distributedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if(import.meta.env.DEV)console.log('✅ Escrow released to winner:', winnerId);

      return {
        success: true,
        message: 'Funds released to winner',
        transferId
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to release escrow:', error);
      throw error;
    }
  }

  /**
   * Refund escrow if battle is cancelled or disputed
   */
  async refundEscrow(battleId, reason = 'Battle cancelled') {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Get escrow record
      const escrowQuery = await getDoc(doc(this.escrowCollection, battleId));
      if (!escrowQuery.exists()) {
        throw new Error('Escrow not found');
      }

      const escrow = escrowQuery.data();

      // Validate escrow status
      if (escrow.status !== 'held' && escrow.status !== 'pending') {
        throw new Error(`Cannot refund escrow in status: ${escrow.status}`);
      }

      // Refund via Railway API
      const response = await fetch(`${this.apiUrl}/api/stripe/refund-escrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          escrowId: escrow.escrowId,
          paymentIntentId: escrow.paymentIntentId,
          reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refund escrow');
      }

      const { refundId } = await response.json();

      // Update escrow record
      await updateDoc(doc(this.escrowCollection, battleId), {
        status: 'refunded',
        refundId,
        refundReason: reason,
        refundedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if(import.meta.env.DEV)console.log('✅ Escrow refunded:', battleId);

      return {
        success: true,
        message: 'Funds refunded',
        refundId
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to refund escrow:', error);
      throw error;
    }
  }

  /**
   * Start Stripe Connect onboarding for user
   */
  async startConnectOnboarding() {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Create Stripe Connect account via Railway API
      const response = await fetch(`${this.apiUrl}/api/stripe/connect/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          returnUrl: `${window.location.origin}/dashboard?connect=success`,
          refreshUrl: `${window.location.origin}/dashboard?connect=refresh`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create Connect onboarding');
      }

      const { url, accountId } = await response.json();

      // Save Connect account ID to user profile
      await updateDoc(doc(db, 'users', user.uid), {
        stripeConnectId: accountId,
        stripeConnectStatus: 'pending',
        connectOnboardingStarted: serverTimestamp()
      });

      // Redirect to Stripe onboarding
      window.location.href = url;

      return { success: true };
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to start Connect onboarding:', error);
      throw error;
    }
  }

  /**
   * Get escrow status for battle
   */
  async getEscrowStatus(battleId) {
    try {
      const escrowDoc = await getDoc(doc(this.escrowCollection, battleId));
      if (!escrowDoc.exists()) {
        return null;
      }
      return escrowDoc.data();
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to get escrow status:', error);
      return null;
    }
  }
}

const moneyEscrowService = new MoneyEscrowService();
export default moneyEscrowService;
