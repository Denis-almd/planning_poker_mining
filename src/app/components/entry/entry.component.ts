import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PokerService } from '../../services/poker.service';

@Component({
  selector: 'app-entry',
  imports: [FormsModule],
  template: `
    <div class="entry-container">
      <div class="entry-card">
        <h1>Planning Poker</h1>
        <p class="subtitle">Entre com seu nome para começar</p>
        
        <form (ngSubmit)="onEnter()">
          <input
            type="text"
            [(ngModel)]="playerName"
            name="playerName"
            placeholder="Seu nome"
            class="input-field"
            (keyup.enter)="onEnter()"
          />
          <button 
            type="submit" 
            [disabled]="!playerName.trim()"
            class="btn-primary"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .entry-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .entry-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      text-align: center;
      width: 100%;
      max-width: 400px;
    }

    h1 {
      color: #333;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .subtitle {
      color: #666;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .input-field {
      padding: 0.75rem;
      border: 2px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .input-field:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-primary {
      padding: 0.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.3s;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary:not(:disabled):hover {
      opacity: 0.9;
    }
  `]
})
export class EntryComponent {
  playerName = '';

  constructor(private pokerService: PokerService) {}

  async onEnter() {
    if (!this.playerName.trim()) return;
    await this.pokerService.setPlayer(this.playerName);
  }
}
