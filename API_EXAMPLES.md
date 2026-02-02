# 📚 Exemplos de Uso da API

## Base URL
```
http://localhost:3003/api
```

## 🔐 Autenticação

### 1. Registrar novo usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Maria Silva",
  "email": "maria@teste.com",
  "password": "123456",
  "phone": "11988887777"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Maria Silva",
      "email": "maria@teste.com",
      "type": "user",
      "plan_id": "uuid"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@teste.com",
  "password": "123456"
}
```

### 3. Obter perfil
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### 4. Atualizar perfil
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: multipart/form-data

name: João Silva Santos
phone: 11999998888
image: [arquivo]
```

## 📋 Categorias

### Listar categorias
```http
GET /api/categories
```

### Listar com contagem de anúncios
```http
GET /api/categories?includeCount=true
```

### Obter categoria específica
```http
GET /api/categories/imoveis
```

## 🏙️ Cidades

### Listar cidades
```http
GET /api/cities
```

### Filtrar por estado
```http
GET /api/cities?state=SP
```

### Listar estados
```http
GET /api/cities/states/list
```

## 💳 Planos

### Listar planos
```http
GET /api/plans
```

### Filtrar por tipo
```http
GET /api/plans?type=user
```

## 📢 Anúncios

### 1. Listar anúncios (público)
```http
GET /api/listings
```

### 2. Listar com filtros
```http
GET /api/listings?page=1&limit=12&category=imoveis&city=sao-paulo&minPrice=100000&maxPrice=500000&type=sale&featured=true
```

**Filtros disponíveis:**
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 12)
- `category` - Slug da categoria (ex: imoveis, veiculos)
- `city` - Slug da cidade (ex: sao-paulo)
- `state` - Estado (ex: SP, RJ)
- `type` - Tipo (sale ou rent)
- `featured` - Destacado (true/false)
- `urgent` - Urgente (true/false)
- `minPrice` - Preço mínimo
- `maxPrice` - Preço máximo
- `search` - Busca por título ou descrição
- `userId` - ID do usuário
- `status` - Status (active, pending, sold, inactive)

### 3. Obter anúncio por ID
```http
GET /api/listings/{id}
```

### 4. Criar anúncio
```http
POST /api/listings
Authorization: Bearer {token}
Content-Type: multipart/form-data

title: Apartamento 3 Quartos - Vista Mar
description: Lindo apartamento com 3 quartos...
price: 850000
category_id: {uuid-da-categoria}
city_id: {uuid-da-cidade}
state: RJ
neighborhood: Copacabana
type: sale
whatsapp: 21999999999
phone: 21999999999
email: contato@exemplo.com
details: {"quartos": 3, "banheiros": 2, "area": 120}
images: [arquivo1, arquivo2, arquivo3]
```

**Resposta:**
```json
{
  "success": true,
  "message": "Anúncio criado com sucesso",
  "data": {
    "id": "uuid",
    "title": "Apartamento 3 Quartos - Vista Mar",
    "price": "850000.00",
    "images": [
      "https://pl-classificado.atl1.digitaloceanspaces.com/listings/12345.jpg"
    ],
    "category": {
      "name": "Imóveis",
      "slug": "imoveis"
    },
    "city": {
      "name": "Rio de Janeiro",
      "state": "RJ"
    }
  }
}
```

### 5. Atualizar anúncio
```http
PUT /api/listings/{id}
Authorization: Bearer {token}
Content-Type: multipart/form-data

title: Apartamento 3 Quartos - Vista Mar ATUALIZADO
price: 800000
```

### 6. Meus anúncios
```http
GET /api/listings/my/ads?page=1&status=active
Authorization: Bearer {token}
```

### 7. Destacar anúncio
```http
PUT /api/listings/{id}/feature
Authorization: Bearer {token}
```

### 8. Deletar anúncio
```http
DELETE /api/listings/{id}
Authorization: Bearer {token}
```

## 👥 Usuários (Admin)

### Listar usuários
```http
GET /api/users
Authorization: Bearer {token-admin}
```

### Filtrar usuários
```http
GET /api/users?page=1&limit=10&type=agency&search=imobiliaria
```

### Criar usuário
```http
POST /api/users
Authorization: Bearer {token-admin}
Content-Type: application/json

{
  "name": "Teste Admin",
  "email": "teste@admin.com",
  "password": "123456",
  "type": "admin",
  "plan_id": "uuid"
}
```

### Atualizar usuário
```http
PUT /api/users/{id}
Authorization: Bearer {token-admin}
Content-Type: application/json

{
  "is_active": false
}
```

### Deletar usuário
```http
DELETE /api/users/{id}
Authorization: Bearer {token-admin}
```

## 📊 Exemplo de Fluxo Completo

### 1. Usuário se registra
```bash
curl -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@teste.com",
    "password": "123456",
    "phone": "11999999999"
  }'
```

### 2. Usuário faz login
```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "password": "123456"
  }'
```

### 3. Usuário cria um anúncio
```bash
curl -X POST http://localhost:3003/api/listings \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "title=iPhone 15 Pro Max" \
  -F "description=Novo, lacrado, com nota fiscal" \
  -F "price=7500" \
  -F "category_id=095cef37-c773-45fb-9b99-c3d341353db0" \
  -F "city_id=e70510d6-7e72-4f0a-9ef1-1b2c51741fe8" \
  -F "state=SP" \
  -F "type=sale" \
  -F "whatsapp=11999999999" \
  -F "images=@imagem1.jpg" \
  -F "images=@imagem2.jpg"
```

### 4. Buscar anúncios de eletrônicos em São Paulo
```bash
curl "http://localhost:3003/api/listings?category=eletronicos&city=sao-paulo&page=1&limit=12"
```

## 🔑 Credenciais de Teste

### Admin
- Email: `admin@plclassificados.com.br`
- Senha: `admin123`

### Usuário
- Email: `joao@teste.com`
- Senha: `123456`

## ⚠️ Notas Importantes

1. **Upload de Imagens**: As imagens são enviadas para o Digital Ocean Spaces e retornam a URL completa
2. **Autenticação**: Token JWT expira em 7 dias
3. **Paginação**: Padrão é 12 itens por página
4. **Filtros**: Podem ser combinados para buscas mais específicas
5. **Permissões**: 
   - `user` - Pode criar/editar/deletar apenas seus anúncios
   - `agency` - Pode criar múltiplos anúncios (conforme plano)
   - `admin` - Acesso total ao sistema

## 📝 Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro interno do servidor

## 🎯 Próximos Passos

Para usar a API no frontend:
1. Configure a URL base: `http://localhost:3003/api`
2. Armazene o token no localStorage após login
3. Adicione o token no header Authorization em todas as requisições privadas
4. Use FormData para upload de imagens
