const WebSocket = require('ws');
const EmailService = require('./EmailService');

class NotificationService {
  static async notify(userId, notification) {
    // Enviar via WebSocket
    WebSocketService.sendToUser(userId, {
      type: 'notification',
      data: notification
    });

    // Salvar no banco
    await Notification.create({
      userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: false
    });

    // Enviar email se crítico
    if (notification.priority === 'high') {
      await EmailService.sendNotification(userId, notification);
    }
  }

  static async getUnread(userId) {
    return await Notification.findAll({
      where: { userId, read: false }
    });
  }
} 