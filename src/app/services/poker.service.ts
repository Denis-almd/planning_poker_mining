import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PokerState {
	taskId: string;
	revealed: boolean;
	host: string;
	players: { [name: string]: { voted: boolean; card?: string } };
	updatedAt: string;
}

interface ApiResponse {
	ok?: boolean;
	error?: string;
	host?: string;
	isHost?: boolean;
}

@Injectable({
	providedIn: 'root'
})

export class PokerService {
	private readonly API_URL = 'https://denismt01.pythonanywhere.com/api';
	private readonly PLAYER_STORAGE_KEY = 'pokerPlayerName';

	state = signal<PokerState>({
		taskId: '',
		revealed: false,
		host: '',
		players: {},
		updatedAt: new Date().toISOString()
	});

	currentPlayer = signal<string | null>(null);
	isHost = signal<boolean>(false);
	pollInterval: any;

	constructor(private http: HttpClient) {}

	async initFromStorage(): Promise<void> {
		const savedPlayer = this.getSavedPlayerName();
		if (!savedPlayer) {
			return;
		}

		await this.setPlayer(savedPlayer);
	}

	getSavedPlayerName(): string {
		try {
			return localStorage.getItem(this.PLAYER_STORAGE_KEY) ?? '';
		} catch {
			return '';
		}
	}

	private savePlayerName(name: string): void {
		try {
			localStorage.setItem(this.PLAYER_STORAGE_KEY, name);
		} catch {
			// Ignora erro de storage para nao bloquear a experiencia.
		}
	}

	private clearSavedPlayerName(): void {
		try {
			localStorage.removeItem(this.PLAYER_STORAGE_KEY);
		} catch {
			// Ignora erro de storage para nao bloquear a experiencia.
		}
	}

	async setPlayer(name: string) {
		const normalizedName = name.trim();
		if (!normalizedName) {
			return;
		}

		this.currentPlayer.set(normalizedName);
		const hasJoined = await this.joinGame(normalizedName);
		if (!hasJoined) {
			this.currentPlayer.set(null);
			this.isHost.set(false);
			this.clearSavedPlayerName();
			return;
		}

		this.savePlayerName(normalizedName);
		this.startPolling();
	}

	private async joinGame(name: string): Promise<boolean> {
		try {
			const response = await firstValueFrom(
				this.http.post<ApiResponse>(`${this.API_URL}/join`, { name })
			);

			this.isHost.set(!!response.isHost);
			return true;
		} catch (error) {
			console.error('Erro ao entrar na sala:', error);
			return false;
		}
	}

	async leaveGame(): Promise<void> {
		const player = this.currentPlayer();
		if (!player) {
			return;
		}

		try {
			await firstValueFrom(
				this.http.post(`${this.API_URL}/leave`, { name: player })
			);
		} catch (error) {
			console.error('Erro ao sair da sala:', error);
		} finally {
			this.stopPolling();
			this.currentPlayer.set(null);
			this.isHost.set(false);
			this.clearSavedPlayerName();
			this.state.set({
				taskId: '',
				revealed: false,
				host: '',
				players: {},
				updatedAt: new Date().toISOString()
			});
		}
	}

	async getState(): Promise<PokerState | undefined> {
		try {
			const response = await firstValueFrom(
				this.http.get<PokerState>(`${this.API_URL}/state`)
			);

			this.state.set(response);
			this.isHost.set(response.host === this.currentPlayer());
			return response;
		} catch (error) {
			console.error('Erro ao obter estado:', error);
			return undefined;
		}
	}

	async transferHost(newHost: string): Promise<void> {
		const player = this.currentPlayer();

		if (!player) {
			return;
		}

		try {
			await firstValueFrom(
				this.http.post(`${this.API_URL}/set-host`, { name: player, newHost })
			);

			await this.getState();
		} catch (error: any) {
			if (error.status === 403) {
				console.error('Erro: Apenas o Scrum Master atual pode transferir a facilitação');
				alert('❌ Apenas o Scrum Master atual pode transferir a facilitação');
			} else {
				console.error('Erro ao transferir host:', error);
			}
		}
	}

	async castVote(card: string): Promise<void> {
		const player = this.currentPlayer();

		if (!player) {
			return;
		}

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
		const player = this.currentPlayer();

		if (!player) {
			return;
		}

		try {
			await firstValueFrom(
				this.http.post(`${this.API_URL}/reveal`, { name: player })
			);

			await this.getState();
		} catch (error: any) {
			if (error.status === 403) {
				console.error('Erro: Apenas o Scrum Master pode revelar votos');
				alert('❌ Apenas o Scrum Master pode revelar votos');
			} else {
				console.error('Erro ao revelar votos:', error);
			}
		}
	}

	async reset(): Promise<void> {
		const player = this.currentPlayer();

		if (!player) {
			return;
		}

		try {
			await firstValueFrom(
				this.http.post(`${this.API_URL}/reset`, { name: player })
			);

			await this.getState();
		} catch (error: any) {
			if (error.status === 403) {
				console.error('Erro: Apenas o Scrum Master pode resetar a rodada');
				alert('❌ Apenas o Scrum Master pode resetar a rodada');
			} else {
				console.error('Erro ao resetar rodada:', error);
			}
		}
	}

	startPolling(): void {
		this.stopPolling();
		this.getState();
		this.pollInterval = setInterval(() => {
			this.getState();
		}, 2000);
	}

	stopPolling(): void {
		if (this.pollInterval) {
			clearInterval(this.pollInterval);
			this.pollInterval = null;
		}
	}
}