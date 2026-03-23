# 📋 Planning Poker - Implementação Completa Angular (Frontend)

## ✅ O que foi feito

### Arquivos Criados

#### **1. Serviço de Comunicação HTTP**
- **Arquivo:** `src/app/services/poker.service.ts`
- **Responsabilidade:** Fazer chamadas HTTP para o backend Python
- **Funcionalidades:**
  - GET `/api/state` - Polling automático a cada 2s
  - POST `/api/join` - Entrar na sala
  - POST `/api/task` - Definir task
  - POST `/api/vote` - Registrar voto
  - POST `/api/reveal` - Revelar votos
  - POST `/api/reset` - Limpar rodada
- **Tecnologia:** RxJS + HttpClient

#### **2. Componente de Entrada**
- **Arquivo:** `src/app/components/entry/entry.component.ts`
- **Responsabilidade:** Tela inicial para entrar com nome
- **Funcionalidades:**
  - Campo de texto para nome
  - Validação (não permite vazio)
  - Layout responsivo e moderno
  - Gradiente visual (roxo/azul)

#### **3. Componente de Votação**
- **Arquivo:** `src/app/components/voting/voting.component.ts`
- **Responsabilidade:** Tela principal de votação
- **Funcionalidades:**
  - Exibição dinâmica de participantes
  - Baralho de cartas: 0, 1, 2, 3, 5, 8, 13, 21, ?, ☕
  - Campo para definir task nova
  - Botões para revelar e resetar
  - Atualização automática via polling (2s)
  - Mostra nome do player e status (VOTOU / AGUARDANDO)
  - Após revelar, mostra cartas de cada um
  - Totalmente responsivo (mobile, tablet, desktop)

#### **4. Documentação da API**
- **Arquivo:** `BACKEND_API.md`
- **Conteúdo:**
  - Especificação completa de 6 endpoints REST
  - Exemplos de request/response JSON
  - Regras de negócio (voto secreto, revelação, reset)
  - Configuração CORS necessária
  - Exemplos com `curl`
  - Dicas para FastAPI e Flask
  - Modelo de dados esperado

#### **5. README Atualizado**
- **Arquivo:** `README.md`
- **Conteúdo:**
  - Instruções quickstart
  - Setup completo (frontend e backend)
  - Exemplo mínimo de backend FastAPI
  - Fluxo de uso passo-a-passo
  - Estrutura do projeto
  - Instruções de deployment
  - Próximos passos

### Arquivos Modificados

#### **app.config.ts**
- Adicionado `provideHttpClient()` para ativar HttpClient

#### **app.ts** (Main Component)
- Lógica de roteamento simples: mostra Entry ou Voting dependendo de `currentPlayer`
- Usa control flow moderno do Angular 21 (`@if` / `@else`)

#### **app.css**
- Estilos globais básicos

---

## 🏗️ Arquitetura Frontend

```
Entry Component                    Voting Component
    ↓                                   ↓
    └─→ PokerService (HTTP) ←──────────┘
            ↓
        Backend Python
    (http://localhost:5000)
```

**Fluxo de dados:**
1. Usuário entra → `setPlayer()` → `joinGame()` 
2. Serviço começa polling de `getState()` a cada 2s
3. Estado atualiza via signals (`state`, `currentPlayer`)
4. Components renderizam automaticamente
5. Usuário vota → `castVote()` → Backend
6. Backend valida e sincroniza com outros usuários
7. Próximo GET `/api/state` traz estado atualizado

---

## 🚀 Como Rodar Agora

### Frontend
```bash
cd c:\Users\denis.almeida\Desktop\Projetos\planning_poker_mining

npm start
# Acessar http://localhost:4200
# Ou usar porta diferente se 4200 estiver ocupada:
# npm start -- --port 4201
```

### Backend (Você implementa em Python)
Seguir instruções em `BACKEND_API.md`:

**Opção 1: FastAPI (recomendado)**
```bash
pip install fastapi uvicorn
python main.py  # Copiar código exemplo do README
```

**Opção 2: Flask**
```bash
pip install flask flask-cors
python app.py   # Implementar endpoints Flask
```

---

## 📋 O que Você Precisa Fazer

### 1. **Implementar o Backend Python** ⚠️
- [ ] Criar arquivo `main.py` (ou estrutura que preferir)
- [ ] Implementar 6 endpoints REST conforme `BACKEND_API.md`
- [ ] Usar FastAPI, Flask, ou outra framework
- [ ] Estado em memória é suficiente para MVP
- [ ] Testar com `curl` antes de conectar ao frontend

### 2. **Testar Integração**
- [ ] Backend rodando em `http://localhost:5000`
- [ ] Frontend rodando em `http://localhost:4200`
- [ ] Abrir 2-3 browsers diferentes (simular múltiplos usuários)
- [ ] Testar fluxo completo: entrar → definir task → votar → revelar

### 3. **Deployment** (opcional por enquanto)
- [ ] Frontend: enviar para GitHub Pages
- [ ] Backend: enviar para Render, Railway ou seu servidor
- [ ] Ajustar `API_URL` em `poker.service.ts` para URL pública

