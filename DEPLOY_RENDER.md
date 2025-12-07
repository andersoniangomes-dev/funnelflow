# 🚀 Guia Passo a Passo: Deploy no Render (GRATUITO)

## ✅ Pré-requisitos

1. ✅ Conta no GitHub (com seu código commitado)
2. ✅ Conta no Render (vamos criar agora)
3. ✅ String de conexão do Neon PostgreSQL
4. ✅ Configuração do GA4 (Property ID e Service Account JSON)

---

## 📋 Passo 1: Preparar o Repositório

Seu código já está pronto! Os arquivos necessários foram criados:
- ✅ `render.yaml` - Configuração do Render
- ✅ `backend/package.json` - Já tem script `start`

**Certifique-se de que tudo está commitado:**
```bash
git status
git add .
git commit -m "Preparado para deploy no Render"
git push
```

---

## 📋 Passo 2: Criar Conta no Render

1. Acesse: **https://render.com**
2. Clique em **"Get Started for Free"** ou **"Sign Up"**
3. Escolha **"Sign up with GitHub"** (recomendado)
4. Autorize o Render a acessar seus repositórios
5. Complete o cadastro

---

## 📋 Passo 3: Criar Novo Web Service

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório GitHub:
   - Se não estiver conectado, clique em **"Connect GitHub"**
   - Autorize o acesso
   - Selecione o repositório `funnelflow`

---

## 📋 Passo 4: Configurar o Serviço

### Informações Básicas:

- **Name:** `funnelflow-backend` (ou qualquer nome)
- **Region:** Escolha a mais próxima (ex: `Oregon (US West)`)
- **Branch:** `main` (ou sua branch principal)
- **Root Directory:** Deixe vazio (ou `backend` se necessário)
- **Runtime:** `Node`
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`

### Plano:

- Selecione **"Free"** (plano gratuito)

---

## 📋 Passo 5: Configurar Variáveis de Ambiente

No Render, vá em **"Environment"** e adicione:

### 1. Banco de Dados Neon:
```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_JBGD8cbHlM3A@ep-wispy-grass-aeqbrv6u-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Google Analytics 4:
```
Key: GA4_PROPERTY_ID
Value: seu-property-id-aqui
```

### 3. Service Account (JSON como string):
```
Key: GOOGLE_APPLICATION_CREDENTIALS
Value: {"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```
⚠️ Cole o JSON completo do Service Account aqui

### 4. Ambiente:
```
Key: NODE_ENV
Value: production
```

### 5. Porta (opcional - Render define automaticamente):
```
Key: PORT
Value: 3000
```

### 6. CORS (se necessário):
```
Key: ALLOWED_ORIGINS
Value: https://seudominio.com,https://www.seudominio.com
```

---

## 📋 Passo 6: Fazer o Deploy

1. Clique em **"Create Web Service"**
2. O Render começará a fazer o deploy automaticamente
3. Você verá os logs em tempo real
4. Aguarde alguns minutos (primeiro deploy pode demorar 3-5 minutos)

---

## 📋 Passo 7: Verificar o Deploy

Após o deploy concluir, você verá:

- ✅ **Status:** Live
- ✅ **URL:** `https://funnelflow-backend.onrender.com` (ou similar)

### Testar a API:

1. Acesse: `https://seu-backend.onrender.com/health`
2. Deve retornar JSON com status da API

---

## 📋 Passo 8: Atualizar Frontend

1. Abra o frontend localmente ou onde estiver hospedado
2. Vá em **Configurações**
3. No campo **"URL do Endpoint da API"**, coloque:
   ```
   https://seu-backend.onrender.com
   ```
4. Salve e teste a conexão

---

## ⚠️ Limitações do Plano Gratuito

- **Suspensão:** O serviço suspende após 15 minutos de inatividade
- **Reativação:** Demora 1-2 minutos para voltar online
- **Limite:** 750 horas/mês grátis (suficiente para testes)

### Como Evitar Suspensão:

1. Use um serviço de "ping" (ex: UptimeRobot - grátis)
2. Configure para fazer requisições a cada 10 minutos
3. URL para pingar: `https://seu-backend.onrender.com/health`

---

## 🔧 Troubleshooting

### Erro: "Build failed"
- Verifique se o `package.json` está correto
- Verifique os logs de build no Render

### Erro: "Cannot connect to database"
- Verifique se a `DATABASE_URL` está correta
- Verifique se o Neon permite conexões externas (deve permitir)

### Erro: "GA4 not configured"
- Verifique se `GA4_PROPERTY_ID` está correto
- Verifique se `GOOGLE_APPLICATION_CREDENTIALS` é um JSON válido

### Serviço não inicia:
- Verifique os logs no Render
- Verifique se o `startCommand` está correto

---

## 📊 Monitoramento

No dashboard do Render você pode:
- Ver logs em tempo real
- Ver métricas de uso
- Ver histórico de deploys
- Configurar notificações

---

## 🎉 Pronto!

Seu backend está no ar! Agora você pode:
- ✅ Usar a API de qualquer lugar
- ✅ Conectar o frontend à API hospedada
- ✅ Ter seus dados salvos no Neon PostgreSQL

---

## 🔗 Links Úteis

- **Render Dashboard:** https://dashboard.render.com
- **Documentação Render:** https://render.com/docs
- **Neon Dashboard:** https://console.neon.tech

---

## 💡 Próximos Passos

1. ✅ Backend hospedado no Render
2. ⏭️ Hospedar frontend (Vercel, Netlify, etc.)
3. ⏭️ Configurar domínio personalizado (opcional)

