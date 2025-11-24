// Social Health Battles Service - Compete with friends on health goals
import authService from './authService';
import healthAvatarService from './healthAvatarService';

class SocialBattlesService {
  constructor() {
    this.activeBattles = [];
    this.completedBattles = [];
  }

  // Create new health battle
  async createBattle(battleConfig) {
    const user = authService.getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    const battle = {
      id: 'BTL-' + Date.now(),
      creator: {
        id: user.id,
        name: user.name,
        avatar: user.profile.avatar
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
      created: new Date().toISOString()
    };

    this.activeBattles.push(battle);
    
    return {
      success: true,
      battle,
      shareCode: this.generateShareCode(battle.id)
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
    }

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

  // Get battle stats
  getBattleStats() {
    const user = authService.getCurrentUser();
    if (!user) return null;

    const completed = this.getBattleHistory();
    const wins = completed.filter(b => b.results?.winner?.userId === user.id).length;
    const losses = completed.filter(b => b.results?.loser?.userId === user.id).length;

    return {
      totalBattles: completed.length,
      wins,
      losses,
      winRate: completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0,
      activeBattles: this.getActiveBattles().length
    };
  }
}

export const socialBattlesService = new SocialBattlesService();
export default socialBattlesService;
