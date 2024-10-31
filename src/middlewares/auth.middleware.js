const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const auth = async (req, res, next) => {
  try {
    // Verificar se o token existe no header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      throw new ApiError(401, 'Token não fornecido');
    }

    // Verificar se o formato do token está correto
    if (!authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Formato de token inválido');
    }

    // Extrair o token
    const token = authHeader.replace('Bearer ', '');

    try {
      // Verificar e decodificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Adicionar informações do usuário ao request
      req.user = decoded.usuario;
      
      // Log para debug
      console.log('Token decodificado:', decoded);
      console.log('Usuário autenticado:', req.user);

      next();
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      throw new ApiError(401, 'Token inválido ou expirado');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = auth; 