const express = require('express');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();

app.use(express.json());

sequelize.sync()
  .then(() => console.log('Conectado ao MySQL'))
  .catch((err) => console.error('Erro ao conectar ao MySQL:', err));

app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 