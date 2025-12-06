# 🚀 Guia de Deploy - FunnelFlow

Este guia mostra como fazer deploy do FunnelFlow em plataformas gratuitas com domínio personalizado.

## 📋 Pré-requisitos

1. Conta no GitHub (gratuita)
2. Conta na plataforma escolhida (Vercel, Netlify ou Cloudflare Pages)

---

## 🎯 Opção 1: Vercel (Recomendado - Mais Fácil)

### Passo 1: Preparar o Repositório
```bash
# Se ainda não tem o projeto no GitHub:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/funnelflow.git
git push -u origin main
```

### Passo 2: Deploy na Vercel

1. **Acesse**: https://vercel.com
2. **Faça login** com sua conta GitHub
3. **Clique em "Add New Project"**
4. **Importe seu repositório** do GitHub
5. **Configure o projeto**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. **Clique em "Deploy"**

✅ **Pronto!** Seu app estará disponível em: `https://seu-projeto.vercel.app`

### Passo 3: Domínio Personalizado (Opcional)

1. Na Vercel, vá em **Settings → Domains**
2. Adicione seu domínio personalizado
3. Siga as instruções de DNS fornecidas

---

## 🎯 Opção 2: Netlify

### Passo 1: Deploy na Netlify

1. **Acesse**: https://netlify.com
2. **Faça login** com sua conta GitHub
3. **Clique em "Add new site" → "Import an existing project"**
4. **Conecte ao GitHub** e selecione seu repositório
5. **Configure o build**:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **Clique em "Deploy site"**

✅ **Pronto!** Seu app estará disponível em: `https://seu-projeto.netlify.app`

### Passo 2: Domínio Personalizado

1. Vá em **Site settings → Domain management**
2. Clique em **"Add custom domain"**
3. Siga as instruções de DNS

---

## 🎯 Opção 3: Cloudflare Pages

### Passo 1: Deploy na Cloudflare Pages

1. **Acesse**: https://pages.cloudflare.com
2. **Faça login** com sua conta Cloudflare
3. **Conecte ao GitHub** e selecione seu repositório
4. **Configure o build**:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
5. **Clique em "Save and Deploy"**

✅ **Pronto!** Seu app estará disponível em: `https://seu-projeto.pages.dev`

---

## 🌐 Domínios Gratuitos

### Opções de Domínios Gratuitos:

1. **Freenom** (https://www.freenom.com)
   - Extensões: `.tk`, `.ml`, `.ga`, `.cf`, `.gq`
   - Totalmente gratuito

2. **No-IP** (https://www.noip.com)
   - Subdomínios gratuitos

3. **GitHub Student Pack**
   - Domínios `.me` gratuitos para estudantes

### Como Configurar:

1. **Registre o domínio** no serviço escolhido
2. **Configure os DNS** apontando para:
   - Vercel: `cname.vercel-dns.com`
   - Netlify: `seu-projeto.netlify.app`
   - Cloudflare: `seu-projeto.pages.dev`
3. **Adicione o domínio** na plataforma de hospedagem

---

## 🔧 Deploy Manual (Alternativa)

Se preferir fazer deploy manual:

```bash
# 1. Build do projeto
npm run build

# 2. A pasta dist/ contém os arquivos prontos
# 3. Faça upload da pasta dist/ para qualquer servidor estático
```

---

## ✅ Verificação Pós-Deploy

Após o deploy, verifique:

- [ ] Site carrega corretamente
- [ ] Rotas funcionam (ex: `/funnels`, `/events`)
- [ ] Gráficos e componentes renderizam
- [ ] Responsividade funciona em mobile

---

## 🐛 Troubleshooting

### Problema: Rotas não funcionam (404)
**Solução**: Verifique se os arquivos `vercel.json`, `netlify.toml` ou `_redirects` estão configurados corretamente.

### Problema: Build falha
**Solução**: 
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema: Assets não carregam
**Solução**: Verifique se o `base` no `vite.config.ts` está correto (deve estar vazio ou `/` para produção).

---

## 📝 Notas Importantes

- O projeto usa **React Router** com rotas client-side
- Todos os arquivos de configuração já estão criados
- O build gera uma SPA (Single Page Application)
- Domínios gratuitos podem ter limitações de renovação

---

## 🎉 Pronto!

Seu FunnelFlow está no ar! 🚀

