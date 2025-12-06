# 🔐 Guia Completo: Configurar Google Cloud + GA4

Este guia passo a passo vai te ajudar a configurar tudo necessário para conectar o backend ao Google Analytics 4.

## 📋 Checklist

- [ ] Conta Google Cloud criada
- [ ] Projeto criado no Google Cloud
- [ ] Google Analytics Data API ativada
- [ ] Service Account criado
- [ ] Chave JSON baixada
- [ ] Service Account adicionado no GA4 como Viewer
- [ ] Variáveis de ambiente configuradas

---

## 🎯 PASSO 1: Criar Projeto no Google Cloud

### 1.1 Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com
2. Faça login com sua conta Google
3. Se for a primeira vez, aceite os termos

### 1.2 Criar Novo Projeto

1. No topo da página, clique no **seletor de projetos** (ao lado do logo do Google Cloud)
2. Clique em **"New Project"**
3. Preencha:
   - **Project name**: `FunnelFlow Analytics`
   - **Organization**: (deixe padrão se não tiver)
   - **Location**: (deixe padrão)
4. Clique em **"Create"**
5. Aguarde alguns segundos
6. **Anote o Project ID** (funnelflow-analytics-480413) 908808128774

---

## 🎯 PASSO 2: Ativar Google Analytics Data API

### 2.1 Acessar a Biblioteca de APIs

1. No menu lateral, vá em **"APIs & Services" → "Library"**
2. Ou acesse diretamente: https://console.cloud.google.com/apis/library

### 2.2 Buscar e Ativar a API

1. Na barra de busca, digite: **"Google Analytics Data API"**
2. Clique no resultado **"Google Analytics Data API"**
3. Clique no botão **"Enable"** (Habilitar)
4. Aguarde a ativação (alguns segundos)

✅ **Status**: API ativada quando aparecer "API enabled"

---

## 🎯 PASSO 3: Criar Service Account

### 3.1 Acessar Service Accounts

1. No menu lateral, vá em **"IAM & Admin" → "Service Accounts"**
2. Ou acesse: https://console.cloud.google.com/iam-admin/serviceaccounts

### 3.2 Criar Novo Service Account

1. Clique em **"Create Service Account"** (botão no topo)
2. **Step 1 - Service account details**:
   - **Service account name**: `funnelflow-ga4-reader`
   - **Service account ID**: (preenchido automaticamente)
   - **Description**: `Service account for reading Google Analytics 4 data`
   - Clique em **"Create and Continue"**

3. **Step 2 - Grant this service account access to project**:
   - **Role**: Selecione **"Viewer"** (ou "Analytics Viewer" se disponível)
   - Clique em **"Continue"**

4. **Step 3 - Grant users access to this service account**:
   - (Pode deixar vazio)
   - Clique em **"Done"**

✅ **Status**: Service Account criado

### 3.3 Anotar o Email do Service Account

1. Na lista de Service Accounts, clique no que você criou
2. **Anote o email** (funnelflow-ga4-reader@funnelflow-analytics-480413.iam.gserviceaccount.com)
3. Você vai precisar desse email no próximo passo

---

## 🎯 PASSO 4: Baixar Chave JSON

### 4.1 Acessar as Chaves

1. Ainda na página do Service Account, vá na aba **"Keys"**
2. Clique em **"Add Key" → "Create new key"**

### 4.2 Criar e Baixar a Chave

1. Selecione **"JSON"**
2. Clique em **"Create"**
3. O arquivo JSON será baixado automaticamente

### 4.3 Salvar o Arquivo

1. **Renomeie** o arquivo para: `service-account-key.json`
2. **Mova** o arquivo para a pasta `backend/` do seu projeto
3. **IMPORTANTE**: O arquivo já está no `.gitignore`, então não será commitado

⚠️ **SEGURANÇA**: 
- NUNCA compartilhe este arquivo
- NUNCA faça commit no GitHub
- Mantenha em local seguro

---

## 🎯 PASSO 5: Adicionar Service Account no GA4

### 5.1 Acessar Google Analytics

1. Acesse: https://analytics.google.com
2. Faça login com a mesma conta Google

### 5.2 Encontrar o Property ID

1. No canto inferior esquerdo, clique em **"Admin"** (ícone de engrenagem)
2. Na coluna **"Property"**, clique em **"Property Settings"**
3. **Anote o Property ID** (514686876)
   - Está no topo da página
   - Você vai precisar no `.env`

### 5.3 Adicionar Service Account

1. Ainda em **Admin**, na coluna **"Property"**, clique em **"Property Access Management"**
2. Clique no botão **"+"** (no canto superior direito)
3. Clique em **"Add users"**
4. No campo **"Email addresses"**, cole o **email do Service Account** que você anotou no Passo 3.3
5. Marque a permissão: **"Viewer"**
6. Clique em **"Add"**

✅ **Status**: Service Account tem acesso ao GA4

---

## 🎯 PASSO 6: Configurar Backend

### 6.1 Instalar Dependências

```bash
cd backend
npm install
```

### 6.2 Criar Arquivo .env

1. Na pasta `backend/`, copie o `.env.example` para `.env`:

```bash
cp .env.example .env
```

### 6.3 Editar .env

Abra o arquivo `.env` e preencha:

```env
# Cole o Property ID que você anotou no Passo 5.2
GA4_PROPERTY_ID=123456789

# Caminho para o arquivo JSON baixado no Passo 4.3
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Porta do servidor (opcional)
PORT=3000
```

**Exemplo completo:**
```env
GA4_PROPERTY_ID=123456789
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
PORT=3000
NODE_ENV=development
```

### 6.4 Testar Conexão

```bash
npm run dev
```

Em outro terminal, teste o endpoint:

```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "ga4": "connected",
  "propertyId": "123456789",
  "message": "Backend connected to Google Analytics 4 successfully"
}
```

---

## ✅ Verificação Final

Execute este checklist:

- [ ] Projeto criado no Google Cloud
- [ ] Google Analytics Data API ativada
- [ ] Service Account criado
- [ ] Chave JSON baixada e salva em `backend/service-account-key.json`
- [ ] Service Account adicionado no GA4 como Viewer
- [ ] Arquivo `.env` configurado com Property ID e caminho do JSON
- [ ] Backend rodando e `/health` retornando sucesso

---

## 🐛 Problemas Comuns

### Erro: "GA4 client not initialized"
**Solução**: Verifique se o caminho do `GOOGLE_APPLICATION_CREDENTIALS` está correto no `.env`

### Erro: "Permission denied"
**Solução**: 
1. Verifique se o Service Account foi adicionado no GA4
2. Verifique se a permissão é "Viewer"
3. Aguarde alguns minutos (pode levar tempo para propagar)

### Erro: "Property not found"
**Solução**: 
1. Verifique se o `GA4_PROPERTY_ID` está correto (apenas números, sem "properties/")
2. Verifique se o Service Account tem acesso a essa propriedade

### Erro: "API not enabled"
**Solução**: 
1. Volte ao Passo 2 e verifique se a API está ativada
2. Pode levar alguns minutos para ativar

---

## 🎉 Pronto!

Agora seu backend está conectado ao Google Analytics 4! 

Próximo passo: Conectar o frontend ao backend.

