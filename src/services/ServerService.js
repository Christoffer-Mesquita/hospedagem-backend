const Docker = require('dockerode');
const Server = require('../models/Server');
const Node = require('../models/Node');
const Plan = require('../models/Plan');
const ApiError = require('../utils/ApiError');
const fs = require('fs').promises;
const path = require('path');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/*
  Serviço de Gerenciamento de Servidores
  
  Funcionalidades:
  - Criação de servidores via Docker
  - Gerenciamento de containers
  - Templates pré-configurados
  - Controle de recursos
  - Monitoramento em tempo real
*/

class ServerService {
  static docker = new Docker();
  static templatesPath = path.join(__dirname, '../templates');
  static serversPath = path.join(__dirname, '../../data/servers');

  static serverTemplates = {
    minecraft: {
      image: 'itzg/minecraft-server',
      env: {
        EULA: 'TRUE',
        TYPE: 'SPIGOT',
        MEMORY: '${memory}M',
        VERSION: '1.20.2'
      },
      ports: ['25565/tcp'],
      volumes: ['${dataDir}:/data'],
      defaultPlugins: ['essentials', 'worldedit', 'vault']
    },
    discord_bot: {
      image: 'node:16',
      workdir: '/usr/src/app',
      command: 'npm start',
      volumes: ['${dataDir}:/usr/src/app'],
      env: {
        NODE_ENV: 'production'
      }
    },
    vps: {
      image: 'ubuntu:22.04',
      command: '/sbin/init',
      privileged: true,
      volumes: ['${dataDir}:/root']
    }
  };

  static async createServer(userId, serverData) {
    try {
      // Verificar se usuário tem plano ativo
      const userPlan = await sequelize.models.UserPlans.findOne({
        where: {
          userId,
          status: 'active'
        },
        include: [{
          model: Plan,
          required: true
        }]
      });

      if (!userPlan) {
        throw new ApiError(403, 'Você precisa ter um plano ativo para criar servidores');
      }

      const plan = userPlan.Plan;

      // Validar recursos com base no plano
      if (serverData.memoria > plan.memoria) {
        throw new ApiError(400, 'Memória solicitada excede o limite do plano');
      }
      if (serverData.cpu > plan.cpu) {
        throw new ApiError(400, 'CPU solicitada excede o limite do plano');
      }
      if (serverData.disco > plan.disco) {
        throw new ApiError(400, 'Disco solicitado excede o limite do plano');
      }

      // Encontrar node disponível
      const node = await this.findAvailableNode(serverData);
      if (!node) {
        throw new ApiError(503, 'Nenhum node disponível no momento');
      }

      // Criar registro do servidor
      const server = await Server.create({
        ...serverData,
        userId,
        planId: plan.id,
        nodeId: node.id,
        status: 'creating'
      });

      // Criar diretório de dados
      const serverDir = path.join(this.serversPath, server.id.toString());
      await fs.mkdir(serverDir, { recursive: true });

      // Configurar e iniciar container
      await this.setupContainer(server, node);

      // Atualizar status
      await server.update({ status: 'online' });

      return server;
    } catch (error) {
      console.error('Erro ao criar servidor:', error);
      throw error;
    }
  }

  static async setupContainer(server, node) {
    const template = this.serverTemplates[server.tipo];
    if (!template) {
      throw new ApiError(400, 'Tipo de servidor inválido');
    }

    const dataDir = path.join(this.serversPath, server.id.toString());
    const containerConfig = {
      Image: template.image,
      name: `server-${server.id}`,
      Env: Object.entries(template.env).map(([key, value]) => 
        `${key}=${value.replace('${memory}', server.memoria.toString())}`
      ),
      HostConfig: {
        Memory: server.memoria * 1024 * 1024, // Converter MB para bytes
        MemorySwap: -1,
        CpuPercent: server.cpu,
        Binds: template.volumes.map(v => 
          v.replace('${dataDir}', dataDir)
        ),
        PortBindings: this.generatePortBindings(template.ports)
      }
    };

    // Criar e iniciar container
    const container = await this.docker.createContainer(containerConfig);
    await container.start();

    // Se for Minecraft, instalar plugins padrão
    if (server.tipo === 'minecraft') {
      await this.setupMinecraftPlugins(dataDir);
    }

    return container;
  }

  static async setupMinecraftPlugins(serverDir) {
    const pluginsDir = path.join(serverDir, 'plugins');
    await fs.mkdir(pluginsDir, { recursive: true });

    // Download e instalação dos plugins padrão
    for (const plugin of this.serverTemplates.minecraft.defaultPlugins) {
      await this.downloadPlugin(plugin, pluginsDir);
    }
  }

  static async downloadPlugin(pluginName, pluginsDir) {
    // Implementar download de plugins do SpigotMC
    // Esta é uma versão simplificada
    console.log(`Baixando plugin ${pluginName} para ${pluginsDir}`);
  }

  static generatePortBindings(ports) {
    const bindings = {};
    ports.forEach(port => {
      const [containerPort, protocol] = port.split('/');
      bindings[`${containerPort}/${protocol}`] = [{
        HostPort: this.generateRandomPort().toString()
      }];
    });
    return bindings;
  }

  static generateRandomPort() {
    return Math.floor(Math.random() * (65535 - 49152 + 1) + 49152);
  }

  static async findAvailableNode(serverData) {
    return await Node.findOne({
      where: {
        status: 'online',
        memoria_usada: {
          [Op.lte]: sequelize.literal(`memoria_total - ${serverData.memoria}`)
        }
      }
    });
  }

  static async powerAction(serverId, userId, action) {
    const server = await Server.findOne({
      where: { id: serverId, userId }
    });

    if (!server) {
      throw new ApiError(404, 'Servidor não encontrado');
    }

    const container = this.docker.getContainer(`server-${serverId}`);

    switch (action) {
      case 'start':
        await container.start();
        await server.update({ status: 'online' });
        break;
      case 'stop':
        await container.stop();
        await server.update({ status: 'offline' });
        break;
      case 'restart':
        await container.restart();
        await server.update({ status: 'restarting' });
        setTimeout(async () => {
          await server.update({ status: 'online' });
        }, 30000);
        break;
      default:
        throw new ApiError(400, 'Ação inválida');
    }

    return { message: `Servidor ${action} com sucesso` };
  }

  static async deleteServer(serverId, userId) {
    const server = await Server.findOne({
      where: { id: serverId, userId }
    });

    if (!server) {
      throw new ApiError(404, 'Servidor não encontrado');
    }

    try {
      // Parar e remover container
      const container = this.docker.getContainer(`server-${serverId}`);
      await container.stop();
      await container.remove();

      // Remover diretório de dados
      const serverDir = path.join(this.serversPath, serverId.toString());
      await fs.rmdir(serverDir, { recursive: true });

      // Remover registro do banco
      await server.destroy();
    } catch (error) {
      console.error('Erro ao deletar servidor:', error);
      throw new ApiError(500, 'Falha ao deletar servidor');
    }
  }
}

module.exports = ServerService; 