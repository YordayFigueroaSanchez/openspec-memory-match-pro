import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Card, GameState } from '../models';
import { generateCards } from '../utils';

/** Milisegundos que se muestran las cartas no coincidentes antes de voltearlas. */
const FLIP_DELAY = 1000;

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly destroyRef = inject(DestroyRef);

  // ─── Señales Primarias ─────────────────────────

  /** Array inmutable que representa el estado actual de todas las cartas. */
  readonly cards = signal<Card[]>([]);

  /** IDs de las cartas volteadas en el turno actual (0, 1 o 2 elementos). */
  readonly flippedIds = signal<string[]>([]);

  /** Cantidad de pares intentados por el jugador. */
  readonly moves = signal<number>(0);

  /** Estado global de la partida. */
  readonly gameState = signal<GameState>('idle');

  /** Timestamp (Date.now()) del momento en que se volteó la primera carta. */
  readonly startTime = signal<number | null>(null);

  /** Segundos transcurridos desde el inicio de la partida. */
  readonly elapsedTime = signal<number>(0);

  // ─── Campos privados ──────────────────────────

  private timerRef: ReturnType<typeof setInterval> | null = null;
  private currentPairs = 0;

  // ─── Señales Derivadas ─────────────────────────

  /** Número de cartas que ya fueron emparejadas. */
  readonly matchedCount = computed(() => this.cards().filter(c => c.matched).length);

  /** true cuando hay 2 cartas volteadas pendientes de validación → tablero bloqueado. */
  readonly isLocked = computed(() => this.flippedIds().length === 2);

  /** true cuando todas las cartas han sido emparejadas. */
  readonly isVictory = computed(() => this.cards().length > 0 && this.matchedCount() === this.cards().length);

  constructor() {
    this.destroyRef.onDestroy(() => this.stopTimer());
  }

  // ─── Métodos Públicos ──────────────────────────

  /**
   * Inicializa (o re-inicializa) el tablero.
   * Genera pares de cartas, baraja con Fisher-Yates y resetea el estado.
   */
  initGame(pairs: number): void {
    this.currentPairs = pairs;
    const generatedCards = generateCards(pairs);
    this.cards.set(generatedCards);
    this.flippedIds.set([]);
    this.moves.set(0);
    this.elapsedTime.set(0);
    this.gameState.set('idle');
    this.startTime.set(null);
    this.stopTimer();
  }

  /**
   * Voltea una carta.
   * Gestiona guards, transición idle→playing, y dispara evaluateMatch cuando hay 2.
   */
  flipCard(cardId: string): void {
    // Guard: tablero bloqueado (2 cartas ya volteadas)
    if (this.isLocked()) return;

    // Guard: carta ya volteada o ya emparejada
    const targetCard = this.cards().find(c => c.id === cardId);
    if (!targetCard || targetCard.flipped || targetCard.matched) return;

    // Transición idle → playing
    if (this.gameState() === 'idle') {
      this.gameState.set('playing');
      this.startTime.set(Date.now());
      this.startTimer();
    }

    // Voltear la carta (inmutablemente)
    this.cards.update(prev =>
      prev.map(c => c.id === cardId ? { ...c, flipped: true } : c)
    );

    // Agregar a flippedIds
    this.flippedIds.update(prev => [...prev, cardId]);

    // Si hay 2 volteadas → evaluar match
    if (this.flippedIds().length === 2) {
      this.evaluateMatch();
    }
  }

  /**
   * Reinicia la partida actual con el mismo número de pares.
   */
  resetGame(): void {
    this.initGame(this.currentPairs);
  }

  // ─── Métodos Privados ─────────────────────────

  /**
   * Compara las dos cartas volteadas.
   * Match → marca ambas como matched. No match → espera FLIP_DELAY y voltea boca abajo.
   */
  private evaluateMatch(): void {
    const [id1, id2] = this.flippedIds();
    const card1 = this.cards().find(c => c.id === id1)!;
    const card2 = this.cards().find(c => c.id === id2)!;

    this.moves.update(m => m + 1);

    if (card1.pairId === card2.pairId) {
      // ¡Match!
      this.cards.update(prev =>
        prev.map(c =>
          c.id === id1 || c.id === id2
            ? { ...c, matched: true, flipped: false }
            : c
        )
      );
      this.flippedIds.set([]);

      // Verificar victoria
      if (this.isVictory()) {
        this.gameState.set('won');
        this.stopTimer();
      }
    } else {
      // No match — mostrar brevemente y voltear
      setTimeout(() => {
        this.cards.update(prev =>
          prev.map(c =>
            c.id === id1 || c.id === id2
              ? { ...c, flipped: false }
              : c
          )
        );
        this.flippedIds.set([]);
      }, FLIP_DELAY);
    }
  }

  /**
   * Arranca el cronómetro interno (setInterval cada 1 s).
   */
  private startTimer(): void {
    if (this.timerRef !== null) return;
    this.timerRef = setInterval(() => {
      this.elapsedTime.update(t => t + 1);
    }, 1000);
  }

  /**
   * Detiene el cronómetro limpiando el intervalo.
   */
  private stopTimer(): void {
    if (this.timerRef !== null) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }
  }
}
