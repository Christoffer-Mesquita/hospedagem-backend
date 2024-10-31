const Node = require('../models/Node');
const ApiError = require('../utils/ApiError');

class NodeService {
  static async listNodes() {
    return Node.findAll();
  }

  static async createNode(nodeData) {
    return Node.create(nodeData);
  }

  static async getNode(nodeId) {
    const node = await Node.findByPk(nodeId);
    if (!node) {
      throw new ApiError(404, 'Node não encontrado');
    }
    return node;
  }

  static async updateNode(nodeId, nodeData) {
    const node = await this.getNode(nodeId);
    return node.update(nodeData);
  }

  static async deleteNode(nodeId) {
    const node = await this.getNode(nodeId);
    
    // Verificar se há servidores ativos neste node
    const activeServers = await node.getServers({
      where: {
        status: ['online', 'installing']
      }
    });

    if (activeServers.length > 0) {
      throw new ApiError(400, 'Não é possível deletar um node com servidores ativos');
    }

    await node.destroy();
  }
}

module.exports = NodeService; 