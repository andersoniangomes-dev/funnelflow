# 🗄️ Configuração do Banco de Dados Neon PostgreSQL

## 📋 Pré-requisitos

1. Conta no Neon: https://console.neon.tech
2. Projeto criado no Neon
3. String de conexão do banco de dados

## 🔧 Passo a Passo

### 1. Criar Projeto no Neon

1. Acesse: https://console.neon.tech
2. Faça login ou crie uma conta
3. Clique em "Create Project"
4. Escolha um nome para o projeto (ex: `funnelflow`)
5. Selecione a região mais próxima
6. Clique em "Create Project"

### 2. Obter String de Conexão

1. No dashboard do Neon, vá em "Connection Details"
2. Copie a **Connection String** (psql 'postgresql://neondb_owner:npg_JBGD8cbHlM3A@ep-wispy-grass-aeqbrv6u-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require')
3. Exemplo:
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Configurar no Backend

1. No diretório `backend/`, crie um arquivo `.env` (se não existir)
2. Adicione a string de conexão:

```env
DATABASE_URL=postgresql://user:password@hostname/database?sslmode=require
```

**⚠️ IMPORTANTE:** Não commite o arquivo `.env` no Git! Ele já está no `.gitignore`.

### 4. Inicializar o Banco de Dados

O banco de dados será inicializado automaticamente quando o servidor iniciar. As tabelas serão criadas automaticamente.

**Ou execute manualmente:**

```bash
cd backend
npm run migrate
```

### 5. Migrar Dados Existentes (Opcional)

Se você já tem dados nos arquivos JSON, você pode migrá-los:

```bash
cd backend
npm run migrate
```

Este comando irá:
- Migrar cliques UTM de `data/utm-clicks.json` para a tabela `utm_clicks`
- Migrar URLs encurtadas de `data/short-urls.json` para a tabela `short_urls`

## 📊 Estrutura das Tabelas

### `utm_clicks`
Armazena os cliques em links UTM:
- `id` - ID único
- `utm_id` - ID da UTM
- `url` - URL de destino
- `ip` - Endereço IP do usuário
- `user_agent` - Navegador/dispositivo
- `referer` - Origem do clique
- `timestamp` - Data e hora do clique

### `short_urls`
Armazena URLs encurtadas:
- `id` - ID único
- `short_code` - Código curto (único)
- `original_url` - URL original
- `clicks` - Contador de cliques
- `created_at` - Data de criação
- `last_click` - Data do último clique

## 🔄 Fallback Automático

O sistema foi projetado para funcionar mesmo sem o banco de dados configurado:

- ✅ Se `DATABASE_URL` estiver configurada → usa PostgreSQL
- ✅ Se não estiver configurada → usa arquivos JSON (fallback)

Isso garante que o sistema continue funcionando durante a migração.

## 🧪 Testar a Conexão

Após configurar, inicie o servidor:

```bash
cd backend
npm run dev
```

Você deve ver:
```
✅ Conectado ao banco de dados Neon PostgreSQL
✅ Tabelas do banco de dados inicializadas
```

## 🛠️ Troubleshooting

### Erro: "Connection refused"
- Verifique se a string de conexão está correta
- Verifique se o projeto Neon está ativo
- Verifique se o IP está permitido (Neon permite todos por padrão)

### Erro: "Table already exists"
- Normal, significa que as tabelas já foram criadas
- Pode ignorar ou executar `DROP TABLE` se necessário

### Erro: "SSL required"
- Certifique-se de que a string de conexão inclui `?sslmode=require`
- Neon requer SSL por padrão

## 📝 Notas Importantes

1. **Backup**: Sempre faça backup dos dados antes de migrar
2. **Teste**: Teste em ambiente de desenvolvimento primeiro
3. **Monitoramento**: Monitore o uso do banco no dashboard do Neon
4. **Limites**: Neon tem limites de uso no plano gratuito

## 🔗 Links Úteis

- Dashboard Neon: https://console.neon.tech
- Documentação Neon: https://neon.tech/docs
- Documentação PostgreSQL: https://www.postgresql.org/docs/

