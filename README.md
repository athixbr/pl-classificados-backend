# PL Classificados - Backend API

API REST para sistema de classificados com integração Mercado Pago.

## 🚀 Tecnologias

- Node.js 20+
- Express.js
- MySQL / Sequelize ORM
- JWT Authentication
- Mercado Pago SDK
- Digital Ocean Spaces (Storage)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local .env

# Editar .env com suas credenciais
nano .env
```

## 🔧 Configuração

Edite o arquivo `.env` com suas credenciais:

```env
# Database
DB_HOST=seu-host
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=pl-classi

# JWT
JWT_SECRET=sua-chave-secreta

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu-access-token
MERCADOPAGO_PUBLIC_KEY=sua-public-key

# Digital Ocean Spaces
DO_SPACES_ACCESS_KEY=sua-access-key
DO_SPACES_SECRET_KEY=sua-secret-key
```

## 🏃 Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção (PM2)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start ecosystem.config.js --env production

# Ver logs
pm2 logs pl-classificados-api

# Monitorar
pm2 monit

# Parar
pm2 stop pl-classificados-api

# Restart
pm2 restart pl-classificados-api
```

## 📁 Estrutura

```
backend/
├── src/
│   ├── config/          # Configurações (DB, MP, Spaces)
│   ├── controllers/     # Lógica de negócio
│   ├── middlewares/     # Auth, Upload, Error Handler
│   ├── models/          # Models Sequelize
│   ├── routes/          # Rotas da API
│   ├── scripts/         # Scripts utilitários
│   └── utils/           # Utilidades (email, etc)
├── ecosystem.config.js  # Configuração PM2
└── package.json
```

## 🔐 Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil

### Assinaturas (Mercado Pago)
- `POST /api/subscriptions/create` - Criar assinatura
- `POST /api/subscriptions/cancel` - Cancelar assinatura
- `GET /api/subscriptions/status` - Status e limites
- `POST /api/subscriptions/webhook` - Webhook MP

### Anúncios
- `GET /api/listings` - Listar anúncios
- `POST /api/listings` - Criar anúncio
- `PUT /api/listings/:id` - Atualizar anúncio
- `DELETE /api/listings/:id` - Deletar anúncio

### Planos
- `GET /api/plans` - Listar planos
- `POST /api/plans` - Criar plano (admin)

## 🌐 Deploy VPS Ubuntu

```bash
# 1. Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Instalar PM2
sudo npm install -g pm2

# 3. Clonar repositório
git clone https://github.com/athixbr/pl-classificados-backend.git
cd pl-classificados-backend

# 4. Instalar dependências
npm install

# 5. Configurar .env
nano .env

# 6. Iniciar com PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 📝 Licença

Propriedade de ATHIX - Todos os direitos reservados.

npm install
```

### 2. Configurar variáveis de ambiente

O arquivo `.env` já está configurado com as credenciais fornecidas.

### 3. Criar tabelas no banco de dados

```bash
npm run migrate
```

### 4. Popular banco com dados iniciais (opcional)

```bash
node src/migrations/seed.js
```

Isso criará:
- 5 planos (Gratuito, Básico, Pro, Agência Básico, Agência Premium)
- 8 categorias
- 10 cidades
- Usuário admin: `admin@plclassificados.com.br` / `admin123`
- Usuário teste: `joao@teste.com` / `123456`

### 5. Iniciar servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

O servidor estará rodando em: `http://localhost:3003`

## 📚 Endpoints da API

