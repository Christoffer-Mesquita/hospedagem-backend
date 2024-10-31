const ApiError = require('../utils/ApiError');

const admin = async (req, res, next) => {
  if (!req.user.isAdmin) {
    throw new ApiError(403, 'Acesso negado: requer privilégios de administrador');
  }
  next();
};

module.exports = admin; 