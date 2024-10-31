const catchAsync = require('../utils/catchAsync');
const AuthService = require('../services/AuthService');
const jwt = require('jsonwebtoken');

class AuthController {
  static registro = catchAsync(async (req, res) => {
    const { nome, email, senha } = req.body;
    const user = await AuthService.registro(nome, email, senha);

    // Criar token com o ID do usuário
    const token = jwt.sign(
      { 
        usuario: { 
          id: user.id 
        } 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email
      }
    });
  });

  static login = catchAsync(async (req, res) => {
    const { email, senha } = req.body;
    const user = await AuthService.login(email, senha);

    // Criar token com o ID do usuário
    const token = jwt.sign(
      { 
        usuario: { 
          id: user.id 
        } 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log para debug
    console.log('Token gerado:', token);
    console.log('Payload:', { usuario: { id: user.id } });

    res.json({ 
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email
      }
    });
  });
}

module.exports = AuthController; 