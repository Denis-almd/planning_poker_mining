import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntryComponent } from './components/entry/entry.component';
import { VotingComponent } from './components/voting/voting.component';
import { PokerService } from './services/poker.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, EntryComponent, VotingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public pokerService: PokerService) {
    void this.pokerService.initFromStorage();

    effect(() => {
      if (this.pokerService.currentPlayer() === null) {
        this.pokerService.stopPolling();
      }
    });
  }
}