### Auth
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário logado
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/password` - Alterar senha

### Users (Admin)
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário
- `GET /api/users/stats` - Estatísticas

### Listings
- `GET /api/listings` - Listar anúncios (com filtros)
- `GET /api/listings/:id` - Obter anúncio
- `POST /api/listings` - Criar anúncio
- `PUT /api/listings/:id` - Atualizar anúncio
- `DELETE /api/listings/:id` - Deletar anúncio
- `GET /api/listings/my/ads` - Meus anúncios
- `PUT /api/listings/:id/feature` - Destacar anúncio

### Categories
- `GET /api/categories` - Listar categorias
- `GET /api/categories/:id` - Obter categoria
- `POST /api/categories` - Criar categoria (Admin)
- `PUT /api/categories/:id` - Atualizar categoria (Admin)
- `DELETE /api/categories/:id` - Deletar categoria (Admin)

### Cities
- `GET /api/cities` - Listar cidades
- `GET /api/cities/:id` - Obter cidade
- `GET /api/cities/states/list` - Listar estados
- `POST /api/cities` - Criar cidade (Admin)
- `PUT /api/cities/:id` - Atualizar cidade (Admin)
- `DELETE /api/cities/:id` - Deletar cidade (Admin)

### Plans
- `GET /api/plans` - Listar planos
- `GET /api/plans/:id` - Obter plano
- `POST /api/plans` - Criar plano (Admin)
- `PUT /api/plans/:id` - Atualizar plano (Admin)
- `DELETE /api/plans/:id` - Deletar plano (Admin)

## 🔐 Autenticação

Todas as rotas privadas requerem o header:
```
Authorization: Bearer {token}
```

## 📦 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Configuração Sequelize
│   │   └── spaces.js        # Configuração Digital Ocean Spaces
│   ├── models/
│   │   ├── User.js
│   │   ├── Plan.js
│   │   ├── Category.js
│   │   ├── City.js
│   │   ├── Listing.js
│   │   └── index.js         # Relacionamentos
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── listingController.js
│   │   ├── categoryController.js
│   │   ├── cityController.js
│   │   └── planController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── listingRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── cityRoutes.js
│   │   ├── planRoutes.js
│   │   └── index.js
│   ├── middlewares/
│   │   ├── auth.js          # Autenticação JWT
│   │   ├── upload.js        # Upload de imagens
│   │   └── errorHandler.js  # Tratamento de erros
│   ├── migrations/
│   │   ├── run.js           # Criar tabelas
│   │   └── seed.js          # Popular banco
│   └── server.js            # Servidor Express
├── .env
├── .gitignore
└── package.json
```

## 🌐 Exemplo de Uso

### Registrar usuário
```bash
POST http://localhost:3003/api/auth/register
Content-Type: application/json

{
  "name": "Maria Silva",
  "email": "maria@teste.com",
  "password": "123456",
  "phone": "11988887777"
}
```

### Criar anúncio
```bash
POST http://localhost:3003/api/listings
Authorization: Bearer {token}
Content-Type: multipart/form-data

title: iPhone 15 Pro Max
description: Novo, lacrado
price: 7500
category_id: {uuid}
city_id: {uuid}
state: SP
type: sale
images: [arquivos]
```

## 🔧 Filtros de Anúncios

```
GET /api/listings?page=1&limit=12&category=imoveis&city=sao-paulo&minPrice=100000&maxPrice=500000&type=sale&featured=true
```

Parâmetros disponíveis:
- `page` - Página (default: 1)
- `limit` - Itens por página (default: 12)
- `category` - Slug da categoria
- `city` - Slug da cidade
- `state` - Estado (SP, RJ, etc)
- `type` - sale ou rent
- `featured` - true/false
- `urgent` - true/false
- `minPrice` - Preço mínimo
- `maxPrice` - Preço máximo
- `search` - Busca por título/descrição
- `userId` - Filtrar por usuário
- `status` - active, pending, sold, inactive

## 📝 Modelos de Dados

### User
- id, name, email, password, phone, avatar
- type (user, admin, agency)
- plan_id, is_active, email_verified

### Listing
- id, user_id, category_id, city_id
- title, description, price, images[]
- state, neighborhood, type (sale/rent)
- featured, urgent, status, views
- whatsapp, phone, email, details (JSON)

### Category
- id, name, slug, icon, parent_id
- is_active, order

### City
- id, name, slug, state, is_active

### Plan
- id, name, slug, price, period
- features (JSON), ads_limit, highlighted
- featured, type (user/agency), is_active

## 🚀 Deploy

O backend está pronto para deploy no Digital Ocean ou qualquer servidor Node.js.

### Variáveis de ambiente necessárias:
- `PORT`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `DO_SPACES_*` (credenciais)

## 📞 Suporte

Para dúvidas ou problemas, entre em contato.

---

Desenvolvido com ❤️ para PL Classificados
