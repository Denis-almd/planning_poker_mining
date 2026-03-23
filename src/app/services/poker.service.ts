import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface PokerState {
  taskId: string;
  revealed: boolean;
  players: { [name: string]: { voted: boolean; card?: string } };
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PokerService {
  private readonly API_URL = 'http://localhost:5000/api';
  
  state = signal<PokerState>({
    taskId: '',
    revealed: false,
    players: {},
    updatedAt: new Date().toISOString()
  });
  
  currentPlayer = signal<string | null>(null);
  pollInterval: any;

  constructor(private http: HttpClient) {}

  async setPlayer(name: string) {
    this.currentPlayer.set(name);
    await this.joinGame(name);
    this.startPolling();
  }

  private async joinGame(name: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.API_URL}/join`, { name })
      );
      return;
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
    }
  }

  async getState(): Promise<PokerState | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<PokerState>(`${this.API_URL}/state`)
      );
      this.state.set(response);
      return response;
    } catch (error) {
      console.error('Erro ao obter estado:', error);
      return undefined;
    }
  }

  async castVote(card: string): Promise<void> {
    const player = this.currentPlayer();
    if (!player) return;

    try {
      await firstValueFrom(
        this.http.post(`${this.API_URL}/vote`, { name: player, card })
      );
      await this.getState();
    } catch (error) {
      console.error('Erro ao enviar voto:', error);
    }
  }

  async setTask(taskId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_URL}/task`, { taskId })
      );
      await this.getState();
    } catch (error) {
      console.error('Erro ao definir task:', error);
    }
  }

  async reveal(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_URL}/reveal`, {})
      );
      await this.getState();
    } catch (error) {
      console.error('Erro ao revelar votos:', error);
    }
  }

  async reset(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_URL}/reset`, {})
      );
      await this.getState();
    } catch (error) {
      console.error('Erro ao resetar rodada:', error);
    }
  }

  startPolling() {
    this.getState();
    this.pollInterval = setInterval(() => {
      this.getState();
    }, 2000);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }
}
