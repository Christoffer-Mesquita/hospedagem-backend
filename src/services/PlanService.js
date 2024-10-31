const Plan = require('../models/Plan');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { Op } = require('sequelize');

class PlanService {
  static async listPlans() {
    return Plan.findAll({
      where: { status: 'active' },
      order: [['preco', 'ASC']]
    });
  }

  static async createPlan(planData) {
    // Verificar se já existe plano com mesmo nome
    const existingPlan = await Plan.findOne({
      where: { nome: planData.nome }
    });

    if (existingPlan) {
      throw new ApiError(409, 'Já existe um plano com este nome');
    }

    return Plan.create({
      ...planData,
      status: 'active'
    });
  }

  static async updatePlan(planId, planData) {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      throw new ApiError(404, 'Plano não encontrado');
    }

    // Verificar se novo nome já existe em outro plano
    if (planData.nome && planData.nome !== plan.nome) {
      const existingPlan = await Plan.findOne({
        where: {
          nome: planData.nome,
          id: { [Op.ne]: planId }
        }
      });

      if (existingPlan) {
        throw new ApiError(409, 'Já existe um plano com este nome');
      }
    }

    return plan.update(planData);
  }

  static async deletePlan(planId) {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      throw new ApiError(404, 'Plano não encontrado');
    }

    // Verificar se há usuários ativos usando o plano
    const activeUsers = await plan.countUsers({
      through: {
        where: { status: 'active' }
      }
    });

    if (activeUsers > 0) {
      // Em vez de deletar, marcar como inativo
      return plan.update({ status: 'inactive' });
    }

    return plan.destroy();
  }

  static async subscribe(userId, planId, periodo) {
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      throw new ApiError(404, 'Plano não encontrado');
    }

    if (plan.status !== 'active') {
      throw new ApiError(400, 'Este plano não está mais disponível');
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

  static async getPlanStats() {
    const plans = await Plan.findAll({
      include: [{
        model: User,
        through: {
          where: { status: 'active' }
        }
      }]
    });

    return plans.map(plan => ({
      id: plan.id,
      nome: plan.nome,
      usuarios_ativos: plan.Users.length,
      receita_mensal: plan.Users.length * plan.preco
    }));
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