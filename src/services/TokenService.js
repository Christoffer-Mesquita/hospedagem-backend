const jwt = require('jsonwebtoken');

class TokenService {
  static async generateToken(userId) {
    return jwt.sign(
      { usuario: { id: userId } },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static async verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

module.exports = TokenService; 