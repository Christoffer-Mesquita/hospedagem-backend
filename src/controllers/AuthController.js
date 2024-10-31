const catchAsync = require('../utils/catchAsync');
const AuthService = require('../services/AuthService');

class AuthController {
  static registro = catchAsync(async (req, res) => {
    const { user, token } = await AuthService.registro(req.body);
    res.status(201).json({ user, token });
  });

  static login = catchAsync(async (req, res) => {
    const { email, senha } = req.body;
    const { user, token } = await AuthService.login(email, senha);
    res.json({ user, token });
  });
}

module.exports = AuthController; 