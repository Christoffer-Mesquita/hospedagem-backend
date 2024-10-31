const Plan = require('../models/Plan');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class PlanService {
  static async listPlans() {
    return Plan.findAll();
  }

  static async subscribe(userId, planId, periodo) {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      throw new ApiError(404, 'Plano não encontrado');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'Usuário não encontrado');
    }

    // Criar assinatura
    const subscription = await user.addPlan(plan, {
      through: {
        status: 'active',
        periodo: periodo,
        next_billing: this.calculateNextBilling(periodo)
      }
    });

    return {
      subscription_id: subscription[0].id,
      status: 'active',
      next_billing: subscription[0].next_billing
    };
  }

  static calculateNextBilling(periodo) {
    const date = new Date();
    switch (periodo) {
      case 'mensal':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'trimestral':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'semestral':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'anual':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        throw new ApiError(400, 'Período inválido');
    }
    return date;
  }
}

module.exports = PlanService; 