# 🚀 Guia de Hospedagem do Backend FunnelFlow

## ⚠️ Importante: Neon é apenas para Banco de Dados

A **Neon** é uma plataforma de **banco de dados PostgreSQL serverless**. Ela **NÃO hospeda aplicações Node.js/backend**.

**Arquitetura:**
```
┌─────────────────┐         ┌──────────────┐
│  Backend Node.js │  ←→    │  Neon (DB)   │
│  (Hospedado em   │         │  PostgreSQL  │
│   outra plataforma)        │              │
└─────────────────┘         └──────────────┘
```

## 🎯 Opções de Hospedagem para o Backend

### 1. **Render** ⭐ (Recomendado - Fácil e Gratuito)

**Vantagens:**
- ✅ Plano gratuito disponível
- ✅ Deploy automático via Git
- ✅ SSL gratuito
- ✅ Integração fácil com Neon
- ✅ Suporta Node.js nativamente

**Limitações do Plano Gratuito:**
- ⚠️ Suspende após 15 minutos de inatividade
- ⚠️ Demora 1-2 minutos para reativar
- ⚠️ 750 horas/mês grátis

**Como Deployar:**
1. Acesse: https://render.com
2. Conecte seu repositório GitHub
3. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment Variables:**
     - `DATABASE_URL` (sua string do Neon)
     - `GA4_PROPERTY_ID`
     - `GOOGLE_APPLICATION_CREDENTIALS` (JSON como string)
     - `PORT` (Render define automaticamente)
     - `NODE_ENV=production`

**Preço:** Grátis (com limitações) | $7/mês (plano básico)

---

### 2. **Railway** ⭐ (Recomendado - Muito Fácil)

**Vantagens:**
- ✅ Deploy super simples
- ✅ Plano gratuito ($5 de crédito/mês)
- ✅ Deploy automático via Git
- ✅ SSL automático
- ✅ Integração fácil com Neon

**Como Deployar:**
1. Acesse: https://railway.app
2. Conecte seu repositório
3. Adicione variáveis de ambiente
4. Deploy automático!

**Preço:** $5 crédito grátis/mês | ~$5-10/mês

---

### 3. **Vercel** (Serverless Functions)

**Vantagens:**
- ✅ Plano gratuito generoso
- ✅ Deploy instantâneo
- ✅ Serverless (escala automaticamente)
- ✅ Integração com Neon

**Limitações:**
- ⚠️ Requer adaptação para serverless
- ⚠️ Timeout de 10s (hobby) ou 60s (pro)

**Como Deployar:**
1. Acesse: https://vercel.com
2. Conecte repositório
3. Configure `vercel.json` para rotas serverless

**Preço:** Grátis (hobby) | $20/mês (pro)

---

### 4. **Fly.io** (Containers)

**Vantagens:**
- ✅ Plano gratuito
- ✅ Deploy rápido
- ✅ Suporta Docker
- ✅ Global edge network

**Como Deployar:**
1. Instale Fly CLI: `npm i -g @fly/cli`
2. Execute: `fly launch`
3. Configure variáveis de ambiente

**Preço:** Grátis (com limites) | ~$5-15/mês

---

### 5. **DigitalOcean App Platform**

**Vantagens:**
- ✅ Muito confiável
- ✅ Suporte completo a Node.js
- ✅ Integração fácil com Neon

**Preço:** $5/mês (básico)

---

### 6. **Heroku** (Tradicional)

**Vantagens:**
- ✅ Muito popular
- ✅ Fácil de usar
- ✅ Add-ons disponíveis

**Limitações:**
- ⚠️ Removeram plano gratuito
- ⚠️ Mais caro que alternativas

**Preço:** $5-7/mês (Eco Dyno)

---

## 📋 Configuração Necessária para Deploy

### Variáveis de Ambiente

Independente da plataforma escolhida, você precisará configurar:

```env
# Banco de Dados Neon
DATABASE_URL=postgresql://user:password@hostname/database?sslmode=require

# Google Analytics 4
GA4_PROPERTY_ID=seu-property-id
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account",...}

# Servidor
PORT=3000
NODE_ENV=production

# CORS (se necessário)
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com
```

### Arquivo `.env` no Deploy

**⚠️ IMPORTANTE:** Nunca commite o arquivo `.env`! Use as variáveis de ambiente da plataforma de hospedagem.

---

## 🔧 Preparação do Backend para Deploy

### 1. Atualizar `package.json` (se necessário)

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  }
}
```

### 2. Criar `Procfile` (para algumas plataformas)

```
web: cd backend && npm start
```

### 3. Verificar Porta

O backend já está configurado para usar `process.env.PORT || 3000`, que funciona na maioria das plataformas.

---

## 🎯 Recomendação Final

### Para Começar (Gratuito):
**Render** ou **Railway** - São as mais fáceis e têm planos gratuitos.

### Para Produção (Pago):
**Railway** ou **DigitalOcean** - Boa relação custo/benefício.

### Para Serverless:
**Vercel** - Se você adaptar o código para funções serverless.

---

## 📚 Próximos Passos

1. **Escolha uma plataforma** (recomendo Render ou Railway)
2. **Conecte seu repositório GitHub**
3. **Configure as variáveis de ambiente**
4. **Faça o deploy!**
5. **Atualize a URL do Endpoint no frontend** para a nova URL do backend

---

## 🔗 Links Úteis

- **Render:** https://render.com
- **Railway:** https://railway.app
- **Vercel:** https://vercel.com
- **Fly.io:** https://fly.io
- **DigitalOcean:** https://www.digitalocean.com/products/app-platform
- **Neon (Banco de Dados):** https://neon.tech

---

## 💡 Dica

Você pode hospedar o **frontend** e **backend** na mesma plataforma ou em plataformas diferentes:

- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Backend:** Render, Railway, Fly.io
- **Banco de Dados:** Neon (sempre)

Tudo funciona perfeitamente conectado! 🚀

