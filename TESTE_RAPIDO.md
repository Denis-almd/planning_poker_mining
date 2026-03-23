# 🎭 TESTE RÁPIDO - Planning Poker Mock Setup

## 3 Passos para Testar Agora

### 1️⃣ Terminal A - Mock Server
```bash
npm run mock-server
```

Você verá:
```
🚀 Servidor rodando em: http://localhost:5000
```

### 2️⃣ Terminal B - Frontend
```bash
npm start
```

Abre automaticamente `http://localhost:4200`

### 3️⃣ Browser - Teste Multiuser
- Abra a URL em **2-3 browsers diferentes** (Chrome, Edge, Firefox)
  - Browser 1: Digite "Denis" → Entrar
  - Browser 2: Digite "Ana" → Entrar
  - Browser 3: Digite "Bruno" → Entrar

**Agora teste:**
- Cada um clica numa carta diferente
- Um clica "Revelar Votos"
- Todos veem as cartas
- Um clica "Nova Rodada"
- Repeat

---

## 📋 Checklist de Teste

- [ ] Frontend carrega sem erros
- [ ] Consegue entrar com nome
- [ ] Aparecem participantes em tempo real (polling 2s)
- [ ] Consegue votar
- [ ] Pode revelar votos
- [ ] Pode resetar para nova rodada
- [ ] Outros browsers sincronizam (sem atualizar manualmente)
- [ ] Interface é responsiva (mobile, tablet, desktop)
- [ ] Botões habilitam/desabilitam corretamente

---

## 🆘 Se não funcionar

**Porta 5000 já está em uso?**
```bash
# Mude a porta no mock-server.js:
const PORT = 5000;  # → Mude para 5001, 5002, etc
```

**Porta 4200 já está em uso?**
```bash
npm start -- --port 4201
```

**CORS error?**
- Verificar console (F12)
- Mock server tem CORS habilitado
- Deve funcionar automáticamente

**Votação não aparece?**
- F12 → Network tab
- Procure requisições `/api/state`
- Deve haver uma a cada 2 segundos

---

## 📁 Arquivos Criados

| Arquivo | Uso |
|---------|-----|
| `mock-server.js` | Servidor fake em Node.js |
| `MOCK_SERVER.md` | Documentação completa do mock |
| `package.json` | Atualizado com express, cors e script |

---

## 🎯 Próximos Passos

Quando tiver o **backend Python pronto**:
1. Parar mock server (Ctrl+C)
2. Iniciar seu backend Python em `:5000`
3. Frontend **funciona igual** (não precisa mudar código!)

---

**Tudo pronto? Vai lá testar!** 🚀
