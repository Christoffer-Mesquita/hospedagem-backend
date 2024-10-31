const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const UserRepository = require('../repositories/UserRepository');
const TokenService = require('./TokenService');

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
}

module.exports = AuthService; 