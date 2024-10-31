const Node = require('../models/Node');
const Server = require('../models/Server');
const ApiError = require('../utils/ApiError');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/*
  Serviço de Gerenciamento de Nodes
  
  Funcionalidades:
  - Gerenciamento de nodes físicos
  - Monitoramento de recursos
  - Balanceamento de carga
  - Manutenção automática
  
  Recursos Monitorados:
  1. CPU: Utilização e temperatura
  2. Memória: Uso e disponibilidade
  3. Disco: Espaço e performance
  4. Rede: Latência e throughput
  5. Saúde: Status e uptime
*/

class NodeService {
  static async configureNetwork(node) {
    try {
      // Configurar interface de rede
      await execAsync(`ip addr add ${node.ip}/24 dev eth0`);
      
      // Configurar DNS
      await execAsync('echo "nameserver 8.8.8.8" >> /etc/resolv.conf');
      
      // Configurar regras de firewall básicas
      await execAsync('iptables -F'); // Limpar regras existentes
      await execAsync('iptables -P INPUT DROP'); // Política padrão: drop
      await execAsync('iptables -P FORWARD DROP');
      await execAsync('iptables -P OUTPUT ACCEPT');
      
      // Permitir conexões estabelecidas
      await execAsync('iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT');
      
      // Permitir SSH
      await execAsync('iptables -A INPUT -p tcp --dport 22 -j ACCEPT');
      
      // Permitir portas de serviço
      await execAsync('iptables -A INPUT -p tcp --dport 25565:30000 -j ACCEPT'); // Portas para servidores
      
      // Salvar configurações
      await execAsync('netfilter-persistent save');
      
      return true;
    } catch (error) {
      console.error('Erro ao configurar rede:', error);
      throw new ApiError(500, 'Falha ao configurar rede do node');
    }
  }

  static async setupMonitoring(node) {
    try {
      // Instalar ferramentas de monitoramento
      await execAsync('apt-get update && apt-get install -y prometheus-node-exporter collectd');
      
      // Configurar Prometheus Node Exporter
      const prometheusConfig = `
        global:
          scrape_interval: 15s
        scrape_configs:
          - job_name: 'node'
            static_configs:
              - targets: ['localhost:9100']
      `;
      
      await execAsync(`echo '${prometheusConfig}' > /etc/prometheus/prometheus.yml`);
      
      // Configurar Collectd para métricas detalhadas
      const collectdConfig = `
        LoadPlugin cpu
        LoadPlugin memory
        LoadPlugin disk
        LoadPlugin network
        LoadPlugin load
        LoadPlugin processes
        
        <Plugin cpu>
          ReportByCpu true
          ValuesPercentage true
        </Plugin>
      `;
      
      await execAsync(`echo '${collectdConfig}' > /etc/collectd/collectd.conf`);
      
      // Reiniciar serviços
      await execAsync('systemctl restart prometheus-node-exporter collectd');
      
      // Registrar node no sistema de monitoramento central
      await this.registerNodeMonitoring(node);
      
      return true;
    } catch (error) {
      console.error('Erro ao configurar monitoramento:', error);
      throw new ApiError(500, 'Falha ao configurar monitoramento do node');
    }
  }

  static async enableFirewall(node) {
    try {
      // Configurar UFW (Uncomplicated Firewall)
      await execAsync('ufw --force reset'); // Resetar configurações
      await execAsync('ufw default deny incoming');
      await execAsync('ufw default allow outgoing');
      
      // Permitir SSH
      await execAsync('ufw allow ssh');
      
      // Permitir portas de monitoramento
      await execAsync('ufw allow 9100'); // Prometheus Node Exporter
      await execAsync('ufw allow 9103'); // Collectd
      
      // Permitir range de portas para servidores
      await execAsync('ufw allow 25565:30000/tcp'); // Portas para servidores
      
      // Permitir ICMP (ping)
      await execAsync('ufw allow icmp');
      
      // Habilitar firewall
      await execAsync('ufw --force enable');
      
      // Configurar fail2ban para proteção adicional
      await execAsync('apt-get install -y fail2ban');
      const fail2banConfig = `
        [DEFAULT]
        bantime = 3600
        findtime = 600
        maxretry = 5
        
        [sshd]
        enabled = true
      `;
      
      await execAsync(`echo '${fail2banConfig}' > /etc/fail2ban/jail.local`);
      await execAsync('systemctl restart fail2ban');
      
      return true;
    } catch (error) {
      console.error('Erro ao configurar firewall:', error);
      throw new ApiError(500, 'Falha ao configurar firewall do node');
    }
  }

