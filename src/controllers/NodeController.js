const catchAsync = require('../utils/catchAsync');
const NodeService = require('../services/NodeService');

class NodeController {
  static listNodes = catchAsync(async (req, res) => {
    const nodes = await NodeService.listNodes();
    res.json(nodes);
  });

  static createNode = catchAsync(async (req, res) => {
    const node = await NodeService.createNode(req.body);
    res.status(201).json(node);
  });

  static getNode = catchAsync(async (req, res) => {
    const node = await NodeService.getNode(req.params.id);
    res.json(node);
  });

  static updateNode = catchAsync(async (req, res) => {
    const node = await NodeService.updateNode(req.params.id, req.body);
    res.json(node);
  });

  static deleteNode = catchAsync(async (req, res) => {
    await NodeService.deleteNode(req.params.id);
    res.status(204).send();
  });
}

module.exports = NodeController; 