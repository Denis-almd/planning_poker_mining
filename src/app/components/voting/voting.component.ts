import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokerService } from '../../services/poker.service';

@Component({
  selector: 'app-voting',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="voting-container">
      <div class="header">
        <h1>Planning Poker</h1>
        <div class="player-info">
          <span class="player-name">{{ pokerService.currentPlayer() }}</span>
        </div>
      </div>

      <div class="main-content">
        <!-- Task Section -->
        <div class="task-section">
          <div class="task-header">
            <h2>Task</h2>
            <div class="task-input-group">
              <input
                type="text"
                [(ngModel)]="newTaskId"
                placeholder="TASK-123 (ou deixe em branco)"
                class="task-input"
              />
              <button (click)="onSetTask()" class="btn-secondary">
                Definir Task
              </button>
            </div>
          </div>
          <div class="task-display">
            {{ pokerService.state().taskId || 'Nenhuma task em votação' }}
          </div>
        </div>

        <!-- Players Section -->
        <div class="players-section">
          <h2>Participantes</h2>
          <div class="players-grid">
            <div
              *ngFor="let player of getPlayersList()"
              class="player-card"
              [class.voted]="player.voted"
            >
              <div class="player-name">{{ player.name }}</div>
              <div class="vote-status">
                {{ player.voted ? 'VOTOU' : 'AGUARDANDO' }}
              </div>
              <div class="vote-card" *ngIf="pokerService.state().revealed && player.card">
                {{ player.card }}
              </div>
            </div>
          </div>
        </div>

        <!-- Voting Section -->
        <div class="voting-section">
          <h2>Seu Voto</h2>
          <div class="cards-grid">
            <button
              *ngFor="let card of cards"
              class="card"
              (click)="onVote(card)"
              [class.selected]="isCardSelected(card)"
            >
              {{ card }}
            </button>
          </div>
        </div>

        <!-- Actions Section -->
        <div class="actions-section">
          <button (click)="pokerService.reveal()" class="btn-primary">
            Revelar Votos
          </button>
          <button (click)="pokerService.reset()" class="btn-secondary">
            Nova Rodada
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .voting-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      color: white;
    }

    .header h1 {
      margin: 0;
      font-size: 2rem;
    }

    .player-info {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 5px;
    }

    .player-name {
      font-weight: bold;
      color: white;
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .task-section,
    .players-section,
    .voting-section,
    .actions-section {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    }

    .task-section {
      grid-column: 1 / -1;
    }

    .actions-section {
      grid-column: 1 / -1;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #333;
      border-bottom: 2px solid #667eea;
      padding-bottom: 0.5rem;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .task-header h2 {
      margin: 0;
      border: none;
      padding: 0;
    }

    .task-input-group {
      display: flex;
      gap: 0.5rem;
      flex: 1;
      margin-left: 2rem;
    }

    .task-input {
      flex: 1;
      padding: 0.5rem;
      border: 2px solid #ddd;
      border-radius: 5px;
      font-size: 0.9rem;
    }

    .task-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .task-display {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 5px;
      font-size: 1.2rem;
      font-weight: bold;
      color: #333;
      text-align: center;
      min-height: 2rem;
    }

    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
    }

    .player-card {
      background: #f5f5f5;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      transition: all 0.3s;
    }

    .player-card.voted {
      background: #e8f5e9;
      border-color: #4caf50;
    }

    .player-name {
      font-weight: bold;
      color: #333;
      margin-bottom: 0.5rem;
      word-break: break-word;
    }

    .vote-status {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .vote-card {
      margin-top: 0.5rem;
      background: #667eea;
      color: white;
      padding: 0.5rem;
      border-radius: 4px;
      font-weight: bold;
      font-size: 1.2rem;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 0.75rem;
    }

    .card {
      aspect-ratio: 1;
      border: 2px solid #ddd;
      background: white;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      font-size: 1.2rem;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card:hover {
      border-color: #667eea;
      box-shadow: 0 3px 10px rgba(102, 126, 234, 0.2);
    }

    .card.selected {
      background: #667eea;
      color: white;
      border-color: #667eea;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      opacity: 0.9;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
      border: 2px solid #ddd;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    @media (max-width: 768px) {
      .main-content {
        grid-template-columns: 1fr;
      }

      .actions-section {
        flex-direction: column;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
      }

      .task-header {
        flex-direction: column;
        gap: 1rem;
      }

      .task-input-group {
        flex-direction: column;
        margin-left: 0;
      }
    }
  `]
})
export class VotingComponent {
  cards = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];
  newTaskId = '';
  selectedCard: string | null = null;

  constructor(public pokerService: PokerService) {}

  async onVote(card: string) {
    this.selectedCard = card;
    await this.pokerService.castVote(card);
  }

  async onSetTask() {
    if (this.newTaskId.trim()) {
      await this.pokerService.setTask(this.newTaskId);
      this.newTaskId = '';
    }
  }

  isCardSelected(card: string): boolean {
    return this.selectedCard === card;
  }

  getPlayersList() {
    const state = this.pokerService.state();
    return Object.entries(state.players).map(([name, data]) => ({
      name,
      voted: data.voted,
      card: data.card
    }));
  }
}
