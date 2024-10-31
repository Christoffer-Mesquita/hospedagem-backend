const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { TokenService } = require('../services/TokenService');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new ApiError(401, 'Token não fornecido');
    }

    const decoded = await TokenService.verifyToken(token);
    req.user = decoded.usuario;
    next();
  } catch (error) {
    next(new ApiError(401, 'Não autorizado'));
  }
};

module.exports = auth; 