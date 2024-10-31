const Trigger = require('../models/Trigger');
const MetricsService = require('./MetricsService');
const ServerService = require('./ServerService');
const ApiError = require('../utils/ApiError');

class AutomationService {
  static async createTrigger(serverId, triggerData) {
    const { name, conditions, actions, cooldown } = triggerData;

    // Validar condições
    if (!this.validateConditions(conditions)) {
      throw new ApiError(400, 'Condições inválidas');
    }

    // Validar ações
    if (!this.validateActions(actions)) {
      throw new ApiError(400, 'Ações inválidas');
    }

    return await Trigger.create({
      serverId,
      name,
      conditions,
      actions,
      cooldown,
      status: 'active'
    });
  }

  static validateConditions(conditions) {
    const validMetrics = ['cpu', 'memory', 'disk', 'network'];
    const validOperators = ['>', '<', '>=', '<=', '=='];

    return conditions.every(condition => 
      validMetrics.includes(condition.metric) &&
      validOperators.includes(condition.operator) &&
      typeof condition.value === 'number' &&
      typeof condition.duration === 'number'
    );
  }

  static validateActions(actions) {
    const validTypes = ['scale_up', 'scale_down', 'restart', 'backup', 'notify'];
    const validResources = ['cpu', 'memory', 'disk'];

    return actions.every(action => 
      validTypes.includes(action.type) &&
      (!action.resource || validResources.includes(action.resource))
    );
  }

  static async startTriggerMonitoring() {
    console.log('Iniciando monitoramento de triggers...');
    
    // Verificar triggers a cada 30 segundos
    setInterval(async () => {
      try {
        await this.checkAllTriggers();
      } catch (error) {
        console.error('Erro ao verificar triggers:', error);
      }
    }, 30000);
  }

  static async checkAllTriggers() {
    const activeTriggers = await Trigger.findAll({
      where: { status: 'active' }
    });

    for (const trigger of activeTriggers) {
      await this.evaluateTrigger(trigger);
    }
  }

  static async evaluateTrigger(trigger) {
    // Verificar cooldown
    if (trigger.lastTriggered) {
      const cooldownEnd = new Date(trigger.lastTriggered.getTime() + (trigger.cooldown * 1000));
      if (cooldownEnd > new Date()) {
        return; // Ainda em cooldown
      }
    }

    const metrics = await MetricsService.getServerMetrics(trigger.serverId);
    const conditionsMet = this.evaluateConditions(trigger.conditions, metrics);

    if (conditionsMet) {
      await this.executeTriggerActions(trigger);
    }
  }

  static evaluateConditions(conditions, metrics) {
    return conditions.every(condition => {
      const currentValue = metrics[condition.metric];
      switch (condition.operator) {
        case '>': return currentValue > condition.value;
        case '<': return currentValue < condition.value;
        case '>=': return currentValue >= condition.value;
        case '<=': return currentValue <= condition.value;
        case '==': return currentValue === condition.value;
        default: return false;
      }
    });
  }

  static async executeTriggerActions(trigger) {
    try {
      // Atualizar status do trigger
      await trigger.update({
        status: 'executing',
        lastTriggered: new Date()
      });

      for (const action of trigger.actions) {
        await this.executeAction(trigger.serverId, action);
      }

      // Restaurar status do trigger
      await trigger.update({ status: 'active' });
    } catch (error) {
      console.error('Erro ao executar ações do trigger:', error);
      await trigger.update({ status: 'active' });
    }
  }

  static async executeAction(serverId, action) {
    switch (action.type) {
      case 'scale_up':
        await ServerService.scaleResource(serverId, action.resource, action.amount);
        break;
      case 'scale_down':
        await ServerService.scaleResource(serverId, action.resource, -action.amount);
        break;
      case 'restart':
        await ServerService.powerAction(serverId, null, 'restart');
        break;
      case 'backup':
        await BackupService.createBackup(serverId);
        break;
      case 'notify':
        break;
    }
  }
}

module.exports = AutomationService; 