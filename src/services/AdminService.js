const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class AdminService {
  static async promoteToAdmin(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'Usuário não encontrado');
    }

    await user.update({ isAdmin: true });
    return user;
  }

  static async demoteFromAdmin(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'Usuário não encontrado');
    }

    // Impedir auto-demoção
    if (user.id === userId) {
      throw new ApiError(400, 'Não é possível remover seus próprios privilégios');
    }

    await user.update({ isAdmin: false });
    return user;
  }

  static async listUsers() {
    return User.findAll({
      attributes: ['id', 'nome', 'email', 'isAdmin', 'dataCriacao']
    });
  }
}

module.exports = AdminService; 