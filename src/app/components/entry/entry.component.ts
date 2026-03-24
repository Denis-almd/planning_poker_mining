import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PokerService } from '../../services/poker.service';

@Component({
  selector: 'app-entry',
  imports: [FormsModule],
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.css'
})
export class EntryComponent {
  playerName = '';

  constructor(private pokerService: PokerService) {}

  async onEnter() {
    if (!this.playerName.trim()) return;
    await this.pokerService.setPlayer(this.playerName);
  }
}
