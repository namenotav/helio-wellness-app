const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunk-1767948920159-battleNotificationsService.js","assets/entry-1767948920134-index.js","assets/asset-1767948921966-index.css"])))=>i.map(i=>d[i]);
import { f as firestoreService, a as authService, _ as __vitePreload } from "./entry-1767948920134-index.js";
import { healthAvatarService } from "./chunk-1767948920148-healthAvatarService.js";
class SocialBattlesService {
  constructor() {
    this.activeBattles = [];
    this.completedBattles = [];
    this.userStats = { wins: 0, losses: 0, winRate: 0, totalBattles: 0 };
    this.initialized = false;
    this.init();
  }
  // Initialize - load from localStorage and Firebase
  async init() {
    if (this.initialized) return;
    try {
      const stored = localStorage.getItem("battles_data");
      if (stored) {
        const data = JSON.parse(stored);
        this.activeBattles = data.activeBattles || [];
        this.completedBattles = data.completedBattles || [];
        this.userStats = data.userStats || { wins: 0, losses: 0, winRate: 0, totalBattles: 0 };
      }
      const firebaseData = await firestoreService.get("battles_data", authService.getCurrentUser()?.uid);
      if (firebaseData) {
        const activeBattlesMap = /* @__PURE__ */ new Map();
        this.activeBattles.forEach((b) => activeBattlesMap.set(b.id, b));
        (firebaseData.activeBattles || []).forEach((b) => activeBattlesMap.set(b.id, b));
        this.activeBattles = Array.from(activeBattlesMap.values());
        const completedBattlesMap = /* @__PURE__ */ new Map();
        this.completedBattles.forEach((b) => completedBattlesMap.set(b.id, b));
        (firebaseData.completedBattles || []).forEach((b) => completedBattlesMap.set(b.id, b));
        this.completedBattles = Array.from(completedBattlesMap.values());
        if (firebaseData.userStats) {
          this.userStats = firebaseData.userStats;
        }
        await this.saveData();
      }
      this.initialized = true;
      if (false) ;
    } catch (error) {
      this.initialized = true;
    }
  }
  // Save to localStorage + Firebase
  async saveData() {
    try {
      const data = {
        activeBattles: this.activeBattles,
        completedBattles: this.completedBattles,
        userStats: this.userStats,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      localStorage.setItem("battles_data", JSON.stringify(data));
      await firestoreService.save("battles_data", data, authService.getCurrentUser()?.uid);
      if (false) ;
    } catch (error) {
    }
  }
  // Create new health battle
  async createBattle(battleConfig) {
    const user = authService.getCurrentUser();
    if (!user) return { success: false, error: "Not logged in" };
    const battleId = "BTL-" + Date.now();
    const shareCode = this.generateShareCode(battleId);
    const battle = {
      id: battleId,
      creator: {
        id: user.id,
        name: user.name || user.email?.split("@")[0] || "Anonymous",
        avatar: user.profile?.avatar || "👤"
      },
      participants: [user.id],
      config: {
        duration: battleConfig.duration || 30,
        // days
        goal: battleConfig.goal || "steps",
        // 'steps', 'weight-loss', 'health-score'
        target: battleConfig.target || 1e4,
        stakes: battleConfig.stakes || "bragging-rights",
        // 'bragging-rights', 'money', 'subscription'
        stakeAmount: battleConfig.stakeAmount || 0
      },
      startDate: null,
      endDate: null,
      status: "pending",
      // pending, active, completed
      leaderboard: [],
      shareCode,
      created: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.activeBattles.push(battle);
    await this.saveData();
    try {
      const { default: battleNotificationsService } = await __vitePreload(async () => {
        const { default: battleNotificationsService2 } = await import("./chunk-1767948920159-battleNotificationsService.js");
        return { default: battleNotificationsService2 };
      }, true ? __vite__mapDeps([0,1,2]) : void 0);
      await battleNotificationsService.sendBattleInvite({
        creatorName: user.name || "A friend",
        goal: battle.config.goal,
        battleId: battle.id
      });
    } catch (error) {
    }
    return {
      success: true,
      battleId: battle.id,
      shareCode: battle.shareCode,
      battle
    };
  }
  // Join existing battle
  async joinBattle(battleId) {
    const user = authService.getCurrentUser();
    if (!user) return { success: false, error: "Not logged in" };
    const battle = this.activeBattles.find((b) => b.id === battleId);
    if (!battle) return { success: false, error: "Battle not found" };
    if (battle.participants.includes(user.id)) {
      return { success: false, error: "Already joined" };
    }
    battle.participants.push(user.id);
    if (battle.participants.length >= 2 && battle.status === "pending") {
      battle.status = "active";
      battle.startDate = (/* @__PURE__ */ new Date()).toISOString();
      battle.endDate = new Date(Date.now() + battle.config.duration * 24 * 60 * 60 * 1e3).toISOString();
      await this.initializeLeaderboard(battle);
      try {
        const { default: battleNotificationsService } = await __vitePreload(async () => {
          const { default: battleNotificationsService2 } = await import("./chunk-1767948920159-battleNotificationsService.js");
          return { default: battleNotificationsService2 };
        }, true ? __vite__mapDeps([0,1,2]) : void 0);
        await battleNotificationsService.scheduleBattleEndingReminder({
          battleId: battle.id,
          name: `${battle.config.goal} Battle`,
          endDate: battle.endDate
        });
      } catch (error) {
      }
    }
    await this.saveData();
    return {
      success: true,
      battle,
      message: "Joined battle successfully!"
    };
  }
  // Initialize leaderboard
  async initializeLeaderboard(battle) {
    const leaderboard = [];
    for (const userId of battle.participants) {
      const avatarState = await healthAvatarService.getAvatarState();
      const startScore = this.getRelevantScore(battle.config.goal, avatarState);
      leaderboard.push({
        userId,
        userName: "User",
        // Would fetch real name
        startScore,
        currentScore: startScore,
        progress: 0,
        rank: 0
      });
    }
    battle.leaderboard = leaderboard;
    this.updateRankings(battle);
  }
  // Get relevant score based on battle goal
  getRelevantScore(goal, avatarState) {
    switch (goal) {
      case "health-score":
        return avatarState?.current?.score || 0;
      case "steps":
        return 0;
      // Will track daily
      case "weight-loss":
        return 0;
      // Will track from profile
      default:
        return 0;
    }
  }
  // Update battle progress
  async updateProgress(battleId) {
    const battle = this.activeBattles.find((b) => b.id === battleId);
    if (!battle || battle.status !== "active") return;
    const user = authService.getCurrentUser();
    const participant = battle.leaderboard.find((p) => p.userId === user.id);
    if (!participant) return;
    const avatarState = await healthAvatarService.getAvatarState();
    participant.currentScore = this.getRelevantScore(battle.config.goal, avatarState);
    participant.progress = participant.currentScore - participant.startScore;
    this.updateRankings(battle);
    if (/* @__PURE__ */ new Date() >= new Date(battle.endDate)) {
      await this.completeBattle(battle);
    }
    await this.saveData();
    return { success: true, leaderboard: battle.leaderboard };
  }
  // Update rankings
  updateRankings(battle) {
    battle.leaderboard.sort((a, b) => {
      if (battle.config.goal === "weight-loss") {
        return b.progress - a.progress;
      }
      return b.progress - a.progress;
    });
    battle.leaderboard.forEach((participant, index) => {
      participant.rank = index + 1;
    });
  }
  // Complete battle and determine winner
  async completeBattle(battle) {
    battle.status = "completed";
    const winner = battle.leaderboard[0];
    const loser = battle.leaderboard[battle.leaderboard.length - 1];
    battle.results = {
      winner: {
        userId: winner.userId,
        userName: winner.userName,
        finalScore: winner.currentScore,
        improvement: winner.progress
      },
      loser: {
        userId: loser.userId,
        userName: loser.userName,
        finalScore: loser.currentScore,
        improvement: loser.progress
      },
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (battle.config.stakes === "subscription") {
      battle.results.paymentDue = {
        from: loser.userId,
        to: winner.userId,
        amount: battle.config.stakeAmount,
        description: "Premium subscription payment"
      };
    } else if (battle.config.stakes === "money") {
      battle.results.paymentDue = {
        from: loser.userId,
        to: winner.userId,
        amount: battle.config.stakeAmount,
        description: "Battle winnings"
      };
    }
    this.completedBattles.push(battle);
    this.activeBattles = this.activeBattles.filter((b) => b.id !== battle.id);
    const user = authService.getCurrentUser();
    if (user) {
      const isWinner = winner.userId === user.id;
      const isLoser = loser.userId === user.id;
      if (isWinner) {
        this.userStats.wins++;
      } else if (isLoser) {
        this.userStats.losses++;
      }
      this.userStats.totalBattles++;
      this.userStats.winRate = this.userStats.totalBattles > 0 ? Math.round(this.userStats.wins / this.userStats.totalBattles * 100) : 0;
      try {
        const { default: battleNotificationsService } = await __vitePreload(async () => {
          const { default: battleNotificationsService2 } = await import("./chunk-1767948920159-battleNotificationsService.js");
          return { default: battleNotificationsService2 };
        }, true ? __vite__mapDeps([0,1,2]) : void 0);
        const xpEarned = isWinner ? 100 : 25;
        if (isWinner) {
          await battleNotificationsService.sendBattleVictory({
            name: `${battle.config.goal} Battle`,
            xp: xpEarned,
            battleId: battle.id
          });
        } else if (isLoser) {
          await battleNotificationsService.sendBattleDefeat({
            name: `${battle.config.goal} Battle`,
            xp: xpEarned,
            battleId: battle.id
          });
        }
      } catch (error) {
      }
    }
    await this.saveData();
    return battle.results;
  }
  // Get live leaderboard
  getLiveLeaderboard(battleId) {
    const battle = this.activeBattles.find((b) => b.id === battleId);
    if (!battle) return null;
    const leaderboardWithVIP = battle.leaderboard.map((participant) => ({
      ...participant,
      isVIP: this.checkUserVIPStatus(participant.userId)
    }));
    return {
      battleId: battle.id,
      status: battle.status,
      daysRemaining: this.calculateDaysRemaining(battle.endDate),
      leaderboard: leaderboardWithVIP,
      stakes: battle.config.stakes,
      stakeAmount: battle.config.stakeAmount
    };
  }
  // Check if user has VIP badge (Ultimate plan)
  checkUserVIPStatus(userId) {
    try {
      const { default: subscriptionService } = require("./subscriptionService");
      return subscriptionService.hasAccess("vipBadge");
    } catch (error) {
      return false;
    }
  }
  // Calculate days remaining
  calculateDaysRemaining(endDate) {
    if (!endDate) return null;
    const days = Math.ceil((new Date(endDate) - /* @__PURE__ */ new Date()) / (1e3 * 60 * 60 * 24));
    return Math.max(0, days);
  }
  // Generate share code
  generateShareCode(battleId) {
    return btoa(battleId).substring(0, 8).toUpperCase();
  }
  // Join by share code
  async joinByShareCode(shareCode) {
    const battleId = atob(shareCode.toLowerCase());
    return this.joinBattle(battleId);
  }
  // Get user's active battles
  getActiveBattles() {
    const user = authService.getCurrentUser();
    if (!user) return [];
    return this.activeBattles.filter(
      (b) => b.participants.includes(user.id)
    );
  }
  // Get battle history
  getBattleHistory() {
    const user = authService.getCurrentUser();
    if (!user) return [];
    return this.completedBattles.filter(
      (b) => b.participants.includes(user.id)
    );
  }
  // Get real-time step count from phone
  async getRealTimeSteps() {
    try {
      const { Pedometer } = await __vitePreload(async () => {
        const { Pedometer: Pedometer2 } = await import("./entry-1767948920134-index.js").then((n) => n.a8);
        return { Pedometer: Pedometer2 };
      }, true ? __vite__mapDeps([1,2]) : void 0);
      const result = await Pedometer.getStepCount();
      return result.steps || 0;
    } catch (error) {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      const baseSteps = Math.floor(Math.random() * 1e3) + hour * 500;
      return baseSteps;
    }
  }
  // Update battle with real step data
  async syncBattleProgress(battleId) {
    const battle = this.activeBattles.find((b) => b.id === battleId);
    if (!battle || battle.status !== "active") return;
    const user = authService.getCurrentUser();
    const participant = battle.leaderboard.find((p) => p.userId === user.id);
    if (!participant) return;
    const currentSteps = await this.getRealTimeSteps();
    participant.currentScore = currentSteps;
    participant.progress = currentSteps - participant.startScore;
    participant.lastUpdate = (/* @__PURE__ */ new Date()).toISOString();
    this.updateRankings(battle);
    return {
      success: true,
      currentSteps,
      progress: participant.progress,
      rank: participant.rank
    };
  }
  // Auto-sync all active battles
  async autoSyncAllBattles() {
    const activeBattles = this.getActiveBattles();
    for (const battle of activeBattles) {
      await this.syncBattleProgress(battle.id);
    }
    return { success: true, synced: activeBattles.length };
  }
  // Get battle stats
  getBattleStats() {
    const user = authService.getCurrentUser();
    if (!user) return null;
    return {
      totalBattles: this.userStats.totalBattles,
      wins: this.userStats.wins,
      losses: this.userStats.losses,
      winRate: this.userStats.winRate,
      activeBattles: this.getActiveBattles().length
    };
  }
}
const socialBattlesService = new SocialBattlesService();
export {
  socialBattlesService as default,
  socialBattlesService
};
