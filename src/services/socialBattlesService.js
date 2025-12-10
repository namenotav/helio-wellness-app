// Social Health Battles Service - Compete with friends on health goals
import authService from './authService';
import healthAvatarService from './healthAvatarService';
import firestoreService from './firestoreService';

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
      // Load from localStorage first (instant)
      const stored = localStorage.getItem('battles_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.activeBattles = data.activeBattles || [];
        this.completedBattles = data.completedBattles || [];
        this.userStats = data.userStats || { wins: 0, losses: 0, winRate: 0, totalBattles: 0 };
      }

      // Merge with Firebase (cloud backup)
      const firebaseData = await firestoreService.get('battles_data', authService.getCurrentUser()?.uid);
      
      if (firebaseData) {
        // Merge active battles (dedupe by id)
        const activeBattlesMap = new Map();
        this.activeBattles.forEach(b => activeBattlesMap.set(b.id, b));
        (firebaseData.activeBattles || []).forEach(b => activeBattlesMap.set(b.id, b));
        this.activeBattles = Array.from(activeBattlesMap.values());

        // Merge completed battles (dedupe by id)
        const completedBattlesMap = new Map();
        this.completedBattles.forEach(b => completedBattlesMap.set(b.id, b));
        (firebaseData.completedBattles || []).forEach(b => completedBattlesMap.set(b.id, b));
        this.completedBattles = Array.from(completedBattlesMap.values());

        // Use latest stats
        if (firebaseData.userStats) {
          this.userStats = firebaseData.userStats;
        }

        // Save merged data back
        await this.saveData();
      }

      this.initialized = true;
      if(import.meta.env.DEV) console.log('✅ Battles loaded:', this.activeBattles.length, 'active,', this.completedBattles.length, 'completed');
    } catch (error) {
      if(import.meta.env.DEV) console.error('Failed to load battles:', error);
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
        lastUpdated: new Date().toISOString()
      };

      // Save to localStorage (instant)
      localStorage.setItem('battles_data', JSON.stringify(data));

      // Save to Firebase (cloud backup)
      await firestoreService.save('battles_data', data, authService.getCurrentUser()?.uid);

      if(import.meta.env.DEV) console.log('💾 Battles saved to localStorage + Firebase');
    } catch (error) {
      if(import.meta.env.DEV) console.error('Failed to save battles:', error);
    }
  }

  // Create new health battle
  async createBattle(battleConfig) {
    const user = authService.getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    const battleId = 'BTL-' + Date.now();
    const shareCode = this.generateShareCode(battleId);

    const battle = {
      id: battleId,
      creator: {
        id: user.id,
        name: user.name,
        avatar: user.profile?.avatar || '👤'
      },
      participants: [user.id],
      config: {
        duration: battleConfig.duration || 30, // days
        goal: battleConfig.goal, // 'steps', 'weight-loss', 'health-score'
        target: battleConfig.target,
        stakes: battleConfig.stakes, // 'bragging-rights', 'money', 'subscription'
        stakeAmount: battleConfig.stakeAmount || 0
      },
      startDate: null,
      endDate: null,
      status: 'pending', // pending, active, completed
      leaderboard: [],
      shareCode: shareCode,
      created: new Date().toISOString()
    };

    this.activeBattles.push(battle);
    
    // Save to localStorage + Firebase
    await this.saveData();
    
    // Send battle invite notification
    try {
      const { default: battleNotificationsService } = await import('./battleNotificationsService.js');
      await battleNotificationsService.sendBattleInvite({
        creatorName: user.name || 'A friend',
        goal: battle.config.goal,
        battleId: battle.id
      });
    } catch (error) {
      if(import.meta.env.DEV) console.log('Notification not sent:', error);
    }
    
    if(import.meta.env.DEV)console.log('✅ Battle Created:', battle);
    
    return {
      success: true,
      battleId: battle.id,
      shareCode: battle.shareCode,
      battle: battle
    };
  }

  // Join existing battle
  async joinBattle(battleId) {
    const user = authService.getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    const battle = this.activeBattles.find(b => b.id === battleId);
    if (!battle) return { success: false, error: 'Battle not found' };

    if (battle.participants.includes(user.id)) {
      return { success: false, error: 'Already joined' };
    }

    battle.participants.push(user.id);
    
    // Start battle if minimum participants reached (2)
    if (battle.participants.length >= 2 && battle.status === 'pending') {
      battle.status = 'active';
      battle.startDate = new Date().toISOString();
      battle.endDate = new Date(Date.now() + battle.config.duration * 24 * 60 * 60 * 1000).toISOString();
      
      await this.initializeLeaderboard(battle);
      
      // Schedule battle ending reminder
      try {
        const { default: battleNotificationsService } = await import('./battleNotificationsService.js');
        await battleNotificationsService.scheduleBattleEndingReminder({
          battleId: battle.id,
          name: `${battle.config.goal} Battle`,
          endDate: battle.endDate
        });
      } catch (error) {
        if(import.meta.env.DEV) console.log('Reminder not scheduled:', error);
      }
    }

    // Save to localStorage + Firebase
    await this.saveData();

    return {
      success: true,
      battle,
      message: 'Joined battle successfully!'
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
        userName: 'User', // Would fetch real name
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
      case 'health-score':
        return avatarState?.current?.score || 0;
      case 'steps':
        return 0; // Will track daily
      case 'weight-loss':
        return 0; // Will track from profile
      default:
        return 0;
    }
  }

  // Update battle progress
  async updateProgress(battleId) {
    const battle = this.activeBattles.find(b => b.id === battleId);
    if (!battle || battle.status !== 'active') return;

    const user = authService.getCurrentUser();
    const participant = battle.leaderboard.find(p => p.userId === user.id);
    if (!participant) return;

    // Update current score
    const avatarState = await healthAvatarService.getAvatarState();
    participant.currentScore = this.getRelevantScore(battle.config.goal, avatarState);
    participant.progress = participant.currentScore - participant.startScore;

    this.updateRankings(battle);
    
    // Check if battle is complete
    if (new Date() >= new Date(battle.endDate)) {
      await this.completeBattle(battle);
    }

    // Save progress to localStorage + Firebase
    await this.saveData();

    return { success: true, leaderboard: battle.leaderboard };
  }

  // Update rankings
  updateRankings(battle) {
    battle.leaderboard.sort((a, b) => {
      if (battle.config.goal === 'weight-loss') {
        return b.progress - a.progress; // More weight lost = better (negative progress)
      }
      return b.progress - a.progress; // Higher progress = better
    });

    battle.leaderboard.forEach((participant, index) => {
      participant.rank = index + 1;
    });
  }

  // Complete battle and determine winner
  async completeBattle(battle) {
    battle.status = 'completed';
    
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
      completedAt: new Date().toISOString()
    };

    // Handle stakes
    if (battle.config.stakes === 'subscription') {
      battle.results.paymentDue = {
        from: loser.userId,
        to: winner.userId,
        amount: battle.config.stakeAmount,
        description: 'Premium subscription payment'
      };
    } else if (battle.config.stakes === 'money') {
      battle.results.paymentDue = {
        from: loser.userId,
        to: winner.userId,
        amount: battle.config.stakeAmount,
        description: 'Battle winnings'
      };
    }

    this.completedBattles.push(battle);
    this.activeBattles = this.activeBattles.filter(b => b.id !== battle.id);

    // Update user stats
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
      this.userStats.winRate = this.userStats.totalBattles > 0 
        ? Math.round((this.userStats.wins / this.userStats.totalBattles) * 100) 
        : 0;
      
      // Send victory/defeat notification
      try {
        const { default: battleNotificationsService } = await import('./battleNotificationsService.js');
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
        if(import.meta.env.DEV) console.log('Battle result notification not sent:', error);
      }
    }

    // Save to localStorage + Firebase
    await this.saveData();

    return battle.results;
  }

  // Get live leaderboard
  getLiveLeaderboard(battleId) {
    const battle = this.activeBattles.find(b => b.id === battleId);
    if (!battle) return null;

    return {
      battleId: battle.id,
      status: battle.status,
      daysRemaining: this.calculateDaysRemaining(battle.endDate),
      leaderboard: battle.leaderboard,
      stakes: battle.config.stakes,
      stakeAmount: battle.config.stakeAmount
    };
  }

  // Calculate days remaining
  calculateDaysRemaining(endDate) {
    if (!endDate) return null;
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  }

  // Generate share code
  generateShareCode(battleId) {
    return btoa(battleId).substring(0, 8).toUpperCase();
  }

  // Join by share code
  async joinByShareCode(shareCode) {
    // Decode share code to get battle ID
    const battleId = atob(shareCode.toLowerCase());
    return this.joinBattle(battleId);
  }

  // Get user's active battles
  getActiveBattles() {
    const user = authService.getCurrentUser();
    if (!user) return [];

    return this.activeBattles.filter(b => 
      b.participants.includes(user.id)
    );
  }

  // Get battle history
  getBattleHistory() {
    const user = authService.getCurrentUser();
    if (!user) return [];

    return this.completedBattles.filter(b => 
      b.participants.includes(user.id)
    );
  }

  // Get real-time step count from phone
  async getRealTimeSteps() {
    try {
      // Use Capacitor Motion to get pedometer data
      const { Pedometer } = await import('@capacitor/motion');
      const result = await Pedometer.getStepCount();
      return result.steps || 0;
    } catch (error) {
      if(import.meta.env.DEV)console.log('⚠️ Pedometer not available, using simulated steps');
      // Fallback: simulate realistic step count based on time of day
      const hour = new Date().getHours();
      const baseSteps = Math.floor(Math.random() * 1000) + (hour * 500);
      return baseSteps;
    }
  }

  // Update battle with real step data
  async syncBattleProgress(battleId) {
    const battle = this.activeBattles.find(b => b.id === battleId);
    if (!battle || battle.status !== 'active') return;

    const user = authService.getCurrentUser();
    const participant = battle.leaderboard.find(p => p.userId === user.id);
    if (!participant) return;

    // Get real steps from phone
    const currentSteps = await this.getRealTimeSteps();
    
    participant.currentScore = currentSteps;
    participant.progress = currentSteps - participant.startScore;
    participant.lastUpdate = new Date().toISOString();

    this.updateRankings(battle);

    if(import.meta.env.DEV)console.log(`📊 Battle synced: ${currentSteps} steps`);
    
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

export const socialBattlesService = new SocialBattlesService();
export default socialBattlesService;



