# 🔍 Diagnóstico: Erro 404 ao Salvar Configuração

## ❌ Problema

Ao tentar salvar a configuração do GA4 no site hospedado (Netlify), aparece o erro:
```
Erro ao salvar configuração: HTTP error! status: 404
```

## 🔍 Possíveis Causas

### 1. **Backend Suspenso (Mais Provável)** ⚠️

O plano gratuito do Render suspende o serviço após **15 minutos de inatividade**.

**Sintomas:**
- Erro 404 ao tentar acessar
- Primeira requisição demora 1-2 minutos
- Depois funciona normalmente

**Solução:**
1. Aguarde 1-2 minutos após o primeiro acesso
2. Tente novamente
3. Configure UptimeRobot para manter o serviço ativo:
   - URL: `https://funnelflow-backend.onrender.com/health`
   - Intervalo: 5 minutos

### 2. **URL do Endpoint Incorreta**

**Verificar:**
1. Abra o console do navegador (F12)
2. Veja os logs quando tentar salvar
3. Verifique a URL exata sendo usada
4. Deve ser: `https://funnelflow-backend.onrender.com`

**Solução:**
- Se a URL estiver errada, atualize no campo "URL do Endpoint da API"
- Ou configure a variável `VITE_API_URL` no Netlify

### 3. **Problema de CORS**

**Verificar:**
- Erro no console sobre CORS
- Requisição bloqueada pelo navegador

**Solução:**
- Backend já tem CORS configurado
- Se persistir, verifique os logs do Render

### 4. **Rota Não Encontrada**

**Verificar:**
- A rota `/config` existe no backend
- Está registrada corretamente

**Solução:**
- Rota está correta no código
- Pode ser problema temporário do Render

---

## 🧪 Como Diagnosticar

### Passo 1: Abrir Console do Navegador

1. Acesse seu site no Netlify
2. Pressione **F12** (ou clique com botão direito → Inspecionar)
3. Vá na aba **Console**

### Passo 2: Tentar Salvar Configuração

1. Vá em **Configurações**
2. Preencha os dados do GA4
3. Clique em **Salvar Configuração GA4**
4. Observe os logs no console

### Passo 3: Verificar Logs

Você deve ver logs como:
```
🔧 Atualizando API base URL para: https://funnelflow-backend.onrender.com
🔗 Salvando configuração para: https://funnelflow-backend.onrender.com
📡 Request: POST https://funnelflow-backend.onrender.com/config
📥 Response: 404 Not Found
```

### Passo 4: Verificar URL

- A URL deve ser: `https://funnelflow-backend.onrender.com`
- Se for diferente, esse é o problema!

---

## ✅ Soluções

### Solução 1: Aguardar Backend Reativar

1. Acesse: `https://funnelflow-backend.onrender.com/health`
2. Aguarde 1-2 minutos (primeira requisição demora)
3. Tente salvar novamente

### Solução 2: Configurar UptimeRobot

1. Acesse: https://uptimerobot.com
2. Crie conta gratuita
3. Adicione monitor:
   - Tipo: HTTP(s)
   - URL: `https://funnelflow-backend.onrender.com/health`
   - Intervalo: 5 minutos
4. Isso mantém o backend sempre ativo

### Solução 3: Verificar Variável de Ambiente

1. No Netlify, vá em **Site settings** → **Environment variables**
2. Verifique se `VITE_API_URL` está configurada
3. Deve ser: `https://funnelflow-backend.onrender.com`

### Solução 4: Testar Endpoint Diretamente

Teste no navegador ou via curl:
```bash
# GET (deve funcionar)
https://funnelflow-backend.onrender.com/config

# POST (teste básico)
curl -X POST https://funnelflow-backend.onrender.com/config \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"test","credentials":{"type":"test"}}'
```

---

## 📊 Melhorias Implementadas

✅ **Logs de debug** - Agora você pode ver exatamente o que está acontecendo
✅ **Mensagens de erro melhoradas** - Mostra a URL e tipo de erro
✅ **Tratamento específico para 404** - Mensagem clara sobre o problema
✅ **Verificação de endpoint** - Garante que a URL está correta antes de salvar

---

## 🎯 Próximos Passos

1. **Teste novamente** com o console aberto
2. **Verifique os logs** para ver a URL exata
3. **Se for 404**, aguarde 1-2 minutos e tente novamente
4. **Configure UptimeRobot** para evitar suspensão

---

## 💡 Dica

O erro 404 geralmente significa que o backend está **suspenso** (plano gratuito). A primeira requisição "acorda" o serviço, mas demora 1-2 minutos. Depois disso, funciona normalmente até suspender novamente após 15 minutos de inatividade.

**Solução permanente:** Configure UptimeRobot! 🚀

