const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const sequelize = require('./src/config/database');
const routes = require('./src/routes');
const errorHandler = require('./src/middlewares/error.middleware');
const logger = require('./src/config/logger');
const AutomationService = require('./src/services/AutomationService');
const FirewallService = require('./src/services/FirewallService');
const SmartBackupService = require('./src/services/SmartBackupService');

const app = express();

// Verifica se as variaveis do .env foram definidas corretamente

if (!process.env.DB_HOST) {
    console.error('DB_HOST não está definido.');
} else if (!process.env.DB_USER) {
    console.error('DB_USER não está definido.');
} else if (!process.env.DB_PASS) {
    console.error('DB_PASS não está definido.');
} else if (!process.env.DB_NAME) {
    console.error('DB_NAME não está definido.');
} else if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET não está definido.');
} else if (!process.env.PORT) {
    console.error('PORT não está definido.');
} else if (!process.env.EMAIL_HOST) {
    console.error('EMAIL_HOST não está definido.');
} else if (!process.env.EMAIL_PORT) {
    console.error('EMAIL_PORT não está definido.');
} else if (!process.env.EMAIL_USER) {
    console.error('EMAIL_USER não está definido.');
} else if (!process.env.EMAIL_PASS) {
    console.error('EMAIL_PASS não está definido.');
} else if (!process.env.EMAIL_FROM) {
    console.error('EMAIL_FROM não está definido.');
} else if (!process.env.EMAIL_SECURE) {
    console.error('EMAIL_SECURE não está definido.');
};

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rotas
app.use('/api', routes);

// Tratamento de erros
app.use(errorHandler);

// Inicialização do servidor
const PORT = process.env.PORT;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    logger.info(`Servidor rodando na porta ${PORT}`);
    
    // Iniciar serviços com verificação
    if (typeof AutomationService.startTriggerMonitoring === 'function') {
      AutomationService.startTriggerMonitoring();
    }
    
    if (typeof FirewallService.startMonitoring === 'function') {
      FirewallService.startMonitoring();
    }
    
    if (typeof SmartBackupService.startScheduler === 'function') {
      SmartBackupService.startScheduler();
    }
  });
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  logger.error('Erro não tratado:', err);
  process.exit(1);
});
