const catchAsync = require('../utils/catchAsync');
const PlanService = require('../services/PlanService');

class PlanController {
  static listPlans = catchAsync(async (req, res) => {
    const plans = await PlanService.listPlans();
    res.json(plans);
  });

  static subscribeToPlan = catchAsync(async (req, res) => {
    const subscription = await PlanService.subscribe(req.user.id, req.params.id, req.body.periodo);
    res.json(subscription);
  });
}

module.exports = PlanController; 