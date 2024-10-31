const User = require('../models/User');

class UserRepository {
  static async findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  static async create(userData) {
    return User.create(userData);
  }

  static async findById(id) {
    return User.findByPk(id);
  }
}

module.exports = UserRepository; 