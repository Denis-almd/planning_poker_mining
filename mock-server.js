// Mock Server para testar Planning Poker Frontend
// Simula os 6 endpoints da API
// Use: node mock-server.js

const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Estado fake em memória
const state = {
  taskId: '',
  revealed: false,
  players: {},
  host: null,  // Primeiro a entrar é o host (pode revelar/resetar)
  updatedAt: new Date().toISOString()
};

// GET /api/state
app.get('/api/state', (req, res) => {
  console.log('GET /api/state');
  
  // Se não revelou, não retorna as cartas
  const response = {
    taskId: state.taskId,
    revealed: state.revealed,
    players: {},
    updatedAt: new Date().toISOString()
  };

  Object.entries(state.players).forEach(([name, player]) => {
    response.players[name] = {
      voted: player.voted,
      card: state.revealed ? player.card : null
    };
  });

  res.json(response);
});

// POST /api/join
app.post('/api/join', (req, res) => {
  const { name } = req.body;
  console.log(`POST /api/join - ${name}`);

  if (!name) {
    return res.status(400).json({ error: 'Nome obrigatório' });
  }

  if (!state.players[name]) {
    state.players[name] = { voted: false, card: null };
    // Primeiro a entrar é o host
    if (!state.host) {
      state.host = name;
      console.log(`  → ${name} entrou na sala (HOST)`);
    } else {
      console.log(`  → ${name} entrou na sala`);
    }
  }

  res.json({ ok: true, message: `${name} entrou na sala`, isHost: state.host === name });
});

// POST /api/task
app.post('/api/task', (req, res) => {
  const { taskId } = req.body;
  console.log(`POST /api/task - ${taskId}`);

  if (!taskId) {
    return res.status(400).json({ error: 'taskId obrigatório' });
  }

  state.taskId = taskId;
  state.revealed = false;

  // Limpa votos
  Object.keys(state.players).forEach(name => {
    state.players[name] = { voted: false, card: null };
  });

  console.log(`  → Task definida: ${taskId}`);
  res.json({ ok: true, message: `Task ${taskId} definida` });
});

// POST /api/vote
app.post('/api/vote', (req, res) => {
  const { name, card } = req.body;
  console.log(`POST /api/vote - ${name} votou: ${card}`);

  if (!name || !card) {
    return res.status(400).json({ error: 'name e card obrigatórios' });
  }

  if (state.revealed) {
    return res.status(409).json({ error: 'Rodada já revelada' });
  }

  if (!state.players[name]) {
    state.players[name] = { voted: false, card: null };
  }

  state.players[name].voted = true;
  state.players[name].card = card;

  console.log(`  → ✓ ${name} votou em ${card}`);
  res.json({ ok: true, message: `Voto registrado: ${card}` });
});

// POST /api/reveal
app.post('/api/reveal', (req, res) => {
  const { name } = req.body;
  console.log(`POST /api/reveal - tentativa de ${name}`);

  // Só o host pode revelar
  if (name !== state.host) {
    console.log(`  → ❌ ${name} não é host (host é ${state.host})`);
    return res.status(403).json({ 
      error: 'Apenas o Scrum Master pode revelar votos',
      host: state.host 
    });
  }

  state.revealed = true;
  state.updatedAt = new Date().toISOString();

  const votes = Object.entries(state.players).map(([playerName, player]) => ({
    name: playerName,
    card: player.card
  }));

  console.log(`  → ✓ Votos revelados`);
  res.json({ ok: true, message: 'Votos revelados', votes });
});

// POST /api/reset
app.post('/api/reset', (req, res) => {
  const { name } = req.body;
  console.log(`POST /api/reset - tentativa de ${name}`);

  // Só o host pode resetar
  if (name !== state.host) {
    console.log(`  → ❌ ${name} não é host (host é ${state.host})`);
    return res.status(403).json({ 
      error: 'Apenas o Scrum Master pode resetar a rodada',
      host: state.host 
    });
  }

  state.revealed = false;

  // Limpa votos mas mantém players e task
  Object.keys(state.players).forEach(playerName => {
    state.players[playerName] = { voted: false, card: null };
  });

  console.log(`  → ✓ Rodada resetada`);
  res.json({ ok: true, message: 'Rodada resetada' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║         MOCK SERVER - Planning Poker v1.0                ║
╚══════════════════════════════════════════════════════════╝

🚀 Servidor rodando em: http://localhost:${PORT}

Endpoints disponíveis:
  GET  /api/state        - Obter estado atual
  POST /api/join         - Entrar na sala
  POST /api/task         - Definir task
  POST /api/vote         - Registrar voto
  POST /api/reveal       - Revelar votos
  POST /api/reset        - Resetar rodada
  GET  /health           - Health check

Status incial:
  - Task: ${state.taskId}
  - Participantes: ${Object.keys(state.players).join(', ')}
  - Votos revelados: ${state.revealed}

💡 Dica: Abra http://localhost:4200 em outro terminal com "npm start"

Pressione Ctrl+C para parar o servidor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
