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

const app = express();

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
const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    logger.info(`Servidor rodando na porta ${PORT}`);
    // Iniciar monitoramento de triggers após o servidor estar rodando
    AutomationService.startTriggerMonitoring();
  });
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  logger.error('Erro não tratado:', err);
  process.exit(1);
});