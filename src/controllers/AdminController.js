const catchAsync = require('../utils/catchAsync');
const AdminService = require('../services/AdminService');
const ApiError = require('../utils/ApiError');

class AdminController {
  static promoteToAdmin = catchAsync(async (req, res) => {
    const { adminKey } = req.body;
    const { userId } = req.params;

    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      throw new ApiError(401, 'Chave administrativa inválida');
    }

    const user = await AdminService.promoteToAdmin(userId);
    res.json({
      message: 'Usuário promovido a administrador com sucesso',
      user
    });
  });

  static demoteFromAdmin = catchAsync(async (req, res) => {
    const user = await AdminService.demoteFromAdmin(req.params.userId);
    res.json({
      message: 'Privilégios administrativos removidos com sucesso',
      user
    });
  });

  static listUsers = catchAsync(async (req, res) => {
    const users = await AdminService.listUsers();
    res.json(users);
  });
}

module.exports = AdminController; 