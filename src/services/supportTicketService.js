// Priority Support Ticket Service
// Handles support ticket creation, tracking, and priority routing
import { Preferences } from '@capacitor/preferences';
import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import authService from './authService';
import subscriptionService from './subscriptionService';

class SupportTicketService {
  constructor() {
    this.useFirestore = true; // Enable Firestore (manual rules deployment required)
    this.localStorageKey = 'support_tickets';
    this.ticketsCollection = collection(db, 'support_tickets');
  }

  /**
   * Create a new support ticket
   * @param {Object} ticketData - { subject, message, category, priority }
   * @returns {Promise<Object>} Created ticket with ID
   */
  async createTicket({ subject, message, category = 'general', attachments = [] }) {
    try {
      const user = authService.getCurrentUser();
      if(import.meta.env.DEV)console.log('🔍 Current user object:', JSON.stringify(user, null, 2));
      
      if (!user) {
        throw new Error('User must be logged in to create support ticket');
      }
      
      // Extract user ID - support multiple formats
      const userId = user.id || user.uid || user.userId;
      if(import.meta.env.DEV)console.log('🆔 Using userId:', userId);
      
      if (!userId) {
        throw new Error('User ID not found. Please try logging out and back in.');
      }

      // Get user's subscription plan for priority routing
      const currentPlan = subscriptionService.getCurrentPlan();
      const isUltimate = currentPlan.id === 'ultimate' || currentPlan.id === 'vip';
      const isPremium = currentPlan.id === 'premium';

      // Determine priority and SLA
      let priority = 'standard';
      let slaHours = 72; // 3 days for free/starter
      
      if (isUltimate) {
        priority = 'urgent';
        slaHours = 2; // 2 hours for Ultimate
      } else if (isPremium) {
        priority = 'high';
        slaHours = 24; // 24 hours for Premium
      }

      const ticket = {
        id: `ticket_${Date.now()}`,
        userId: userId,
        userEmail: user.email || 'unknown@email.com',
        userName: user.name || user.displayName || user.profile?.name || 'User',
        subject,
        message,
        category, // 'general', 'technical', 'billing', 'feature_request'
        priority, // 'urgent', 'high', 'standard'
        status: 'open', // 'open', 'in_progress', 'resolved', 'closed'
        planTier: currentPlan.id,
        slaHours,
        attachments,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        resolvedAt: null,
        assignedTo: null,
        responses: []
      };

      try {
        // Try Firestore first
        const docRef = await addDoc(this.ticketsCollection, ticket);
        ticket.id = docRef.id;
        if(import.meta.env.DEV)console.log('✅ Support ticket created in Firestore:', docRef.id);
      } catch (firestoreError) {
        // Fallback to local storage if Firestore fails
        if(import.meta.env.DEV)console.warn('⚠️ Firestore failed, saving to local storage:', firestoreError);
        await this.saveTicketLocally(ticket);
      }

      // Send email notification via Railway API
      await this.sendTicketNotification({
        ticketId: ticket.id,
        ...ticket
      });

      return {
        success: true,
        ticketId: ticket.id,
        ticket: ticket
      };
    } catch (error) {
      if(import.meta.env.DEV)console.error('❌ Failed to create support ticket:', error);
      throw error;
    }
  }

