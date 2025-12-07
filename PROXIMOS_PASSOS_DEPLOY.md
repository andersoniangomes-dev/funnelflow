# ✅ Deploy Concluído! Próximos Passos

## 🎉 Parabéns! Seu backend está no ar!

**URL do Backend:** https://funnelflow-backend.onrender.com

---

## ⚠️ IMPORTANTE: Configurar Variáveis de Ambiente

O deploy foi bem-sucedido, mas você precisa atualizar as variáveis de ambiente no Render:

### 1. Acesse o Dashboard do Render

1. Vá em: https://dashboard.render.com
2. Clique no serviço **"funnelflow-backend"**
3. Vá na aba **"Environment"**

### 2. Atualize as Variáveis:

#### ✅ DATABASE_URL (já configurado)
```
postgresql://neondb_owner:npg_JBGD8cbHlM3A@ep-wispy-grass-aeqbrv6u-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### ⚠️ GA4_PROPERTY_ID (PRECISA ATUALIZAR)
```
Substitua "seu-property-id-aqui" pelo seu Property ID real do GA4
```

#### ⚠️ GOOGLE_APPLICATION_CREDENTIALS (PRECISA ATUALIZAR)
```
Cole o JSON completo do Service Account do Google Cloud
Formato: {"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```

#### ✅ NODE_ENV (já configurado)
```
production
```

### 3. Após Atualizar

- O Render fará **redeploy automático**
- Aguarde 1-2 minutos
- Verifique os logs para confirmar

---

## 🧪 Testar a API

### Teste 1: Health Check
```
https://funnelflow-backend.onrender.com/health
```

Deve retornar:
```json
{
  "status": "ok",
  "ga4": "connected" ou "not_configured",
  "propertyId": "...",
  "message": "..."
}
```

### Teste 2: Root Endpoint
```
https://funnelflow-backend.onrender.com/
```

Deve retornar informações sobre a API e endpoints disponíveis.

---

## 🔄 Atualizar Frontend

Agora você precisa atualizar o frontend para usar o backend hospedado:

### Opção 1: Frontend Local

1. Abra o frontend localmente
2. Vá em **Configurações**
3. No campo **"URL do Endpoint da API"**, coloque:
   ```
   https://funnelflow-backend.onrender.com
   ```
4. Clique em **"Salvar"**
5. Teste a conexão

### Opção 2: Frontend Hospedado

Se seu frontend também estiver hospedado (Vercel, Netlify, etc.):
- Atualize a variável de ambiente `VITE_API_URL` ou
- Configure no código para usar a URL do Render

---

## 📊 Endpoints Disponíveis

Seu backend agora está acessível em:

- **Health:** `https://funnelflow-backend.onrender.com/health`
- **KPIs:** `https://funnelflow-backend.onrender.com/kpis`
- **Events:** `https://funnelflow-backend.onrender.com/events`
- **Funnel:** `https://funnelflow-backend.onrender.com/funnel`
- **Traffic:** `https://funnelflow-backend.onrender.com/traffic`
- **Config:** `https://funnelflow-backend.onrender.com/config`
- **UTM:** `https://funnelflow-backend.onrender.com/utm`
- **Shortener:** `https://funnelflow-backend.onrender.com/s`
- **Funnels API:** `https://funnelflow-backend.onrender.com/api/funnels`
- **UTMs API:** `https://funnelflow-backend.onrender.com/api/utms`

---

## ⚠️ Limitações do Plano Gratuito

### Suspensão Automática
- O serviço **suspende após 15 minutos de inatividade**
- Demora **1-2 minutos** para reativar quando alguém acessa

### Como Evitar Suspensão

Use um serviço de "ping" gratuito:

1. **UptimeRobot** (recomendado): https://uptimerobot.com
   - Crie conta gratuita
   - Adicione monitor HTTP
   - URL: `https://funnelflow-backend.onrender.com/health`
   - Intervalo: 5 minutos
   - Isso mantém o serviço sempre ativo

2. **Cron-Job.org**: https://cron-job.org
   - Configure um job para fazer requisição a cada 10 minutos

---

## 🔍 Verificar Logs

Para ver os logs do seu backend:

1. No dashboard do Render
2. Clique no serviço
3. Vá em **"Logs"**
4. Veja logs em tempo real

---

## 🎯 Checklist Final

- [ ] ✅ Backend deployado e funcionando
- [ ] ⏳ Atualizar `GA4_PROPERTY_ID` no Render
- [ ] ⏳ Atualizar `GOOGLE_APPLICATION_CREDENTIALS` no Render
- [ ] ⏳ Testar endpoint `/health`
- [ ] ⏳ Atualizar frontend com URL do Render
- [ ] ⏳ Configurar serviço de ping (UptimeRobot)
- [ ] ⏳ Testar integração completa

---

## 🚀 Próximos Passos (Opcional)

1. **Hospedar Frontend:**
   - Vercel (recomendado): https://vercel.com
   - Netlify: https://netlify.com
   - Cloudflare Pages: https://pages.cloudflare.com

2. **Domínio Personalizado:**
   - Render permite adicionar domínio customizado
   - Configure DNS apontando para o Render

3. **Upgrade de Plano (se necessário):**
   - Render Starter: $7/mês (sem suspensão)
   - Render Standard: $25/mês (mais recursos)

---

## 📞 Suporte

- **Render Docs:** https://render.com/docs
- **Render Support:** https://render.com/support
- **Status Page:** https://status.render.com

---

## 🎉 Pronto!

Seu backend está no ar e funcionando! Agora é só:
1. Configurar as variáveis de ambiente
2. Atualizar o frontend
3. Começar a usar! 🚀

