const { Op } = require('sequelize');
const Server = require('../models/Server');
const Node = require('../models/Node');
const Plan = require('../models/Plan');
const ApiError = require('../utils/ApiError');

class ServerService {
  static async createServer(userId, serverData) {
    // Verificar plano
    const plan = await Plan.findByPk(serverData.plan_id);
    if (!plan) {
      throw new ApiError(404, 'Plano não encontrado');
    }

    // Encontrar node disponível
    const node = await Node.findOne({
      where: {
        status: 'online',
        memoria_usada: {
          [Op.lte]: sequelize.literal('memoria_total - ' + serverData.memoria)
        }
      }
    });

    if (!node) {
      throw new ApiError(503, 'Nenhum node disponível no momento');
    }

    // Criar servidor
    const server = await Server.create({
      ...serverData,
      userId,
      nodeId: node.id,
      status: 'installing',
      porta: await this.generatePort(),
      ip: node.ip
    });

    // Atualizar recursos do node
    await node.update({
      memoria_usada: node.memoria_usada + serverData.memoria,
      cpu_usado: node.cpu_usado + serverData.cpu,
      disco_usado: node.disco_usado + serverData.disco
    });

    return server;
  }

  static async listUserServers(userId) {
    return Server.findAll({
      where: { userId },
      include: [
        { model: Node, attributes: ['ip', 'localizacao'] },
        { model: Plan, attributes: ['nome'] }
      ]
    });
  }

  static async getServer(serverId, userId) {
    const server = await Server.findOne({
      where: { id: serverId, userId },
      include: [
        { model: Node, attributes: ['ip', 'localizacao'] },
        { model: Plan, attributes: ['nome'] }
      ]
    });

    if (!server) {
      throw new ApiError(404, 'Servidor não encontrado');
    }

    return server;
  }

  static async powerAction(serverId, userId, action) {
    const server = await this.getServer(serverId, userId);

    switch (action) {
      case 'start':
        if (server.status === 'online') {
          throw new ApiError(400, 'Servidor já está online');
        }
        await server.update({ status: 'online' });
        return { message: 'Servidor iniciado com sucesso' };

      case 'stop':
        if (server.status === 'offline') {
          throw new ApiError(400, 'Servidor já está offline');
        }
        await server.update({ status: 'offline' });
        return { message: 'Servidor parado com sucesso' };

      case 'restart':
        await server.update({ status: 'restarting' });
        // Lógica de restart aqui
        await server.update({ status: 'online' });
        return { message: 'Servidor reiniciado com sucesso' };

      default:
        throw new ApiError(400, 'Ação inválida');
    }
  }

  static async deleteServer(serverId, userId) {
    const server = await this.getServer(serverId, userId);
    const node = await Node.findByPk(server.nodeId);

    // Liberar recursos do node
    await node.update({
      memoria_usada: node.memoria_usada - server.memoria,
      cpu_usado: node.cpu_usado - server.cpu,
      disco_usado: node.disco_usado - server.disco
    });

    await server.destroy();
  }

  static async generatePort() {
    // Lógica para gerar uma porta disponível
    const minPort = 25565;
    const maxPort = 30000;
    
    while (true) {
      const port = Math.floor(Math.random() * (maxPort - minPort + 1) + minPort);
      const existingServer = await Server.findOne({ where: { porta: port } });
      if (!existingServer) {
        return port;
      }
    }
  }
}

module.exports = ServerService; 