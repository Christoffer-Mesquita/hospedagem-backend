const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const EmailService = require('./EmailService');
const { Op } = require('sequelize');

class AuthService {
  static async registro(userData) {
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ApiError(400, 'Email já cadastrado');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.senha, salt);

    const user = await UserRepository.create({
      ...userData,
      senha: hashedPassword
    });

    const token = await TokenService.generateToken(user.id);
    return { user, token };
  }

  static async login(email, senha) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Credenciais inválidas');
    }

    const isPasswordMatch = await bcrypt.compare(senha, user.senha);
    if (!isPasswordMatch) {
      throw new ApiError(401, 'Credenciais inválidas');
    }

    const token = await TokenService.generateToken(user.id);
    return { user, token };
  }

  static async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Retornamos sucesso mesmo se o email não existir por segurança
      return { message: 'Se o email existir, você receberá as instruções de redefinição' };
    }

    // Gerar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);

    // Salvar token no usuário
    await user.update({
      reset_token: resetTokenHash,
      reset_token_expires: new Date(Date.now() + 3600000) // 1 hora
    });

    // Enviar email
    await EmailService.sendPasswordReset(email, resetToken);

    return { message: 'Email de redefinição enviado com sucesso' };
  }

  static async resetPassword(token, newPassword) {
    const user = await User.findOne({
      where: {
        reset_token: { [Op.ne]: null },
        reset_token_expires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw new ApiError(400, 'Token inválido ou expirado');
    }

    // Verificar token
    const isValidToken = await bcrypt.compare(token, user.reset_token);
    if (!isValidToken) {
      throw new ApiError(400, 'Token inválido');
    }

    // Atualizar senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      senha: hashedPassword,
      reset_token: null,
      reset_token_expires: null
    });

    return { message: 'Senha atualizada com sucesso' };
  }
}

module.exports = AuthService; 