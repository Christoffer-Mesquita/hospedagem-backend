const User = require('./User');
const Server = require('./Server');
const Node = require('./Node');
const Plan = require('./Plan');
const Trigger = require('./Trigger');
const Notification = require('./Notification');
const ServerLog = require('./ServerLog');
const FirewallRule = require('./FirewallRule');

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

// Relacionamentos de Trigger
Trigger.belongsTo(Server);
Server.hasMany(Trigger);

// Relacionamentos de Notification
Notification.belongsTo(User);
User.hasMany(Notification);

// Relacionamentos de ServerLog
ServerLog.belongsTo(Server);
Server.hasMany(ServerLog);

// Relacionamentos de FirewallRule
FirewallRule.belongsTo(Server);
Server.hasMany(FirewallRule);

module.exports = {
  User,
  Server,
  Node,
  Plan,
  Trigger,
  Notification,
  ServerLog,
  FirewallRule
}; 