# Projeto ERP — CRM com Automação via WhatsApp

Sistema ERP/CRM multi-tenant com gestão de clientes, produtos e estoque, integrado a um assistente virtual via WhatsApp com inteligência artificial (Google Gemini).

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Modelos do Banco de Dados](#modelos-do-banco-de-dados)
- [API — Endpoints](#api--endpoints)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Executar](#como-executar)
- [Docker](#docker)
- [WhatsApp + IA](#whatsapp--ia)
- [Segurança e LGPD](#segurança-e-lgpd)

---

## Visão Geral

O **Projeto ERP** é uma plataforma de gestão empresarial voltada para pequenas e médias empresas. Permite controlar clientes, produtos e movimentações de estoque através de uma interface web moderna e, de forma inovadora, via mensagens no **WhatsApp**, interpretadas por IA.

---

## Funcionalidades

- **Autenticação segura** — JWT com refresh token, bcrypt, rate limiting por endpoint
- **Multi-tenant** — cada empresa tem seus próprios dados isolados por `companyId`
- **Controle de acesso por papel** — roles `ADMIN`, `GERENTE` e `VENDEDOR`
- **Gestão de Clientes (CRM)** — CRUD completo com validação de e-mail, telefone e CNPJ
- **Catálogo de Produtos** — CRUD com controle de estoque e histórico de movimentações
- **Assistente WhatsApp com IA** — processa comandos em linguagem natural para entrada/saída de estoque e consultas
- **Dashboard** — visão geral de receita, vendas e produtos
- **Fila assíncrona** — processamento de mensagens com BullMQ + Redis

---

## Stack Tecnológica

### Backend
| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express 5 |
| ORM | Prisma 7 |
| Banco de dados | PostgreSQL 15 |
| Cache / Fila | Redis 7 + BullMQ |
| Autenticação | JWT (jsonwebtoken) + bcrypt |
| Segurança | Helmet, CORS, express-rate-limit |
| WhatsApp | @whiskeysockets/baileys |
| IA | Google Generative AI (Gemini 2.5 Flash) |
| Validação | Zod |
| Logger | Pino |

### Frontend
| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| UI | Material UI 7 + Tailwind CSS 4 |
| Estado servidor | TanStack Query 5 |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Animações | Framer Motion |
| HTTP | Axios |

---

## Arquitetura

```
┌─────────────────────┐        ┌──────────────────────────┐
│   React (Vite)      │◄──────►│  Express API (porta 3000)│
│   porta 5173        │  HTTPS │  JWT + RBAC              │
└─────────────────────┘        └──────────┬───────────────┘
                                          │
                          ┌───────────────┼───────────────┐
                          │               │               │
                   ┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
                   │ PostgreSQL  │ │    Redis    │ │  Baileys   │
                   │  (Prisma)   │ │   BullMQ    │ │ (WhatsApp) │
                   └─────────────┘ └──────┬──────┘ └─────┬──────┘
                                          │               │
                                   ┌──────▼───────────────▼──────┐
                                   │      WhatsApp Worker        │
                                   │  Gemini AI → Inventory Svc  │
                                   └─────────────────────────────┘
```

**Fluxo de mensagem WhatsApp:**
1. Mensagem chega via Baileys → **Adapter**
2. Adapter enfileira o job no **BullMQ**
3. **Worker** consome o job, envia texto ao **Gemini AI**
4. AI retorna ação estruturada (ex: `ADD_STOCK`, `CHECK_STOCK`)
5. **Service** executa a operação no banco e responde ao usuário

---

## Estrutura de Pastas

```
Projeto ERP/
├── backend/
│   ├── src/
│   │   ├── config/             # Prisma client
│   │   ├── middlewares/        # authMiddleware (JWT + RBAC)
│   │   └── modules/
│   │       ├── auth/           # register, login, refresh, logout
│   │       ├── clients/        # CRUD de clientes
│   │       ├── products/       # CRUD de produtos
│   │       └── whatsapp/       # Adapter, AI, Worker, Service, Queue
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── features/
    │   │   ├── auth/           # Login
    │   │   ├── clients/        # Gestão de clientes
    │   │   ├── products/       # Catálogo de produtos
    │   │   ├── dashboard/      # Dashboard principal
    │   │   ├── income/         # Módulo financeiro
    │   │   └── landing/        # Landing page
    │   ├── components/         # Componentes reutilizáveis
    │   ├── contexts/           # AuthContext
    │   └── services/api.ts     # Axios + interceptors
    └── package.json
```

---

## Modelos do Banco de Dados

```prisma
Company       — empresas (multi-tenant)
User          — usuários com role: ADMIN | GERENTE | VENDEDOR
Client        — clientes da empresa
Lead          — leads/prospects
Deal          — negociações vinculadas a clientes
Product       — produtos com estoque
InventoryMovement — histórico de entradas e saídas de estoque
```

**Relacionamentos principais:**
- `Company` 1→N `User`, `Client`, `Lead`, `Product`, `InventoryMovement`
- `Client` 1→N `Deal`
- `Product` 1→N `InventoryMovement`

---

## API — Endpoints

### Autenticação — `/api/auth`
> Rate limit: 10 requisições / 15 minutos

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/register` | Cria empresa + usuário admin | — |
| POST | `/login` | Login, retorna access + refresh token | — |
| POST | `/refresh` | Renova o access token | — |
| POST | `/logout` | Invalida o refresh token | ✓ |

### Clientes — `/api/clients`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Lista clientes da empresa |
| POST | `/` | Cria novo cliente |
| PUT | `/:id` | Atualiza cliente |
| DELETE | `/:id` | Remove cliente |

### Produtos — `/api/products`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Lista produtos da empresa |
| POST | `/` | Cria novo produto |
| PUT | `/:id` | Atualiza produto |
| DELETE | `/:id` | Remove produto |

### WhatsApp — `/api/whatsapp`
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/qrcode/image` | Página HTML com QR code para vincular | ✓ |
| GET | `/qrcode` | QR code em JSON | ✓ |
| GET | `/status` | Status da conexão | ✓ |
| POST | `/disconnect` | Desconecta a sessão | ✓ |

### Health Check
| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica se o servidor está no ar |

---

## Variáveis de Ambiente

Copie o arquivo de exemplo e preencha com seus valores:

```bash
cp backend/.env.example backend/.env
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `PORT` | Porta do servidor (padrão: `3000`) |
| `NODE_ENV` | `development` ou `production` |
| `JWT_SECRET` | Segredo do access token (mín. 32 chars) |
| `JWT_REFRESH_SECRET` | Segredo do refresh token (mín. 32 chars) |
| `REDIS_URL` | URL do Redis (padrão: `redis://localhost:6379`) |
| `ALLOWED_ORIGINS` | Origens CORS permitidas (separadas por vírgula) |
| `WHATSAPP_SESSION_PATH` | Caminho da sessão Baileys |
| `WHATSAPP_DEFAULT_COMPANY_ID` | UUID da empresa que recebe as mensagens |
| `GEMINI_API_KEY` | Chave da API Google Generative AI |

Para gerar secrets seguros:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Como Executar

### Pré-requisitos

- Node.js >= 20
- PostgreSQL 15
- Redis 7

### Backend

```bash
cd backend
cp .env.example .env        # configure as variáveis
npm install
npx prisma migrate deploy   # aplica as migrations
npx prisma db seed          # dados de demonstração (opcional)
npm run dev                 # http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

### Credenciais de demonstração (após seed)

| Campo | Valor |
|---|---|
| E-mail | `admin@demo.com` |
| Senha | `admin123` |

> Altere a senha imediatamente após o primeiro login em produção.

---

## Docker

Sobe PostgreSQL, Redis e o backend em um único comando:

```bash
cd backend
docker-compose up --build
```

| Serviço | Porta |
|---|---|
| Backend API | `3000` |
| PostgreSQL | `5432` |
| Redis | `6379` |

> O frontend não está incluído no compose. Execute `npm run dev` separadamente ou adicione um serviço ao `docker-compose.yml`.

---

## WhatsApp + IA

### Configuração

1. Defina `WHATSAPP_DEFAULT_COMPANY_ID` com o UUID da empresa no banco
2. Acesse `GET /api/whatsapp/qrcode/image` (autenticado) e escaneie o QR code com o WhatsApp do celular
3. A sessão é salva em `WHATSAPP_SESSION_PATH` e reutilizada nos próximos reinícios

### Comandos suportados (linguagem natural)

O assistente interpreta mensagens em português e executa as seguintes ações:

| Ação | Exemplo de mensagem |
|---|---|
| Entrada de estoque | *"Chegaram 10 camisetas tamanho M"* |
| Saída / Venda | *"Saiu 3 calças G"* |
| Consulta de estoque | *"Quantas camisetas P temos?"* |
| Despesa | *"Paguei R$200 de frete"* |
| Fluxo de caixa | *"Como está o caixa hoje?"* |
| Produtos mais vendidos | *"Quais os produtos mais vendidos?"* |
| Alerta de estoque baixo | *"Tem algum produto acabando?"* |

> Comandos com confiança de IA abaixo de 80% são rejeitados e o usuário é orientado a reescrever.

---

## Segurança e LGPD

- **Tokens** armazenados em `sessionStorage` (não persiste ao fechar a aba)
- **Refresh token** em cookie `httpOnly` + `SameSite=Strict`
- **CORS** restrito às origens definidas em `ALLOWED_ORIGINS`
- **Rate limiting** diferenciado para endpoints de autenticação
- **Isolamento multi-tenant** — todas as queries filtram por `companyId` do token JWT
- **Sem PII nos logs** — números de telefone e nomes de contato não são registrados
- **Validação de input** em todos os endpoints com limites de tamanho
- **Sessão WhatsApp** nunca commitada ao repositório (`.gitignore`)
- **Variáveis sensíveis** nunca commitadas (`.env` no `.gitignore`)