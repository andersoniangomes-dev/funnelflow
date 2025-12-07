# 🗄️ Integração com Neon PostgreSQL - Guia Rápido

## ✅ O que foi implementado

1. ✅ Driver PostgreSQL instalado (`@neondatabase/serverless`)
2. ✅ Módulo de conexão com banco de dados (`lib/db.js`)
3. ✅ Schema SQL criado (`db/schema.sql`)
4. ✅ Rotas UTM atualizadas para usar PostgreSQL
5. ✅ Rotas de encurtador atualizadas para usar PostgreSQL
6. ✅ Script de migração de dados JSON → PostgreSQL
7. ✅ Fallback automático para JSON se banco não estiver configurado

## 🚀 Como Configurar

### 1. Obter String de Conexão do Neon

1. Acesse: https://console.neon.tech
2. Crie um projeto (se ainda não tiver)
3. Vá em "Connection Details"
4. Copie a **Connection String**

### 2. Configurar no Backend

Crie/edite o arquivo `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@hostname/database?sslmode=require
```

### 3. Iniciar o Servidor

O banco será inicializado automaticamente:

```bash
cd backend
npm run dev
```

Você verá:
```
✅ Conectado ao banco de dados Neon PostgreSQL
✅ Tabelas do banco de dados inicializadas
```

### 4. Migrar Dados Existentes (Opcional)

Se você já tem dados nos arquivos JSON:

```bash
cd backend
npm run migrate
```

## 📊 Tabelas Criadas

### `utm_clicks`
- Armazena todos os cliques em links UTM
- Campos: `utm_id`, `url`, `ip`, `user_agent`, `referer`, `timestamp`

### `short_urls`
- Armazena URLs encurtadas
- Campos: `short_code`, `original_url`, `clicks`, `created_at`, `last_click`

## 🔄 Como Funciona

### Com Banco de Dados Configurado
- ✅ Todos os dados são salvos no PostgreSQL
- ✅ Consultas são otimizadas com índices
- ✅ Escalável e confiável

### Sem Banco de Dados Configurado
- ✅ Sistema continua funcionando
- ✅ Dados são salvos em arquivos JSON
- ✅ Fallback automático e transparente

## 🧪 Testar

1. Configure o `DATABASE_URL` no `.env`
2. Inicie o servidor
3. Crie uma UTM ou encurte uma URL
4. Verifique no dashboard do Neon que os dados foram salvos

## 📝 Notas

- O sistema funciona com ou sem banco de dados
- A migração é opcional (apenas se você já tem dados)
- Os arquivos JSON continuam sendo usados como fallback
- Não há downtime durante a migração


