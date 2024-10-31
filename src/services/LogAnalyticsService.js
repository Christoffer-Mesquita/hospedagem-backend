class LogAnalyticsService {
  static async analyzeServerLogs(serverId) {
    const logs = await ServerLogs.findAll({
      where: { serverId },
      order: [['createdAt', 'DESC']],
      limit: 1000
    });

    return {
      errorPatterns: this.detectErrorPatterns(logs),
      performanceIssues: this.analyzePerformance(logs),
      securityThreats: this.detectSecurityIssues(logs),
      recommendations: this.generateRecommendations(logs)
    };
  }
} 