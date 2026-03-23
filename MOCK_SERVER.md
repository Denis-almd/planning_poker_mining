# 🎭 Mock Server - Teste do Planning Poker

Servidor fake em Node.js/Express para testar o frontend sem precisar implementar o backend Python.

## 🚀 Quickstart

### 1. Instalar dependências
```bash
npm install
```

### 2. Terminal 1 - Rodar Mock Server
```bash
npm run mock-server
```

Vai ver:
```
╔══════════════════════════════════════════════════════════╗
║         MOCK SERVER - Planning Poker v1.0                ║
╚══════════════════════════════════════════════════════════╝

🚀 Servidor rodando em: http://localhost:5000
```

### 3. Terminal 2 - Rodar Frontend
```bash
npm start
```

Vai abrir `http://localhost:4200`

### 4. Testar
- Abra em 2-3 browsers diferentes
- Cada um coloca um nome
- Experimente votação, revelação, reset

---

## 🔍 O que o Mock Server Faz

Simula 100% dos endpoints com dados fake realistas:

| Endpoint | Comportamento |
|----------|---------|
| GET `/api/state` | Retorna estado atual (sem cartas se not revealed) |
| POST `/api/join` | Adiciona jogador à sala |
| POST `/api/task` | Limpa votação e define nova task |
| POST `/api/vote` | Registra voto (falha se já revelado) |
| POST `/api/reveal` | Mostra as cartas de todos |
| POST `/api/reset` | Limpa votos, mantém task e players |

---

## 📊 Estado Inicial Fake

```
Task: TASK-001
Players:
  - Denis: votou (8) ✓
  - Ana: votou (5) ✓
  - Bruno: aguardando
```

---

## 🧪 Testar via curl

```bash
# Ver estado
curl http://localhost:5000/api/state

# Entrar
curl -X POST http://localhost:5000/api/join \
  -H "Content-Type: application/json" \
  -d '{"name":"Lia"}'

# Votar
curl -X POST http://localhost:5000/api/vote \
  -H "Content-Type: application/json" \
  -d '{"name":"Lia","card":"13"}'

# Revelar
curl -X POST http://localhost:5000/api/reveal \
  -H "Content-Type: application/json" \
  -d '{}'

# Resetar
curl -X POST http://localhost:5000/api/reset \
  -H "Content-Type: application/json" \
  -d '{}'

# Health check
curl http://localhost:5000/health
```

---

## ✍️ Customizar o Mock Server

Arquivo: `mock-server.js`

### Mudar porta
```javascript
const PORT = 5000;  // ← Mude para outro número
```

### Mudar dados iniciais
```javascript
const state = {
  taskId: 'TASK-001',    // ← Mude task inicial
  revealed: false,
  players: {
    'Denis': { voted: true, card: '8' },  // ← Adicione mais players
    'Ana': { voted: true, card: '5' }
  },
  updatedAt: new Date().toISOString()
};
```

### Adicionar mais endpoints
Copiar padrão existente:
```javascript
app.post('/api/seu-endpoint', (req, res) => {
  // seu código
  res.json({ ok: true });
});
```

---

## 🔗 Quando Passar para Backend Real

Quando tiver o backend Python pronto:

1. Parar mock-server (Ctrl+C)
2. Iniciar seu backend Python em `:5000`
3. Frontend continua funcionando igual (mesmos endpoints)

**Mágica:** Seu código do Angular não muda nada! 🎉

---

## 📝 Logs do Mock Server

Cada requisição é logada:
```
GET /api/state
POST /api/join - Denis
  → Denis entrou na sala
POST /api/vote - Ana votou: 13
  → Voto registrado
POST /api/reveal
  → Votos revelados: [{ name: 'Denis', card: '8' }, ...]
```

---

## 💡 Dicas de Teste

1. **Teste multi-user:**
   - Terminal 1: `npm run mock-server`
   - Terminal 2: `npm start`
   - Abra `http://localhost:4200` em 3 browsers (Chrome, Edge, Firefox)
   - Sincronização entre abas funciona via polling a cada 2s

2. **Teste responsividade:**
   - F12 → Toggle device toolbar
   - Testar em mobile, tablet, desktop

3. **Teste lógica de votação:**
   - Revelar quando nem todos votaram (deve funcionar)
   - Tentar votar após revelar (falha com erro 409)
   - Reset limpa votos mas mantém task

4. **Teste com Network throttling:**
   - F12 → Network tab →  "Slow 3G"
   - Ver como app se comporta com latência

---

## 🛑 Parar o Server

```bash
Ctrl+C
```

---

## 📚 Próximos Passos

1. ✅ Teste tudo com mock-server
2. ⏳ Implemente backend Python conforme `BACKEND_API.md`
3. ✅ Troque mock-server por seu backend (sem alterar frontend)
4. 🚀 Deploy produção

---

**Arquivo:** `mock-server.js`
**Script:** `npm run mock-server`
