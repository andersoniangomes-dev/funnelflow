# 🔧 Configurar Variável de Ambiente no Netlify - Passo a Passo

## 📋 O que vamos fazer

Configurar a variável `VITE_API_URL` no Netlify para que o frontend se conecte automaticamente ao backend do Render.

---

## 🎯 Passo 1: Acessar o Netlify

1. Abra seu navegador
2. Acesse: **https://app.netlify.com**
3. Faça login na sua conta

---

## 🎯 Passo 2: Selecionar o Site

1. No dashboard do Netlify, você verá uma lista de sites
2. **Clique no site do FunnelFlow** (ou o nome que você deu ao projeto)

---

## 🎯 Passo 3: Acessar Configurações

1. No menu superior do site, clique em **"Site settings"** (ou "Configurações do site")
   - Ou clique nos **três pontinhos (⋯)** ao lado do nome do site
   - Selecione **"Site settings"**

---

## 🎯 Passo 4: Encontrar Variáveis de Ambiente

1. No menu lateral esquerdo, procure por **"Environment variables"** (Variáveis de ambiente)
   - Pode estar em uma seção chamada **"Build & deploy"** ou **"Build settings"**
   - Ou pode estar diretamente no menu lateral

2. **Clique em "Environment variables"**

---

## 🎯 Passo 5: Adicionar Nova Variável

1. Você verá uma lista de variáveis (pode estar vazia se for a primeira vez)
2. Clique no botão **"Add a variable"** ou **"Add variable"** ou **"Adicionar variável"**

3. Preencha os campos:

   **Key (Chave):**
   ```
   VITE_API_URL
   ```
   ⚠️ **IMPORTANTE:** Digite exatamente assim, com letras maiúsculas

   **Value (Valor):**
   ```
   https://funnelflow-backend.onrender.com
   ```
   ⚠️ **IMPORTANTE:** Copie exatamente esta URL (com https://)

4. **Deixe marcado:**
   - ✅ **"Deploy to all scopes"** (ou similar)
   - Isso garante que a variável funcione em todos os deploys

5. Clique em **"Save"** ou **"Add variable"**

---

## 🎯 Passo 6: Fazer Redeploy

Agora você precisa fazer um novo deploy para que a variável seja aplicada:

### Opção A: Redeploy Manual

1. Vá na aba **"Deploys"** (no menu superior)
2. Encontre o último deploy
3. Clique nos **três pontinhos (⋯)** ao lado do deploy
4. Selecione **"Trigger deploy"** → **"Deploy site"**
5. Aguarde o deploy concluir (1-2 minutos)

### Opção B: Redeploy Automático (se tiver Git conectado)

1. Faça um pequeno commit e push
2. O Netlify fará deploy automático

---

## 🎯 Passo 7: Verificar

1. Após o deploy concluir, acesse seu site no Netlify
2. Vá em **Configurações** (dentro do site)
3. O campo **"URL do Endpoint da API"** deve estar preenchido automaticamente com:
   ```
   https://funnelflow-backend.onrender.com
   ```
4. Teste a conexão clicando em **"Testar"** (se houver botão)
5. Ou teste qualquer funcionalidade:
   - Dashboard (KPIs)
   - Eventos
   - Funis

---

## ✅ Checklist

- [ ] Acessei o Netlify
- [ ] Selecionei o site correto
- [ ] Acessei "Site settings" → "Environment variables"
- [ ] Adicionei `VITE_API_URL` com valor `https://funnelflow-backend.onrender.com`
- [ ] Salvei a variável
- [ ] Fiz redeploy do site
- [ ] Testei o site e verifiquei se está funcionando

---

## 🖼️ Visual Guide (Onde encontrar)

```
Netlify Dashboard
  └── Seu Site (FunnelFlow)
      └── Site settings (menu superior ou ⋯)
          └── Environment variables (menu lateral)
              └── Add a variable
                  ├── Key: VITE_API_URL
                  └── Value: https://funnelflow-backend.onrender.com
```

---

## 🔧 Troubleshooting

### Não encontro "Environment variables":
- Procure em "Build & deploy" → "Environment"
- Ou em "Build settings" → "Environment variables"
- Ou use a busca do Netlify

### Variável não funciona após deploy:
- Verifique se digitou exatamente `VITE_API_URL` (maiúsculas)
- Verifique se a URL está correta (com https://)
- Limpe o cache do navegador (Ctrl+Shift+R)
- Faça um novo deploy

### Site ainda não conecta:
- Verifique se o backend está online: https://funnelflow-backend.onrender.com/health
- Pode estar suspenso (aguarde 1-2 minutos)
- Verifique os logs do Netlify em "Deploys" → "Functions" ou "Build logs"

---

## 📞 Precisa de Ajuda?

- **Netlify Docs:** https://docs.netlify.com/environment-variables/overview/
- **Netlify Support:** https://www.netlify.com/support/

---

## 🎉 Pronto!

Após configurar, seu frontend no Netlify estará automaticamente conectado ao backend no Render! 🚀

