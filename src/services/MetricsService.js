const Server = require('../models/Server');
const Node = require('../models/Node');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

class MetricsService {
  static async getServerMetrics(serverId) {
    const server = await Server.findByPk(serverId);
    if (!server) {
      throw new ApiError(404, 'Servidor não encontrado');
    }

    // Coletar métricas do servidor
    const { stdout: dockerStats } = await exec(`docker stats --no-stream --format "{{.CPUPerc}},{{.MemUsage}}" ${server.id}`);
    const [cpu, memory] = dockerStats.split(',');

    return {
      cpu: parseFloat(cpu.replace('%', '')),
      memory: memory.split('/')[0].trim(),
      uptime: await this.getContainerUptime(server.id),
      network: await this.getNetworkStats(server.id),
      disk: await this.getDiskUsage(server.id)
    };
  }

  static async getNodeMetrics(nodeId) {
    const node = await Node.findByPk(nodeId);
    if (!node) {
      throw new ApiError(404, 'Node não encontrado');
    }

    const { stdout: nodeStats } = await exec('vmstat 1 2 | tail -1');
    const stats = nodeStats.trim().split(/\s+/);

    return {
      cpu_idle: parseInt(stats[14]),
      memory_free: parseInt(stats[3]),
      io_bi: parseInt(stats[8]),
      io_bo: parseInt(stats[9])
    };
  }

}

module.exports = MetricsService; 