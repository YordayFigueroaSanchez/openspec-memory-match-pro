export interface Card {
  /** Identificador único de la instancia en el tablero. */
  readonly id: string;

  /** Clave que identifica el par. Dos cartas comparten el mismo pairId cuando forman pareja. */
  readonly pairId: string;

  /** true cuando la carta está boca arriba (volteada por el jugador en el turno actual). */
  flipped: boolean;

  /** true cuando la carta ya fue emparejada exitosamente y permanece visible. */
  matched: boolean;
}
