# API de Planning Poker - Especificação Python Backend

Este documento descreve os endpoints que o backend Python (FastAPI, Flask, etc) deve implementar para funcionar com o frontend Angular.

## Configuração Necessária

- **Port**: 5000 (pode ser alterado, fazer ajuste em `poker.service.ts` - constante `API_URL`)
- **CORS**: Permitir requisições de `http://localhost:4200` (desenvolvimento)
- **Content-Type**: application/json

### Exemplo de configuração CORS (FastAPI):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "https://seu-frontend.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Endpoints

### 1. **GET /api/state**
Retorna o estado atual da votação.

**Request:**
```
GET /api/state
```

**Response (200):**
```json
{
  "taskId": "TASK-123",
  "revealed": false,
  "players": {
    "Denis": {
      "voted": true,
      "card": null
    },
    "Ana": {
      "voted": false,
      "card": null
    }
  },
  "updatedAt": "2026-03-23T10:30:00Z"
}
```

**Notas:**
- Se `revealed == false`: não incluir `card` nas respostas (ou enviar `null`)
- Se `revealed == true`: incluir `card` de cada jogador
- `voted`: true se o jogador já votou nessa rodada

---

### 2. **POST /api/join**
Adiciona um novo jogador à sala.

**Request:**
```json
{
  "name": "Denis"
}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Jogador entrou na sala"
}
```

**Comportamento:**
- Se o jogador já existe, apenas atualiza o status como conectado
- Inicializa com `voted: false`

---

### 3. **POST /api/task**
Define uma nova task para votação. Reseta a rodada anterior.

**Request:**
```json
{
  "taskId": "TASK-456"
}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Task definida"
}
```

**Comportamento:**
- Limpa todos os votos anteriores
- Define `revealed: false`
- Mantém lista de jogadores

---

### 4. **POST /api/vote**
Registra o voto de um jogador.

**Request:**
```json
{
  "name": "Denis",
  "card": "8"
}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Voto registrado"
}
```

**Response (409):**
```json
{
  "error": "Rodada já foi revelada. Aguarde a próxima rodada."
}
```

**Comportamento:**
- Se a rodada já foi revelada, retornar erro 409
- Se o jogador não existe, pode criar automaticamente (ou retornar 400)
- Aceita strings: '0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'
- Um voto por jogador por rodada (sobrescreve o anterior se votar novamente)

---

### 5. **POST /api/reveal**
Revela todos os votos da rodada atual.

**Request:**
```json
{}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Votos revelados"
}
```

**Comportamento:**
- Muda `revealed` para `true`
- A partir disso, o GET /state retorna o `card` de cada jogador
- POST /vote começa a retornar erro 409

---

### 6. **POST /api/reset**
Limpa a rodada atual mantendo a task. Prepara para próxima votação.

**Request:**
```json
{}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Rodada resetada"
}
```

**Comportamento:**
- Remove todos os votos
- Muda `revealed` para `false`
- Mantém `taskId` e lista de jogadores

---

## Modelo de Dados

### Estado Global
```python
{
  "taskId": str,           # ID da task atual
  "revealed": bool,        # Se os votos foram revelados
  "players": {
    "{name}": {
      "voted": bool,       # Se votou nessa rodada
      "card": str | null   # Voto (null se não revelado ou não votou)
    }
  },
  "updatedAt": str         # ISO timestamp
}
```

---

## Fluxo de Uso

1. **Usuário entra:** POST /api/join
2. **Frontend faz polling:** GET /api/state a cada 2s
3. **Scrum Master define task:** POST /api/task
4. **Cada um vota:** POST /api/vote
5. **Scrum Master revela:** POST /api/reveal
6. **Scrum Master reseta:** POST /api/reset → volta ao passo 3

---

## Dicas de Implementação

### FastAPI (recomendado)
```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
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
```

### Flask
```python
from flask import Flask, jsonify, request
from datetime import datetime

app = Flask(__name__)
state = {
    "taskId": "",
    "revealed": False,
    "players": {},
    "updatedAt": datetime.now().isoformat()
}

@app.route('/api/state', methods=['GET'])
def get_state():
    return jsonify(state)
```

---

## Notas sobre Concorrência

- Para uso com 6 pessoas em HTTP polling (2s), estado em memória é suficiente
- Se múltiplos servidores/processos: considerar usar Redis
- Sem persistência: dados são perdidos ao reiniciar servidor (ok para dev)

---

## Testando a API

### Com curl (exemplo):
```bash
# Entrar
curl -X POST http://localhost:5000/api/join \
  -H "Content-Type: application/json" \
  -d '{"name":"Denis"}'

# Definir task
curl -X POST http://localhost:5000/api/task \
  -H "Content-Type: application/json" \
  -d '{"taskId":"TASK-123"}'

# Votar
curl -X POST http://localhost:5000/api/vote \
  -H "Content-Type: application/json" \
  -d '{"name":"Denis","card":"8"}'

# Ver estado
curl http://localhost:5000/api/state

# Revelar
curl -X POST http://localhost:5000/api/reveal \
  -H "Content-Type: application/json" \
  -d '{}'

# Resetar
curl -X POST http://localhost:5000/api/reset \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

Qualquer dúvida sobre os endpoints, avise!
