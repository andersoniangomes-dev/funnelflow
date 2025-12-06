# 🚀 FunnelFlow Backend API

Backend API para integração com Google Analytics 4.

## 📋 Pré-requisitos

1. **Node.js** 18+ instalado
2. **Conta Google Cloud** com projeto criado
3. **Google Analytics 4** Property ID
4. **Service Account** configurado no Google Cloud

## 🔧 Configuração Inicial

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Google Cloud

#### Passo 1: Criar Projeto no Google Cloud

1. Acesse: https://console.cloud.google.com
2. Clique em **"Create Project"**
3. Nome: `funnelflow-analytics`
4. Anote o **Project ID**

#### Passo 2: Ativar Google Analytics Data API

1. No Google Cloud Console, vá em **APIs & Services → Library**
2. Busque por **"Google Analytics Data API"**
3. Clique em **"Enable"**

#### Passo 3: Criar Service Account

1. Vá em **IAM & Admin → Service Accounts**
2. Clique em **"Create Service Account"**
3. Preencha:
   - Name: `funnelflow-ga4-reader`
   - Description: `Service account for reading GA4 data`
4. Clique em **"Create and Continue"**
5. Role: **"Viewer"** (ou "Analytics Viewer" se disponível)
6. Clique em **"Continue"** e depois **"Done"**

#### Passo 4: Baixar Chave JSON

1. Clique no Service Account criado
2. Vá na aba **"Keys"**
3. Clique em **"Add Key" → "Create new key"**
4. Escolha **JSON**
5. Baixe o arquivo e salve como `service-account-key.json` na pasta `backend/`

⚠️ **IMPORTANTE**: Adicione `service-account-key.json` ao `.gitignore` (já está configurado)

#### Passo 5: Adicionar Service Account no GA4

1. Acesse: https://analytics.google.com
2. Vá em **Admin → Property Access Management**
3. Clique em **"+" → "Add users"**
4. Cole o **email do Service Account** (está no JSON: `client_email`)
5. Permissão: **"Viewer"**
6. Clique em **"Add"**

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Edite o `.env` e preencha:

```env
GA4_PROPERTY_ID=123456789
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
PORT=3000
```

**Como encontrar o Property ID:**
- Acesse Google Analytics
- Vá em **Admin → Property Settings**
- O **Property ID** está no topo (formato: `123456789`)

## 🚀 Executar

### Desenvolvimento

```bash
npm run dev
```

O servidor estará em: `http://localhost:3000`

### Produção

```bash
npm start
```

## 📡 Endpoints

### `GET /health`
Testa a conexão com GA4.

**Resposta:**
```json
{
  "status": "ok",
  "ga4": "connected",
  "propertyId": "123456789",
  "message": "Backend connected to Google Analytics 4 successfully"
}
```

### `GET /kpis?startDate=30daysAgo&endDate=today`
Retorna KPIs principais do GA4.

**Resposta:**
```json
{
  "sessions": {
    "value": "42.580",
    "change": 12.5,
    "changeLabel": "vs período anterior"
  },
  "users": {
    "value": "28.392",
    "change": 8.2,
    "changeLabel": "vs período anterior"
  },
  "conversions": {
    "value": "1.847",
    "change": 23.1,
    "changeLabel": "vs período anterior"
  },
  "conversionRate": {
    "value": "4.34%",
    "change": 9.4,
    "changeLabel": "vs período anterior"
  }
}
```

### `GET /events?startDate=30daysAgo&endDate=today`
Lista todos os eventos do GA4.

### `GET /funnel?steps=page_view,click_cta,view_checkout,purchase`
Retorna dados do funil de conversão.

### `GET /traffic/sources?startDate=30daysAgo&endDate=today`
Retorna fontes de tráfego.

### `GET /traffic/campaigns?startDate=30daysAgo&endDate=today`
Retorna campanhas.

## 🔒 Segurança

- **NUNCA** commite o arquivo `service-account-key.json`
- Use variáveis de ambiente para configurações sensíveis
- Em produção, use um serviço de gerenciamento de secrets (ex: AWS Secrets Manager, Google Secret Manager)

## 🐛 Troubleshooting

### Erro: "GA4 client not initialized"
- Verifique se `GOOGLE_APPLICATION_CREDENTIALS` está correto no `.env`
- Verifique se o arquivo JSON existe no caminho especificado

### Erro: "Permission denied"
- Verifique se o Service Account tem permissão de **Viewer** no GA4
- Verifique se a API está habilitada no Google Cloud

### Erro: "Property not found"
- Verifique se o `GA4_PROPERTY_ID` está correto
- O formato deve ser apenas números: `123456789` (não `properties/123456789`)

## 📚 Documentação

- [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Service Accounts](https://cloud.google.com/iam/docs/service-accounts)

