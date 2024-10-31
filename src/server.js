const express = require('express');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();

app.use(express.json());

// Força a recriação das tabelas
sequelize.sync({ force: true }) // Use isso apenas em desenvolvimento!
  .then(() => console.log('Banco de dados sincronizado'))
  .catch((err) => console.error('Erro ao sincronizar banco:', err));

app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 