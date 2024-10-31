const catchAsync = require('../utils/catchAsync');
const PlanService = require('../services/PlanService');

class PlanController {
  static listPlans = catchAsync(async (req, res) => {
    const plans = await PlanService.listPlans();
    res.json(plans);
  });

  static subscribeToPlan = catchAsync(async (req, res) => {
    const subscription = await PlanService.subscribe(
      req.user.id, 
      req.params.id, 
      req.body.periodo
    );
    res.json(subscription);
  });

  static createPlan = catchAsync(async (req, res) => {
    const plan = await PlanService.createPlan(req.body);
    res.status(201).json(plan);
  });

  static updatePlan = catchAsync(async (req, res) => {
    const plan = await PlanService.updatePlan(req.params.id, req.body);
    res.json(plan);
  });

  static deletePlan = catchAsync(async (req, res) => {
    await PlanService.deletePlan(req.params.id);
    res.status(204).send();
  });

  static getPlanStats = catchAsync(async (req, res) => {
    const stats = await PlanService.getPlanStats();
    res.json(stats);
  });
}

module.exports = PlanController; 