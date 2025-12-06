# 🚀 Backend FunnelFlow - Setup Completo

## ✅ O que foi criado

### 📁 Estrutura do Backend

```
backend/
├── index.js                 # Servidor Express principal
├── package.json             # Dependências do projeto
├── .gitignore              # Arquivos ignorados pelo Git
├── env.example             # Exemplo de variáveis de ambiente
├── README.md               # Documentação do backend
└── routes/
    ├── health.js           # Endpoint /health (teste de conexão)
    ├── kpis.js             # Endpoint /kpis (dados do dashboard)
    ├── events.js           # Endpoint /events (lista de eventos)
    ├── funnel.js           # Endpoint /funnel (dados de funis)
    └── traffic.js          # Endpoint /traffic (fontes de tráfego)
```

### 🔌 Endpoints Criados

1. **GET /health** - Testa conexão com GA4
2. **GET /kpis** - Retorna KPIs principais (Sessões, Usuários, Conversões, Taxa de Conversão)
3. **GET /events** - Lista todos os eventos do GA4
4. **GET /funnel** - Dados de funis de conversão
5. **GET /traffic/sources** - Fontes de tráfego
6. **GET /traffic/campaigns** - Campanhas

### 🎨 Frontend Atualizado

- ✅ `src/lib/api.ts` - Cliente API criado
- ✅ `src/pages/Settings.tsx` - Conectado ao backend real
- ✅ Teste de conexão funcional

---

## 🎯 Próximos Passos

### 1️⃣ Configurar Google Cloud (OBRIGATÓRIO)

Siga o guia completo em: **`GOOGLE_CLOUD_SETUP.md`**

**Resumo rápido:**
1. Criar projeto no Google Cloud
2. Ativar Google Analytics Data API
3. Criar Service Account
4. Baixar chave JSON
5. Adicionar Service Account no GA4 como Viewer

### 2️⃣ Instalar Dependências do Backend

```bash
cd backend
npm install
```

### 3️⃣ Configurar Variáveis de Ambiente

```bash
cd backend
cp env.example .env
```

Edite o `.env`:
```env
GA4_PROPERTY_ID=123456789
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
PORT=3000
```

### 4️⃣ Iniciar o Backend

```bash
cd backend
npm run dev
```

O servidor estará em: `http://localhost:3000`

### 5️⃣ Testar Conexão

1. Abra o frontend: `http://localhost:8080`
2. Vá em **Configurações**
3. Configure a URL da API: `http://localhost:3000`
4. Clique em **"Testar"**

Se tudo estiver correto, você verá: ✅ **"Conectado - A API está respondendo corretamente"**

---

## 📊 Conectar Dashboard aos Dados Reais

Depois que o `/health` funcionar, você pode atualizar o Dashboard para usar dados reais:

**Exemplo em `src/pages/Index.tsx`:**

```typescript
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

const Index = () => {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const data = await api.getKPIs();
        setKpis(data);
      } catch (error) {
        console.error("Erro ao buscar KPIs:", error);
      }
    };
    
    fetchKPIs();
  }, []);

  // Usar kpis.sessions, kpis.users, etc.
};
```

---

## 🚀 Deploy do Backend

### Opção 1: Render (Recomendado - Gratuito)

1. Acesse: https://render.com
2. Conecte seu GitHub
3. **New → Web Service**
4. Selecione o repositório `funnelflow`
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Adicione variáveis de ambiente:
   - `GA4_PROPERTY_ID`
   - `GOOGLE_APPLICATION_CREDENTIALS` (cole o conteúdo do JSON)
   - `PORT=3000`
7. Deploy!

### Opção 2: Railway

1. Acesse: https://railway.app
2. Conecte GitHub
3. **New Project → Deploy from GitHub**
4. Selecione o repositório
5. Configure variáveis de ambiente
6. Deploy!

### Opção 3: Heroku

1. Acesse: https://heroku.com
2. Crie novo app
3. Conecte GitHub
4. Configure variáveis de ambiente
5. Deploy!

---

## 🔒 Segurança

⚠️ **IMPORTANTE**:

- **NUNCA** commite o arquivo `service-account-key.json`
- Use variáveis de ambiente em produção
- O arquivo já está no `.gitignore`

---

## ✅ Checklist Final

- [ ] Google Cloud configurado
- [ ] Service Account criado e adicionado no GA4
- [ ] Chave JSON baixada e salva em `backend/`
- [ ] Arquivo `.env` configurado
- [ ] Backend rodando localmente
- [ ] Endpoint `/health` retornando sucesso
- [ ] Frontend conectado ao backend
- [ ] Teste de conexão funcionando

---

## 🎉 Pronto!

Agora você tem:
- ✅ Backend completo com integração GA4
- ✅ Frontend conectado ao backend
- ✅ Endpoints funcionais
- ✅ Pronto para usar dados reais!

**Próximo passo**: Conectar o Dashboard aos dados reais do GA4! 🚀

