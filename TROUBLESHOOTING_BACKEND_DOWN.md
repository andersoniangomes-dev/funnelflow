# 🔧 Troubleshooting: Backend Reportado como "Down"

## ⚠️ Situação

O UptimeRobot está reportando o backend como **"Abaixo" (Down)**.

---

## 🔍 Diagnóstico Rápido

### 1. Verificar Status no Render

1. Acesse: https://dashboard.render.com
2. Vá no serviço **"funnelflow-backend"**
3. Verifique:
   - **Status:** Deve estar "Live" (verde)
   - **Logs:** Veja se há erros
   - **Último deploy:** Quando foi feito

### 2. Testar Endpoint Manualmente

Teste no navegador:
```
https://funnelflow-backend.onrender.com/health
```

**Esperado:**
```json
{
  "status": "ok",
  "ga4": "connected" ou "not_configured",
  ...
}
```

**Se der erro:**
- 503 = Backend suspenso ou inicializando
- 404 = Rota não encontrada
- Timeout = Backend não responde

### 3. Verificar Logs do Render

1. No dashboard do Render
2. Clique no serviço
3. Vá em **"Logs"**
4. Veja se há:
   - Erros de inicialização
   - Erros de conexão com banco
   - Erros de GA4

---

## 🎯 Possíveis Causas e Soluções

### Causa 1: Backend Suspenso (Mais Comum)

**Sintomas:**
- Erro 503
- Timeout nas requisições
- Primeira requisição demora 1-2 minutos

**Solução:**
- ✅ **UptimeRobot já está configurado!**
- Aguarde alguns minutos
- O UptimeRobot vai "acordar" o backend
- Depois disso, deve funcionar normalmente

### Causa 2: Backend Reiniciando

**Sintomas:**
- Status "Live" mas não responde
- Logs mostram reinicialização

**Solução:**
- Aguarde 1-2 minutos
- Verifique os logs
- Tente novamente

### Causa 3: Problema com Banco de Dados

**Sintomas:**
- Erros nos logs sobre conexão
- Timeout ao conectar no Neon

**Solução:**
1. Verifique `DATABASE_URL` no Render
2. Teste a conexão no Neon dashboard
3. Verifique se o Neon está ativo

### Causa 4: Problema com GA4

**Sintomas:**
- Erros sobre credenciais
- Erros sobre Property ID

**Solução:**
1. Verifique `GA4_PROPERTY_ID` no Render
2. Verifique `GOOGLE_APPLICATION_CREDENTIALS`
3. Teste as credenciais

### Causa 5: Problema no Render (Raro)

**Sintomas:**
- Status não é "Live"
- Erros de infraestrutura

**Solução:**
1. Verifique: https://status.render.com
2. Entre em contato com suporte do Render
3. Considere fazer redeploy

---

## ✅ Checklist de Verificação

- [ ] Backend está "Live" no Render?
- [ ] Logs mostram algum erro?
- [ ] `DATABASE_URL` está configurada corretamente?
- [ ] `GA4_PROPERTY_ID` está configurado?
- [ ] Endpoint `/health` responde manualmente?
- [ ] UptimeRobot está ativo e fazendo verificações?

---

## 🔄 Ações Imediatas

### 1. Verificar Render Dashboard

```
1. Acesse: https://dashboard.render.com
2. Vá em "funnelflow-backend"
3. Verifique status e logs
```

### 2. Testar Endpoint

```
Acesse no navegador:
https://funnelflow-backend.onrender.com/health
```

### 3. Aguardar

- Se for suspensão, aguarde 1-2 minutos
- O UptimeRobot vai reativar automaticamente

### 4. Verificar Logs

- Veja os logs do Render
- Procure por erros
- Verifique se há problemas de inicialização

---

## 📊 Interpretando o Status do UptimeRobot

### "Abaixo" (Down)
- Backend não respondeu na última verificação
- Pode ser suspenso, reiniciando, ou com erro

### "Preparando..." (Preparing)
- Monitor acabou de ser criado
- Aguardando primeira verificação

### "Acima" (Up)
- Backend está funcionando normalmente
- Todas as verificações estão passando

---

## 💡 Dicas

1. **Uptime de 53,8%** indica que o backend esteve down recentemente
2. **1 incidente** significa que houve uma falha
3. **Tempo de resposta ~99ms** quando está funcionando é normal
4. O backend pode estar **suspenso** e o UptimeRobot está tentando reativar

---

## 🎯 Próximos Passos

1. ✅ Verificar status no Render
2. ✅ Testar endpoint manualmente
3. ✅ Aguardar alguns minutos (se suspenso)
4. ✅ Verificar logs para erros
5. ✅ Se persistir, verificar configurações

---

## 📞 Suporte

- **Render Status:** https://status.render.com
- **Render Support:** https://render.com/support
- **UptimeRobot Docs:** https://uptimerobot.com/api/

---

## 🔍 Comandos Úteis

### Testar Health Endpoint:
```bash
curl https://funnelflow-backend.onrender.com/health
```

### Verificar Status:
```bash
# No navegador
https://funnelflow-backend.onrender.com/health
```

---

## ✅ Resumo

O backend pode estar:
- ⏳ **Suspenso** (aguarde 1-2 minutos)
- 🔄 **Reiniciando** (verifique logs)
- ❌ **Com erro** (verifique logs e configurações)

O **UptimeRobot está configurado** e vai manter o backend ativo. Aguarde alguns minutos e verifique novamente! 🚀

