const Server = require('../models/Server');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const path = require('path');
const fs = require('fs').promises;

class BackupService {
  static async createBackup(serverId) {
    const server = await Server.findByPk(serverId);
    if (!server) {
      throw new ApiError(404, 'Servidor não encontrado');
    }

    const backupPath = path.join(__dirname, '../../backups', `${server.id}`);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}.tar.gz`;

    // Criar diretório se não existir
    await fs.mkdir(backupPath, { recursive: true });

    // Executar backup
    await execAsync(`tar -czf ${path.join(backupPath, backupName)} -C /path/to/server/${server.id} .`);

    return {
      path: path.join(backupPath, backupName),
      timestamp: new Date(),
      size: (await fs.stat(path.join(backupPath, backupName))).size
    };
  }

  static async listBackups(serverId) {
    const backupPath = path.join(__dirname, '../../backups', `${serverId}`);
    try {
      const files = await fs.readdir(backupPath);
      return Promise.all(files.map(async (file) => {
        const stats = await fs.stat(path.join(backupPath, file));
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime
        };
      }));
    } catch (error) {
      return [];
    }
  }

  static async restoreBackup(serverId, backupName) {
    const server = await Server.findByPk(serverId);
    if (!server) {
      throw new ApiError(404, 'Servidor não encontrado');
    }

    const backupPath = path.join(__dirname, '../../backups', `${server.id}`, backupName);
    
    // Parar o servidor
    await ServerService.powerAction(serverId, server.userId, 'stop');

    // Restaurar backup
    await execAsync(`tar -xzf ${backupPath} -C /path/to/server/${server.id}`);

    // Reiniciar servidor
    await ServerService.powerAction(serverId, server.userId, 'start');

    return { message: 'Backup restaurado com sucesso' };
  }
}

module.exports = BackupService; 