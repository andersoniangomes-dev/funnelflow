# 🔗 Como Funciona o Tracking de Cliques em UTMs

## 📊 Fluxo Completo do Sistema

### 1. **Criação da URL de Tracking**

Quando você cria e salva uma UTM, o sistema gera duas URLs:

**URL Original (UTM):**
```
https://seusite.com/produto?utm_source=instagram&utm_medium=story&utm_campaign=black_friday
```

**URL de Tracking (para usar nos links):**
```
http://localhost:3000/utm/track/1765035232663?url=https%3A%2F%2Fseusite.com%2Fproduto%3Futm_source%3Dinstagram%26utm_medium%3Dstory%26utm_campaign%3Dblack_friday
```

### 2. **O Que Acontece Quando Alguém Clica**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário clica no link de tracking                        │
│    http://localhost:3000/utm/track/123?url=https://...      │
└──────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend recebe a requisição                              │
│    - Extrai o UTM ID (123)                                  │
│    - Extrai a URL de destino (https://...)                   │
│    - Registra o clique no arquivo JSON                      │
│    - Salva: timestamp, IP, user-agent, referer              │
└──────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend redireciona para a URL original                  │
│    res.redirect(decodedUrl)                                 │
│    → Usuário é redirecionado para:                          │
│    https://seusite.com/produto?utm_source=...              │
└──────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Usuário acessa seu site normalmente                      │
│    - Os parâmetros UTM são preservados                       │
│    - Google Analytics recebe os dados UTM                   │
│    - Você pode ver no GA4:                                  │
│      * Fonte: instagram                                      │
│      * Mídia: story                                          │
│      * Campanha: black_friday                                │
└─────────────────────────────────────────────────────────────┘
```

### 3. **Armazenamento dos Dados**

Os cliques são salvos em:
```
backend/data/utm-clicks.json
```

Estrutura:
```json
{
  "1765035232663": {
    "totalClicks": 5,
    "clicks": [
      {
        "timestamp": "2025-12-06T15:43:39.202Z",
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "referer": "https://instagram.com"
      }
    ],
    "lastClick": "2025-12-06T15:43:39.202Z"
  }
}
```

### 4. **Visualização no Dashboard**

O frontend busca as estatísticas periodicamente:
- A cada 10 segundos automaticamente
- Manualmente via botão "Atualizar"
- Ao carregar a página

## 🚀 Como Funciona em Produção

### Configuração Necessária

1. **Backend em Produção:**
   - Deploy do backend em um servidor (ex: Vercel, Railway, Heroku)
   - URL do backend: `https://api.seudominio.com`

2. **Configurar no Frontend:**
   - Vá em Configurações
   - Defina: `URL do Endpoint da API` = `https://api.seudominio.com`

3. **URLs de Tracking em Produção:**
   ```
   https://api.seudominio.com/utm/track/123?url=https://...
   ```

### Fluxo em Produção

```
Usuário clica
    ↓
https://api.seudominio.com/utm/track/123?url=...
    ↓
Backend registra o clique
    ↓
Backend redireciona para seu site
    ↓
https://seusite.com/produto?utm_source=...
    ↓
Google Analytics recebe os dados UTM
    ↓
Você vê no GA4 E no FunnelFlow Dashboard
```

## 📈 Dados Coletados

Para cada clique, o sistema registra:

1. **Timestamp** - Data e hora exata do clique
2. **IP** - Endereço IP do usuário
3. **User-Agent** - Navegador e dispositivo
4. **Referer** - De onde veio o clique (Instagram, Facebook, etc.)

## 🔄 Integração com Google Analytics

Os parâmetros UTM são preservados durante o redirecionamento, então:

✅ **Google Analytics recebe:**
- `utm_source` - Fonte do tráfego
- `utm_medium` - Mídia (story, feed, cpc, etc.)
- `utm_campaign` - Nome da campanha
- `utm_content` - Conteúdo específico (opcional)
- `utm_term` - Termo de busca (opcional)

✅ **FunnelFlow Dashboard mostra:**
- Total de cliques por UTM
- Cliques dos últimos 30 dias
- Último clique registrado
- Histórico completo de cliques

## ⚠️ Importante

1. **Use sempre a URL de Tracking** nos seus links
   - ❌ Não use: `https://seusite.com?utm_source=...`
   - ✅ Use: `https://api.seudominio.com/utm/track/123?url=...`

2. **Os dados UTM são preservados**
   - O redirecionamento mantém todos os parâmetros UTM
   - O Google Analytics recebe os dados normalmente

3. **Tracking funciona mesmo em aba anônima**
   - O backend registra o clique independente do navegador
   - Os dados aparecem no dashboard após atualização

## 🛠️ Troubleshooting

Se os cliques não aparecerem:

1. Verifique se o backend está rodando
2. Verifique se a URL de tracking está correta
3. Abra o Console do navegador (F12) e veja os logs
4. Clique no botão "Atualizar" para forçar atualização
5. Verifique o arquivo `backend/data/utm-clicks.json`

