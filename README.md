# Sistema de Hospedagem Virtual - API Documentation

Sistema de gerenciamento de hospedagem virtual para servidores de jogos, bots e VPS.

## 🚀 Tecnologias

- Node.js
- Express
- MySQL
- Sequelize
- JWT
- bcrypt

## 📋 Requisitos

- Node.js >= 14.0.0
- MySQL
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório
```bash
git clone https://github.com/christoffer-mesquita/hospedagem-backend.git
cd sistema-hospedagem
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente (.env)
```bash
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=nome_do_banco
JWT_SECRET=seu_segredo_jwt
PORT=4000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=email@gmail.com
EMAIL_PASS=sua_senha_de_app_aqui
EMAIL_FROM='"Sistema de Hospedagem" <email@gmail.com>'
EMAIL_SECURE=false

```

4. Inicie o servidor
```bash
npm run dev
```

## 📚 Documentação da API

### Base URL
```
http://localhost:4000/api
```

### 🔐 Autenticação

#### Registro de Usuário
```http
POST /auth/registro

Request:
{
    "nome": "string",
    "email": "string",
    "senha": "string"
}

Response (200):
{
    "token": "string"
}
```

#### Login
```http
POST /auth/login

Request:
{
    "email": "string",
    "senha": "string"
}

Response (200):
{
    "token": "string"
}
```

### 🖥️ Servidores

#### Criar Servidor
```http
POST /servers
Authorization: Bearer {token}

Request:
{
    "nome": "string",
    "tipo": "minecraft" | "discord_bot" | "vps" | "gameserver",
    "memoria": "number", // MB
    "cpu": "number", // %
    "disco": "number", // GB
    "plan_id": "number"
}

Response (201):
{
    "id": "number",
    "nome": "string",
    "status": "installing",
    "porta": "number",
    "ip": "string"
}
```

#### Listar Servidores do Usuário
```http
GET /servers
Authorization: Bearer {token}

Response (200):
[
    {
        "id": "number",
        "nome": "string",
        "tipo": "string",
        "status": "string"
    }
]
```

### 💰 Planos

#### Listar Planos
```http
GET /plans

Response (200):
[
    {
        "id": "number",
        "nome": "string",
        "tipo": "string",
        "memoria": "number",
        "cpu": "number",
        "disco": "number",
        "preco": "number",
        "periodo": "string"
    }
]
```

#### Assinar Plano
```http
POST /plans/{id}/subscribe
Authorization: Bearer {token}

Request:
{
    "periodo": "mensal" | "trimestral" | "semestral" | "anual"
}

Response (200):
{
    "subscription_id": "number",
    "status": "active",
    "next_billing": "date"
}
```

### ⚙️ Administração de Nodes

#### Listar Nodes
```http
GET /admin/nodes
Authorization: Bearer {admin_token}

Response (200):
[
    {
        "id": "number",
        "nome": "string",
        "ip": "string",
        "status": "string",
        "memoria_total": "number",
        "memoria_usada": "number",
        "cpu_total": "number",
        "cpu_usado": "number",
        "disco_total": "number",
        "disco_usado": "number"
    }
]
```

### 💾 Backup e Restauração

#### Criar Backup
```http
POST /servers/{id}/backup
Authorization: Bearer {token}

Response (200):
{
    "path": "string",
    "timestamp": "date",
    "size": "number"
}
```

#### Listar Backups
```http
GET /servers/{id}/backups
Authorization: Bearer {token}

Response (200):
[
    {
        "name": "string",
        "size": "number",
        "created": "date"
    }
]
```

#### Restaurar Backup
```http
POST /servers/{id}/backup/restore
Authorization: Bearer {token}

Request:
{
    "backupName": "string"
}

Response (200):
{
    "message": "Backup restaurado com sucesso"
}
```

### 📊 Métricas

#### Métricas do Servidor
```http
GET /servers/{id}/metrics
Authorization: Bearer {token}

Response (200):
{
    "cpu": "number",
    "memory": "string",
    "uptime": "string",
    "network": {
        "rx_bytes": "number",
        "tx_bytes": "number"
    },
    "disk": {
        "used": "number",
        "available": "number"
    }
}
```

#### Métricas do Node
```http
GET /admin/nodes/{id}/metrics
Authorization: Bearer {admin_token}

Response (200):
{
    "cpu_idle": "number",
    "memory_free": "number",
    "io_bi": "number",
    "io_bo": "number"
}
```

## 🔒 Códigos de Erro

- `400` Bad Request - Dados inválidos ou faltando
- `401` Unauthorized - Problemas com autenticação
- `403` Forbidden - Sem permissão
- `404` Not Found - Recurso não encontrado
- `409` Conflict - Conflito de recursos
- `500` Internal Server Error - Erro interno

## 📝 Headers Necessários

```http
Content-Type: application/json
Authorization: Bearer {token}  // Para rotas autenticadas
```

## 📄 Paginação

Query parameters disponíveis:
```
?page=1&limit=10
```

Response incluirá metadata:
```json
{
    "data": [],
    "pagination": {
        "total": "number",
        "pages": "number",
        "current_page": "number",
        "per_page": "number"
    }
}
```

## ⚡ Rate Limiting

- 100 requisições/minuto para endpoints públicos
- 300 requisições/minuto para endpoints autenticados

Headers de resposta:
```http
X-RateLimit-Limit: limite máximo
X-RateLimit-Remaining: requisições restantes
X-RateLimit-Reset: tempo para reset
```

## 📁 Estrutura do Projeto

```
sistema-hospedagem/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── logger.js
│   ├── controllers/
│   │   └── AuthController.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validator.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Server.js
│   │   ├── Node.js
│   │   └── Plan.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── index.js
│   ├── services/
│   │   ├── AuthService.js
│   │   └── TokenService.js
│   └── utils/
│       ├── ApiError.js
│       └── catchAsync.js
├── logs/
├── tests/
├── .env
├── .gitignore
└── server.js
```

## 🤝 Contribuindo

1. Faça o fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 🐛 Reportando Bugs

Encontrou um bug? Por favor, abra uma issue descrevendo o problema e inclua:
- Passos para reproduzir
- Comportamento esperado
- Screenshots (se aplicável)
- Ambiente (SO, Node.js version, etc)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Contato

Christoffer Mesquita - [@christofferofc](https://instagram.com/christofferofc) - lorensc08@gmail.com
