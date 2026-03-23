import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntryComponent } from './components/entry/entry.component';
import { VotingComponent } from './components/voting/voting.component';
import { PokerService } from './services/poker.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, EntryComponent, VotingComponent],
  template: `
    @if (pokerService.currentPlayer() === null) {
      <app-entry></app-entry>
    } @else {
      <app-voting></app-voting>
    }
  `,
  styleUrl: './app.css'
})
export class App {
  constructor(public pokerService: PokerService) {
    effect(() => {
      if (this.pokerService.currentPlayer() === null) {
        this.pokerService.stopPolling();
      }
    });
  }
}

