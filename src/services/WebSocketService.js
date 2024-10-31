const WebSocket = require('ws');
const MetricsService = require('./MetricsService');

class WebSocketService {
  static wss;

  static initialize(server) {
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', (ws) => {
      ws.on('message', async (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'subscribe') {
          // Enviar atualizações em tempo real
          setInterval(async () => {
            const metrics = await MetricsService.getServerMetrics(data.serverId);
            ws.send(JSON.stringify({
              type: 'metrics',
              data: metrics
            }));
          }, 1000);
        }
      });
    });
  }

  static broadcast(data) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

module.exports = WebSocketService; 