  static async balanceLoad() {
    try {
      // Obter todos os nodes ativos
      const nodes = await Node.findAll({
        where: { status: 'online' },
        include: [{
          model: Server,
          attributes: ['id', 'memoria', 'cpu', 'disco']
        }]
      });

      // Calcular carga atual de cada node
      const nodeLoads = nodes.map(node => {
        const totalMemoria = node.Servers.reduce((sum, server) => sum + server.memoria, 0);
        const totalCpu = node.Servers.reduce((sum, server) => sum + server.cpu, 0);
        const totalDisco = node.Servers.reduce((sum, server) => sum + server.disco, 0);

        return {
          node,
          carga: {
            memoria: (totalMemoria / node.memoria_total) * 100,
            cpu: (totalCpu / node.cpu_total) * 100,
            disco: (totalDisco / node.disco_total) * 100
          }
        };
      });

      // Identificar nodes sobrecarregados e subutilizados
      const sobrecarregados = nodeLoads.filter(nl => 
        nl.carga.memoria > 80 || nl.carga.cpu > 80 || nl.carga.disco > 80
      );

      const subutilizados = nodeLoads.filter(nl =>
        nl.carga.memoria < 20 && nl.carga.cpu < 20 && nl.carga.disco < 20
      );

      // Realizar balanceamento se necessário
      for (const nodeLoad of sobrecarregados) {
        const serversParaMover = await this.identificarServersParaMover(nodeLoad.node);
        
        for (const server of serversParaMover) {
          const nodeDestino = this.encontrarMelhorNode(server, subutilizados);
          if (nodeDestino) {
            await this.migrarServer(server, nodeDestino);
          }
        }
      }

      return {
        status: 'success',
        message: 'Balanceamento de carga concluído',
        detalhes: {
          nodes_processados: nodes.length,
          migracoes_realizadas: this.migracoes
        }
      };
    } catch (error) {
      console.error('Erro no balanceamento de carga:', error);
      throw new ApiError(500, 'Falha ao realizar balanceamento de carga');
    }
  }

  // Métodos auxiliares para o balanceamento
  static async identificarServersParaMover(node) {
    const servers = await Server.findAll({
      where: { nodeId: node.id },
      order: [['memoria', 'DESC']] // Priorizar servidores maiores
    });

    return servers.filter(server => 
      server.status !== 'installing' && 
      server.status !== 'migrating'
    );
  }

  static encontrarMelhorNode(server, nodesDisponiveis) {
    return nodesDisponiveis.find(nl => {
      const memoriaDisponivel = nl.node.memoria_total - (nl.node.memoria_usada + server.memoria);
      const cpuDisponivel = nl.node.cpu_total - (nl.node.cpu_usado + server.cpu);
      const discoDisponivel = nl.node.disco_total - (nl.node.disco_usado + server.disco);

      return memoriaDisponivel > 0 && cpuDisponivel > 0 && discoDisponivel > 0;
    })?.node;
  }

  static async migrarServer(server, nodeDestino) {
    try {
      await server.update({ status: 'migrating' });
      
      // Realizar backup
      await BackupService.createBackup(server.id);
      
      // Transferir dados
      await this.transferirDados(server, nodeDestino);
      
      // Atualizar configurações
      await server.update({
        nodeId: nodeDestino.id,
        status: 'online'
      });

      this.migracoes++;
      return true;
    } catch (error) {
      console.error('Erro ao migrar servidor:', error);
      await server.update({ status: 'online' });
      throw error;
    }
  }

  static async transferirDados(server, nodeDestino) {
    // Implementar lógica de transferência de dados
    await execAsync(`rsync -avz /data/servers/${server.id}/ ${nodeDestino.ip}:/data/servers/${server.id}/`);
  }
}

module.exports = NodeService; 