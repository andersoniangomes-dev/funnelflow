# 🚀 Próximos Passos para Deploy

## ✅ O que já foi feito:
- ✅ Repositório Git inicializado
- ✅ Commit inicial criado
- ✅ Branch renomeada para `main`
- ✅ Arquivos de configuração de deploy criados

## 📝 Próximo Passo: Criar Repositório no GitHub

### Opção 1: Via Site do GitHub (Recomendado)

1. **Acesse**: https://github.com/new
2. **Preencha**:
   - Repository name: `funnelflow` (ou o nome que preferir)
   - Description: "Plataforma de Analytics e Funis de Conversão"
   - Público ou Privado (sua escolha)
   - **NÃO marque** "Initialize with README" (já temos um)
3. **Clique em "Create repository"**
4. **Copie o comando** que aparece (será algo como):
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/funnelflow.git
   git push -u origin main
   ```
5. **Execute os comandos** no terminal

### Opção 2: Via GitHub CLI (se tiver instalado)

```bash
gh repo create funnelflow --public --source=. --remote=origin --push
```

---

## 🌐 Depois de Fazer Push para GitHub

### Deploy na Vercel (Mais Fácil):

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório `funnelflow`
5. A Vercel detecta automaticamente:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Clique em **"Deploy"**
7. Aguarde ~2 minutos
8. ✅ **Pronto!** Seu site estará em: `https://funnelflow.vercel.app`

### Deploy na Netlify:

1. Acesse: https://netlify.com
2. Faça login com GitHub
3. Clique em **"Add new site" → "Import an existing project"**
4. Selecione o repositório `funnelflow`
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Clique em **"Deploy site"**
7. ✅ **Pronto!** Seu site estará em: `https://funnelflow.netlify.app`

---

## 🔗 Comandos para Conectar ao GitHub

Depois de criar o repositório no GitHub, execute:

```bash
# Substitua SEU_USUARIO pelo seu username do GitHub
git remote add origin https://github.com/SEU_USUARIO/funnelflow.git
git push -u origin main
```

---

## 📌 Notas Importantes

- O deploy é **automático** após cada push no GitHub
- Você pode conectar um **domínio personalizado** depois
- Todas as configurações já estão prontas nos arquivos:
  - `vercel.json`
  - `netlify.toml`
  - `public/_redirects`

---

## 🎉 Pronto!

Depois de fazer o push para o GitHub e conectar na plataforma de sua escolha, seu site estará no ar em poucos minutos!

