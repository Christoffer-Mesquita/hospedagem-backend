const catchAsync = require('../utils/catchAsync');
const ServerService = require('../services/ServerService');
const BackupService = require('../services/BackupService');

class ServerController {
  static createServer = catchAsync(async (req, res) => {
    const server = await ServerService.createServer(req.user.id, req.body);
    res.status(201).json(server);
  });

  static listServers = catchAsync(async (req, res) => {
    const servers = await ServerService.listUserServers(req.user.id);
    res.json(servers);
  });

  static getServer = catchAsync(async (req, res) => {
    const server = await ServerService.getServer(req.params.id, req.user.id);
    res.json(server);
  });

  static powerAction = catchAsync(async (req, res) => {
    const result = await ServerService.powerAction(req.params.id, req.user.id, req.body.action);
    res.json(result);
  });

  static deleteServer = catchAsync(async (req, res) => {
    await ServerService.deleteServer(req.params.id, req.user.id);
    res.status(204).send();
  });

  static createBackup = catchAsync(async (req, res) => {
    const backup = await BackupService.createBackup(req.params.id);
    res.json(backup);
  });

  static listBackups = catchAsync(async (req, res) => {
    const backups = await BackupService.listBackups(req.params.id);
    res.json(backups);
  });

  static restoreBackup = catchAsync(async (req, res) => {
    const result = await BackupService.restoreBackup(req.params.id, req.body.backupName);
    res.json(result);
  });
}

module.exports = ServerController; 