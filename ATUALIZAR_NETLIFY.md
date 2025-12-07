# 🔄 Atualizar Frontend no Netlify para Usar Backend do Render

## 📋 Situação Atual

- ✅ **Frontend:** Hospedado no Netlify
- ✅ **Backend:** Hospedado no Render
- 🔄 **Ação:** Conectar frontend ao backend

---

## 🎯 Opção 1: Variável de Ambiente (Recomendado)

Esta é a melhor opção porque funciona para todos os usuários automaticamente.

### Passo 1: Acessar Netlify Dashboard

1. Acesse: https://app.netlify.com
2. Faça login na sua conta
3. Selecione o site do FunnelFlow

### Passo 2: Configurar Variável de Ambiente

1. Vá em **"Site settings"** (Configurações do site)
2. No menu lateral, clique em **"Environment variables"** (Variáveis de ambiente)
3. Clique em **"Add a variable"** (Adicionar variável)
4. Adicione:

   **Key:**
   ```
   VITE_API_URL
   ```

   **Value:**
   ```
   https://funnelflow-backend.onrender.com
   ```

5. Clique em **"Save"**

### Passo 3: Fazer Redeploy

1. Vá em **"Deploys"** (Deploys)
2. Clique nos **"..."** (três pontos) do último deploy
3. Selecione **"Trigger deploy"** → **"Deploy site"**
4. Aguarde o deploy concluir (1-2 minutos)

### Passo 4: Verificar

1. Acesse seu site no Netlify
2. Vá em **Configurações**
3. O campo "URL do Endpoint da API" deve estar preenchido automaticamente
4. Teste a conexão

---

## 🎯 Opção 2: Atualizar Código (Alternativa)

Se preferir, podemos atualizar o código para usar a URL do Render como padrão.

### Atualizar `src/lib/api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://funnelflow-backend.onrender.com';
```

Depois:
1. Commit e push
2. Netlify fará deploy automático

---

## 🎯 Opção 3: Configurar no Netlify.toml

Você também pode adicionar no `netlify.toml`:

```toml
[build]
  environment = { VITE_API_URL = "https://funnelflow-backend.onrender.com" }
```

---

## ✅ Recomendação Final

**Use a Opção 1 (Variável de Ambiente no Netlify):**

✅ Mais flexível (pode mudar sem alterar código)
✅ Funciona imediatamente após redeploy
✅ Não precisa commitar URLs no código
✅ Fácil de gerenciar

---

## 🧪 Testar Após Configurar

1. Acesse seu site no Netlify
2. Vá em **Configurações**
3. Verifique se a URL do endpoint está correta
4. Teste qualquer funcionalidade:
   - Dashboard (KPIs)
   - Eventos
   - Funis
   - Tráfego

---

## 🔧 Troubleshooting

### Frontend ainda usa localhost:

- Verifique se a variável `VITE_API_URL` está configurada no Netlify
- Faça um novo deploy
- Limpe o cache do navegador (Ctrl+Shift+R)

### Erro de CORS:

- O backend já está configurado com CORS
- Se ainda houver erro, verifique os logs do Netlify

### API não responde:

- Verifique se o backend está online: https://funnelflow-backend.onrender.com/health
- Pode estar suspenso (plano gratuito)
- Aguarde 1-2 minutos para reativar

---

## 📝 Checklist

- [ ] Configurar `VITE_API_URL` no Netlify
- [ ] Fazer redeploy do site
- [ ] Testar conexão no site
- [ ] Verificar se os dados aparecem corretamente
- [ ] (Opcional) Configurar UptimeRobot para manter backend ativo

---

## 🎉 Pronto!

Após configurar, seu frontend no Netlify estará conectado ao backend no Render! 🚀

