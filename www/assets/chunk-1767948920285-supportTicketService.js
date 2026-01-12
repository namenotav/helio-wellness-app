import { F as getFirestore, J as getApp, K as initializeApp, M as getApps, i as collection, a as authService, z as subscriptionService, n as serverTimestamp, O as addDoc, q as query, Q as where, o as orderBy, t as getDocs, P as Preferences, m as doc, p as getDoc, u as updateDoc } from "./entry-1767948920134-index.js";
const firebaseConfig = {
  apiKey: "AIzaSyAUv69QXH4MNNR2wkr_wcVH_cbsYrc3wjo",
  authDomain: "wellnessai-app-e01be.firebaseapp.com",
  databaseURL: "https://wellnessai-app-e01be-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wellnessai-app-e01be",
  storageBucket: "wellnessai-app-e01be.firebasestorage.app",
  messagingSenderId: "863551474584",
  appId: "1:863551474584:web:a34f3f77742b7be4e7f9ed",
  measurementId: "G-CB4C84PTJ3"
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
class SupportTicketService {
  constructor() {
    this.useFirestore = true;
    this.localStorageKey = "support_tickets";
    this.ticketsCollection = collection(db, "support_tickets");
  }
  /**
   * Create a new support ticket
   * @param {Object} ticketData - { subject, message, category, priority }
   * @returns {Promise<Object>} Created ticket with ID
   */
  async createTicket({ subject, message, category = "general", attachments = [] }) {
    try {
      const user = authService.getCurrentUser();
      console.log("🔍 Support Ticket: Current user object:", user);
      console.log("🔍 Support Ticket: User keys:", user ? Object.keys(user) : "null");
      if (!user) {
        console.error("❌ Support Ticket: No user found");
        throw new Error("User must be logged in to create support ticket");
      }
      const userId = user.uid || user.id || user.userId || user.profile && user.profile.userId;
      console.log("🆔 Support Ticket: Extracted userId:", userId, "from user object with keys:", Object.keys(user));
      if (!userId) {
        console.error("❌ Support Ticket: Could not extract userId from:", JSON.stringify(user));
        throw new Error("User ID not found in user object: " + JSON.stringify(Object.keys(user)));
      }
      console.log("✅ Support Ticket: Using userId:", userId);
      const currentPlan = subscriptionService.getCurrentPlan();
      const isUltimate = currentPlan.id === "ultimate" || currentPlan.id === "vip";
      const isPremium = currentPlan.id === "premium";
      let priority = "standard";
      let slaHours = 72;
      if (isUltimate) {
        priority = "urgent";
        slaHours = 2;
      } else if (isPremium) {
        priority = "high";
        slaHours = 24;
      }
      const ticket = {
        // Don't set id here - let Firestore generate it
        userId,
        userEmail: user.email || "unknown@email.com",
        userName: user.name || user.displayName || user.profile?.name || "User",
        subject,
        message,
        category,
        // 'general', 'technical', 'billing', 'feature_request'
        priority,
        // 'urgent', 'high', 'standard'
        status: "open",
        // 'open', 'in_progress', 'resolved', 'closed'
        planTier: currentPlan.id,
        slaHours,
        attachments,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        resolvedAt: null,
        assignedTo: null,
        responses: []
      };
      let ticketId;
      try {
        const docRef = await addDoc(this.ticketsCollection, ticket);
        ticketId = docRef.id;
        if (false) ;
      } catch (firestoreError) {
        if (false) ;
        ticketId = `ticket_${Date.now()}`;
        ticket.id = ticketId;
        await this.saveTicketLocally(ticket);
      }
      await this.sendTicketNotification({
        ticketId,
        ...ticket
      });
      return {
        success: true,
        ticketId,
        ticket: { id: ticketId, ...ticket }
      };
    } catch (error) {
      throw error;
    }
  }
  /**
   * Send ticket notification email via Railway backend
   */
  async sendTicketNotification(ticket) {
    try {
      const apiUrl = "https://helio-wellness-app-production.up.railway.app";
      const response = await fetch(`${apiUrl}/api/support/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ""
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
        throw new Error("Failed to send notification email");
      }
      if (false) ;
    } catch (error) {
    }
  }
  /**
   * Get all tickets for current user (Firestore with local fallback)
   */
  async getUserTickets() {
    try {
      const user = authService.getCurrentUser();
      console.log("📋 Support Ticket: Getting tickets for user:", user);
      if (!user) {
        console.warn("⚠️ Support Ticket: No user logged in");
        return [];
      }
      const userId = user.uid || user.id || user.userId || user.profile && user.profile.userId;
      console.log("📋 Support Ticket: Using userId for query:", userId);
      try {
        const q = query(
          this.ticketsCollection,
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const tickets = [];
        snapshot.forEach((doc2) => {
          tickets.push({
            id: doc2.id,
            ...doc2.data()
          });
        });
        if (false) ;
        return tickets;
      } catch (firestoreError) {
        if (false) ;
        const { value } = await Preferences.get({ key: this.localStorageKey });
        if (!value) return [];
        const allTickets = JSON.parse(value);
        const userTickets = allTickets.filter((t) => t.userId === userId);
        return userTickets.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
    } catch (error) {
      return [];
    }
  }
  /**
   * Get ticket by ID
   */
  async getTicket(ticketId) {
    try {
      const docRef = doc(db, "support_tickets", ticketId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId, status) {
    try {
      const docRef = doc(db, "support_tickets", ticketId);
      const updates = {
        status,
        updatedAt: serverTimestamp()
      };
      if (status === "resolved" || status === "closed") {
        updates.resolvedAt = serverTimestamp();
      }
      await updateDoc(docRef, updates);
      if (false) ;
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Add response to ticket
   */
  async addTicketResponse(ticketId, response, isStaff = false) {
    try {
      const docRef = doc(db, "support_tickets", ticketId);
      const user = authService.getCurrentUser();
      const newResponse = {
        message: response,
        author: isStaff ? "Support Team" : user?.displayName || "User",
        authorId: user?.uid || "system",
        isStaff,
        timestamp: serverTimestamp()
      };
      const ticket = await this.getTicket(ticketId);
      const responses = ticket?.responses || [];
      responses.push(newResponse);
      await updateDoc(docRef, {
        responses,
        updatedAt: serverTimestamp(),
        status: isStaff ? "in_progress" : ticket.status
      });
      if (false) ;
      return true;
    } catch (error) {
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
      throw error;
    }
  }
  /**
   * Get estimated response time based on user's plan
   */
  getEstimatedResponseTime() {
    const plan = subscriptionService.getCurrentPlan();
    if (plan.id === "ultimate" || plan.id === "vip") {
      return "2 hours";
    } else if (plan.id === "premium") {
      return "24 hours";
    } else {
      return "3 days";
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
  /**
   * Check if tickets need migration to current user
   */
  async needsMigration() {
    try {
      const { value } = await Preferences.get({ key: this.localStorageKey });
      if (!value) return false;
      const allTickets = JSON.parse(value);
      const user = authService.getCurrentUser();
      if (!user) return false;
      const userId = user.id || user.uid || user.userId;
      if (!userId) return false;
      const ticketsNeedMigration = allTickets.some((t) => t.userId !== userId);
      return ticketsNeedMigration;
    } catch (error) {
      return false;
    }
  }
  /**
   * Migrate tickets from device storage to current user
   */
  async migrateTicketsToCurrentUser() {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        return { success: false, error: "No user logged in" };
      }
      const userId = user.id || user.uid || user.userId;
      if (!userId) {
        return { success: false, error: "User ID not found" };
      }
      const { value } = await Preferences.get({ key: this.localStorageKey });
      if (!value) {
        return { success: true, migratedCount: 0 };
      }
      const allTickets = JSON.parse(value);
      const ticketsNeedMigration = allTickets.filter((t) => t.userId !== userId);
      if (ticketsNeedMigration.length === 0) {
        return { success: true, migratedCount: 0 };
      }
      const migratedTickets = ticketsNeedMigration.map((ticket) => ({
        ...ticket,
        userId,
        userEmail: user.email || ticket.userEmail,
        userName: user.name || user.displayName || user.profile?.name || ticket.userName
      }));
      const currentUserTickets = allTickets.filter((t) => t.userId === userId);
      const mergedTickets = [...currentUserTickets, ...migratedTickets];
      await Preferences.set({
        key: this.localStorageKey,
        value: JSON.stringify(mergedTickets)
      });
      if (false) ;
      return { success: true, migratedCount: migratedTickets.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
const supportTicketService = new SupportTicketService();
export {
  supportTicketService as default
};