---

## 🎯 Tecnologias Usadas

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Angular | 21.2.0 | Framework frontend |
| TypeScript | 5.9.2 | Linguagem |
| RxJS | 7.8.0 | Async/Observables |
| HttpClient | 21.2.0 | Chamadas HTTP |
| Signals | Nativa | Reatividade |
| CSS3 | - | Estilo (gradientes, grid, flexbox) |

---

## 📁 Estrutura de Arquivos (Nova)

```
src/app/
├── components/
│   ├── entry/
│   │   └── entry.component.ts      (Nova) 220 linhas
│   └── voting/
│       └── voting.component.ts     (Nova) 310 linhas
├── services/
│   └── poker.service.ts            (Nova) 120 linhas
├── app.ts                          (Modificado)
├── app.config.ts                   (Modificado)
├── app.css                         (Modificado)
└── app.html                        (Intocado, não está sendo usado)

root/
├── BACKEND_API.md                  (Nova) Especificação 300+ linhas
└── README.md                       (Modificado) Guia completo
```

---

## 🔄 Fluxo de Votação (Vista do Usuário)

```
1. Abre http://localhost:4200
   ↓
2. Vê tela roxa "Planning Poker" com campo de nome
   ↓
3. Digita nome (ex: "Denis") e clica "Entrar"
   ↓
4. Vê tela de votação com:
   - Header: "Planning Poker" + nome dele
   - Seção Task: campo para scrum master definir
   - Seção Participantes: lista dinâmica
   - Seção Votos: baralho de cartas
   - Botões: Revelar Votos, Nova Rodada
   ↓
5. Clica em uma carta (ex: "8")
   ↓
6. Vê indicador "VOTOU" ao lado do seu nome
   ↓
7. Quando todos votarem, scrum master clica "Revelar Votos"
   ↓
8. Aparece as cartas de cada participante
   ↓
9. Clica "Nova Rodada" para limpar
   ↓
10. Volta ao passo 4 com nova task
```

---

## ⚙️ Configuração de Desenvolvimento

### Host/Port do Backend
Atualmente configurado para: `http://localhost:5000/api`

Se quiser alterar:
**Arquivo:** `src/app/services/poker.service.ts`
**Linha:** `private readonly API_URL = 'http://localhost:5000/api';`

Exemplo pra usar outro servidor:
```typescript
// Para produção:
private readonly API_URL = 'https://seu-backend.herokuapp.com/api';
```

### Intervalo de Polling
Atualmente: **2 segundos**

Se quiser alterar:
**Arquivo:** `src/app/services/poker.service.ts`
**Método:** `startPolling()`
Trocar `2000` para outro valor em ms.

---

## 🧪 Testando sem Backend

Se quiser testar o frontend antes de ter backend pronto:

Editar `poker.service.ts` temporariamente para mock:
```typescript
async getState(): Promise<PokerState | undefined> {
  // Mock para testes
  this.state.set({
    taskId: 'TASK-123',
    revealed: false,
    players: {
      'Denis': { voted: true, card: null },
      'Ana': { voted: false, card: null }
    },
    updatedAt: new Date().toISOString()
  });
  return this.state();
}
```

---

## 📝 Notas Importantes

1. **Signals:** Projeto usa `signal()` do Angular 21 (reatividade moderna)
   - Estado atualiza automaticamente na view
   - Sem necessidade de `@Input()`, `@Output()`, `Observable`

2. **Polling vs WebSocket:**
   - Implementado com HTTP polling (simples, funciona em qualquer rede)
   - No futuro pode migrar para WebSocket (melhor em tempo real)
   - Buffer de polling recomendado: 2-5 segundos

3. **CORS:**
   - Frontend em `localhost:4200`
   - Backend deve aceitar CORS desse origin
   - Em produção, ajustar para domínio real

4. **Erros HTTP:**
   - Try/catch em todos os métodos do serviço
   - Erros logados no console
   - Frontend não quebra se backend tiver problema

---

## 🆘 Troubleshooting Comum

### "Port 4200 is already in use"
```bash
# Usar porta diferente:
npm start -- --port 4201
# Ou matar processo na 4200:
netstat -ano | findstr :4200
taskkill /PID {PID} /F
```

### "Cannot GET /api/state"
- Backend não está rodando
- Verificar se está em `http://localhost:5000`
- Testar com `curl http://localhost:5000/api/state`

### "CORS error"
- Backend não tem CORS habilitado
- Ver exemplo em `BACKEND_API.md`

### Estatista está em branco
- Polling pode não estar pegando nada
- Check console (F12) para erros
- Verificar se backend retorna estrutura correta

---

## 📚 Referências

- [Angular 21 Docs](https://angular.dev)
- [Signals](https://angular.dev/guide/signals)
- [HTTP Client](https://angular.dev/guide/http)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [CORS Middleware](https://fastapi.tiangolo.com/tutorial/cors/)

---

**Status:** ✅ Frontend 100% pronto. Aguardando backend Python.

Próximo passo: Implementar os 6 endpoints em Python conforme `BACKEND_API.md`.
