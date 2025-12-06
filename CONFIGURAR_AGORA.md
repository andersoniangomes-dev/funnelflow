# 🚀 Configurar GA4 Agora - Guia Rápido

Você já completou o setup do Google Cloud! Agora vamos configurar via interface.

## ✅ O que você já tem:

- ✅ Property ID: `514686876`
- ✅ Service Account JSON baixado
- ✅ Backend com dependências instaladas

## 🎯 Passos para Configurar:

### 1. Iniciar o Backend

```bash
cd backend
npm run dev
```

O servidor estará em: `http://localhost:3000`

### 2. Iniciar o Frontend

Em outro terminal:

```bash
cd ..  # Voltar para a raiz do projeto
npm run dev
```

O frontend estará em: `http://localhost:8080`

### 3. Configurar via Interface

1. **Acesse**: http://localhost:8080
2. **Vá em**: Configurações (menu lateral)
3. **Configure**:
   - **URL do Endpoint da API**: `http://localhost:3000`
   - **ID da Propriedade GA4**: `514686876`
   - **Service Account JSON**: 
     - Clique em **"Fazer Upload do JSON"** OU
     - Abra o arquivo `service-account-key.json` e cole o conteúdo no campo de texto
4. **Clique em**: "Salvar Configuração GA4"
5. **Aguarde**: A configuração será salva e testada automaticamente

### 4. Verificar Conexão

1. No card de status, clique em **"Testar"**
2. Se tudo estiver correto, verá: ✅ **"Conectado - A API está respondendo corretamente"**

---

## 📋 Checklist Final:

- [ ] Backend rodando em `http://localhost:3000`
- [ ] Frontend rodando em `http://localhost:8080`
- [ ] Property ID inserido: `514686876`
- [ ] JSON do Service Account enviado (upload ou colado)
- [ ] Configuração salva com sucesso
- [ ] Teste de conexão retornando ✅

---

## 🎉 Pronto!

Depois de configurar, você pode:
- ✅ Ver KPIs reais no Dashboard
- ✅ Visualizar eventos do GA4
- ✅ Analisar funis de conversão
- ✅ Ver fontes de tráfego

**Tudo funcionando com dados reais do Google Analytics 4!** 🚀

