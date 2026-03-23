# Planning Poker Mining

Aplicação de Planning Poker para estimar tarefas com seu time via HTTP polling com backend Python.

**Tecnologias:** Angular 21, Python (FastAPI/Flask), REST API, HTTP Polling

## Quickstart

### Frontend
```bash
npm install
npm start
```
Abra `http://localhost:4200` em vários navegadores/dispositivos.

### Backend
Veja [BACKEND_API.md](./BACKEND_API.md) para implementar em Python. 

Exemplo com FastAPI (veja README completo abaixo para esquema mínimo):
```bash
pip install fastapi uvicorn
python main.py  # Seu backend rodando em http://localhost:5000
```

---

## Detalhes Completos

### Setup Frontend

```bash
# Instalar dependências
npm install

# Desenvolvimento com hot-reload
npm start  # Acessar http://localhost:4200

# Build produção
npm run build
# Output: dist/planning_poker_mining/
```

### Setup Backend

Veja especificação completa em [BACKEND_API.md](./BACKEND_API.md).

**Exemplo mínimo com FastAPI:**

Arquivo: `main.py` (na raiz ou subdiretório)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Estado em memória
state = {
    "taskId": "",
    "revealed": False,
    "players": {},
    "updatedAt": datetime.now().isoformat()
}

class JoinRequest(BaseModel):
    name: str

class VoteRequest(BaseModel):
    name: str
    card: str

class TaskRequest(BaseModel):
    taskId: str

@app.get("/api/state")
def get_state():
    return state

@app.post("/api/join")
def join(request: JoinRequest):
    if request.name not in state["players"]:
        state["players"][request.name] = {"voted": False, "card": None}
    state["updatedAt"] = datetime.now().isoformat()
    return {"ok": True}

@app.post("/api/task")
def set_task(request: TaskRequest):
    state["taskId"] = request.taskId
    state["revealed"] = False
    for name in state["players"]:
        state["players"][name] = {"voted": False, "card": None}
    state["updatedAt"] = datetime.now().isoformat()
    return {"ok": True}

@app.post("/api/vote")
def cast_vote(request: VoteRequest):
    if state["revealed"]:
        return {"error": "Já revelado"}, 409
    if request.name not in state["players"]:
        state["players"][request.name] = {"voted": False, "card": None}
    state["players"][request.name]["voted"] = True
    state["players"][request.name]["card"] = request.card
    state["updatedAt"] = datetime.now().isoformat()
    return {"ok": True}

@app.post("/api/reveal")
def reveal():
    state["revealed"] = True
    state["updatedAt"] = datetime.now().isoformat()
    return {"ok": True}

@app.post("/api/reset")
def reset():
    state["revealed"] = False
    for name in state["players"]:
        state["players"][name]["voted"] = False
        state["players"][name]["card"] = None
    state["updatedAt"] = datetime.now().isoformat()
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
```

Rodar:
```bash
pip install fastapi uvicorn
python main.py
```

Backend roda em `http://localhost:5000`

### Fluxo de Uso

1. **Terminal 1:** `npm start` (frontend)
2. **Terminal 2:** `python main.py` (backend)
3. Abrir `http://localhost:4200` em vários browsers
4. Cada pessoa coloca seu nome
5. Scrum Master define a task
6. Todos votam
7. Reveal → placar aparece
8. Reset → próxima rodada

### Estrutura

```
src/app/
├── components/
│   ├── entry/          # Tela de entrada (nome)
│   └── voting/         # Tela de votação
├── services/
│   └── poker.service.ts    # Chamadas HTTP (GET /api/state a cada 2s)
├── app.ts              # Root component (mostra entry ou voting)
└── app.config.ts       # Config (HttpClient, router)
```

### Deployment Produção

**Frontend (GitHub Pages):**
```bash
npm run build
# Push dist/planning_poker_mining para branch gh-pages
```

**Backend (Render/Railway):**
- Criar repositório com main.py
- Deploy automático
- Ajustar URL em `poker.service.ts` para URL pública

### Customizações Futuras

- [ ] Banco de dados (histórico de rodadas)
- [ ] Autenticação
- [ ] WebSocket (sem polling)
- [ ] Integração Jira
- [ ] Estatísticas (velocidade do time)

---

## Próximos Passos

1. **Implementar backend** em Python (FastAPI/Flask)
   - Usar [BACKEND_API.md](./BACKEND_API.md) como guia
   - Testar com `curl` antes de conectar frontend
   
2. **Testar integração**
   - Backend rodando em `:5000`
   - Frontend em `:4200`
   - Abrir dois browsers e testar fluxo

3. **Deploy** quando pronto

---

**Arquivos importantes:**
- [BACKEND_API.md](./BACKEND_API.md) → Especificação dos endpoints Python
- `src/app/services/poker.service.ts` → Like HTTP com backend
