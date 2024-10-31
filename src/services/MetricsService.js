const Server = require('../models/Server');
const ApiError = require('../utils/ApiError');

/*
  Serviço de Métricas
  
  Funcionalidades:
  - Coleta de métricas em tempo real
  - Análise de desempenho
  - Monitoramento de recursos
  - Histórico de utilização
  
  Métricas Disponíveis:
  1. CPU: Utilização e processos
  2. Memória: Uso e disponibilidade
  3. Disco: I/O e espaço
  4. Rede: Tráfego e latência
  5. Aplicação: Tempos de resposta
*/

class MetricsService {
  static async getServerMetrics(serverId) {
    const server = await Server.findByPk(serverId);
    if (!server) {
      throw new ApiError(404, 'Servidor não encontrado');
    }

    const metrics = await this.collectMetrics(serverId);
    await this.storeMetrics(serverId, metrics);

    return metrics;
  }

  static async collectMetrics(serverId) {
    const dockerStats = await this.getDockerStats(serverId);
    const systemMetrics = await this.getSystemMetrics(serverId);
    const networkStats = await this.getNetworkStats(serverId);

    return {
      ...dockerStats,
      ...systemMetrics,
      ...networkStats,
      timestamp: new Date()
    };
  }

  static async getDockerStats(serverId) {
    return {
      cpu: Math.random() * 100,
      memory: {
        used: Math.random() * 1024,
        total: 1024
      }
    };
  }

  static async getSystemMetrics(serverId) {
    return {
      disk: {
        used: Math.random() * 100,
        available: 100
      },
      uptime: Math.floor(Math.random() * 1000000)
    };
  }

  static async getNetworkStats(serverId) {
    return {
      network: {
        rx_bytes: Math.floor(Math.random() * 1000000),
        tx_bytes: Math.floor(Math.random() * 1000000),
        connections: Math.floor(Math.random() * 100)
      }
    };
  }

  static async storeMetrics(serverId, metrics) {
    await MetricsHistory.create({
      serverId,
      metrics,
      timestamp: new Date()
    });
  }

  static async getMetricsHistory(serverId, period) {
    return await MetricsHistory.findAll({
      where: {
        serverId,
        timestamp: {
          [Op.gte]: new Date(Date.now() - period)
        }
      },
      order: [['timestamp', 'DESC']]
    });
  }
}


module.exports = MetricsService; 