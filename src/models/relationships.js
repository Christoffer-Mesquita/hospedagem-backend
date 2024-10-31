const User = require('./User');
const Server = require('./Server');
const Node = require('./Node');
const Plan = require('./Plan');

// Relacionamentos de Server
Server.belongsTo(User, { as: 'owner' });
Server.belongsTo(Node);
Server.belongsTo(Plan);

// Relacionamentos de Node
Node.hasMany(Server);

// Relacionamentos de User
User.hasMany(Server);
User.belongsToMany(Plan, { through: 'UserPlans' });

// Relacionamentos de Plan
Plan.belongsToMany(User, { through: 'UserPlans' });
Plan.hasMany(Server);

module.exports = {
  User,
  Server,
  Node,
  Plan
}; 