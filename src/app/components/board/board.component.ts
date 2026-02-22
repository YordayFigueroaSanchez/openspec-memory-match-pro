import { Component, computed, inject } from '@angular/core';
import { GameService } from '../../services/game.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CardComponent],
  template: `
    <div class="flex flex-col items-center gap-4 p-6">
      <!-- Controles -->
      <div class="flex gap-3">
        <button
          class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
          (click)="gameService.initGame(8)"
        >
          New Game
        </button>
        <button
          class="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 font-medium"
          (click)="gameService.resetGame()"
        >
          Reset
        </button>
      </div>

      <!-- Contadores -->
      <div class="flex gap-6 text-lg font-semibold text-slate-700">
        <span>Moves: {{ gameService.moves() }}</span>
        <span>Time: {{ formattedTime() }}</span>
      </div>

      <!-- Tablero -->
      <div class="grid grid-cols-4 gap-3">
        @for (card of gameService.cards(); track card.id) {
          <app-card [card]="card" (flip)="onCardFlip($event)" />
        }
      </div>

      <!-- Victoria -->
      @if (gameService.isVictory()) {
        <div class="mt-4 p-4 bg-emerald-100 text-emerald-800 rounded-lg text-xl font-bold">
          🎉 ¡Victoria! Completaste el juego en {{ gameService.moves() }} movimientos.
        </div>
      }
    </div>
  `,
})
export class BoardComponent {
  readonly gameService = inject(GameService);

  /** Formatea elapsedTime (segundos) a formato MM:SS */
  readonly formattedTime = computed(() => {
    const total = this.gameService.elapsedTime();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  onCardFlip(cardId: string): void {
    this.gameService.flipCard(cardId);
  }
}