  /**
   * Send ticket notification email via Railway backend
   */
  async sendTicketNotification(ticket) {
    try {
      const apiUrl = import.meta.env.VITE_RAILWAY_API_URL || 'https://helio-wellness-app-production.up.railway.app';
      
      const response = await fetch(`${apiUrl}/api/support/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_RAILWAY_API_KEY || ''
        },
        body: JSON.stringify({
          ticketId: ticket.ticketId,
          userEmail: ticket.userEmail,
          userName: ticket.userName,
          subject: ticket.subject,
          message: ticket.message,
          priority: ticket.priority,
          planTier: ticket.planTier,
          slaHours: ticket.slaHours
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notification email');
      }

      if(import.meta.env.DEV)console.log('📧 Support ticket email sent');
    } catch (error) {
      // Don't fail ticket creation if email fails
      if(import.meta.env.DEV)console.error('⚠️ Failed to send ticket notification:', error);
    }
  }

  /**
   * Get all tickets for current user (Firestore with local fallback)
   */
  async getUserTickets() {
    try {
      const user = authService.getCurrentUser();
      if (!user) return [];

      const userId = user.id || user.uid || user.userId;

      try {
        // Try Firestore first
        const q = query(
          this.ticketsCollection,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const tickets = [];
        
        snapshot.forEach(doc => {
          tickets.push({
            id: doc.id,
            ...doc.data()
          });
        });

        if(import.meta.env.DEV)console.log('✅ Loaded tickets from Firestore:', tickets.length);
        return tickets;
      } catch (firestoreError) {
        // Fallback to local storage
        if(import.meta.env.DEV)console.warn('⚠️ Firestore failed, loading from local storage:', firestoreError);
        
        const { value } = await Preferences.get({ key: this.localStorageKey });
        if (!value) return [];

        const allTickets = JSON.parse(value);
        const userTickets = allTickets.filter(t => t.userId === userId);
        
        return userTickets.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to fetch user tickets:', error);
      return [];
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId) {
    try {
      const docRef = doc(db, 'support_tickets', ticketId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to fetch ticket:', error);
      return null;
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId, status) {
    try {
      const docRef = doc(db, 'support_tickets', ticketId);
      
      const updates = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'resolved' || status === 'closed') {
        updates.resolvedAt = serverTimestamp();
      }

      await updateDoc(docRef, updates);
      
      if(import.meta.env.DEV)console.log('✅ Ticket status updated:', ticketId, status);
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to update ticket status:', error);
      return false;
    }
  }

  /**
   * Add response to ticket
   */
  async addTicketResponse(ticketId, response, isStaff = false) {
    try {
      const docRef = doc(db, 'support_tickets', ticketId);
      const user = authService.getCurrentUser();
      
      const newResponse = {
        message: response,
        author: isStaff ? 'Support Team' : user?.displayName || 'User',
        authorId: user?.uid || 'system',
        isStaff,
        timestamp: serverTimestamp()
      };

      // Get current ticket
      const ticket = await this.getTicket(ticketId);
      const responses = ticket?.responses || [];
      
      responses.push(newResponse);

      await updateDoc(docRef, {
        responses,
        updatedAt: serverTimestamp(),
        status: isStaff ? 'in_progress' : ticket.status
      });

      if(import.meta.env.DEV)console.log('✅ Response added to ticket:', ticketId);
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to add ticket response:', error);
      return false;
    }
  }

  /**
   * Save ticket to local storage (fallback)
   */
  async saveTicketLocally(ticket) {
    try {
      const { value } = await Preferences.get({ key: this.localStorageKey });
      const tickets = value ? JSON.parse(value) : [];
      tickets.push(ticket);
      await Preferences.set({ 
        key: this.localStorageKey, 
        value: JSON.stringify(tickets) 
      });
    } catch (error) {
      if(import.meta.env.DEV)console.error('Failed to save ticket locally:', error);
      throw error;
    }
  }

  /**
   * Get estimated response time based on user's plan
   */
  getEstimatedResponseTime() {
    const plan = subscriptionService.getCurrentPlan();
    
    if (plan.id === 'ultimate' || plan.id === 'vip') {
      return '2 hours';
    } else if (plan.id === 'premium') {
      return '24 hours';
    } else {
      return '3 days';
    }
  }

  /**
   * Check if user has priority support access
   */
  hasPrioritySupport() {
    return subscriptionService.hasPrioritySupport();
  }

  /**
   * Check if user has VIP badge
   */
  hasVIPBadge() {
    return subscriptionService.hasVIPBadge();
  }

  /**
   * Check if user has beta access
   */
  hasBetaAccess() {
    return subscriptionService.hasBetaAccess();
  }
}

const supportTicketService = new SupportTicketService();
export default supportTicketService;
