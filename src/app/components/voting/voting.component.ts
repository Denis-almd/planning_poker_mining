import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokerService } from '../../services/poker.service';

@Component({
  selector: 'app-voting',
  imports: [CommonModule, FormsModule],
  templateUrl: './voting.component.html',
  styleUrl: './voting.component.css'
})
export class VotingComponent {
  cards = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];
  newTaskId = '';
  newHost = '';
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

  async onTransferHost() {
    if (!this.newHost) {
      return;
    }

    await this.pokerService.transferHost(this.newHost);
    this.newHost = '';
  }

  async onLogout() {
    if (confirm('Tem certeza que deseja sair da sala?')) {
      await this.pokerService.leaveGame();
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
