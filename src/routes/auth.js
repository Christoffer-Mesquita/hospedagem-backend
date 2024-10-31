const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Rota de Registro
router.post('/registro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Verificar se o usuário já existe
    const usuarioExistente = await User.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ msg: 'Usuário já existe' });
    }

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Criar novo usuário
    const usuario = await User.create({
      nome,
      email,
      senha: senhaHash
    });

    // Criar e retornar o token JWT
    const payload = {
      usuario: {
        id: usuario.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota de Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se o usuário existe
    const usuario = await User.findOne({ where: { email } });
    if (!usuario) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    // Criar e retornar o token JWT
    const payload = {
      usuario: {
        id: usuario.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router; 