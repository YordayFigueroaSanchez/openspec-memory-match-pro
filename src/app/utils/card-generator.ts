import { Card } from '../models';
import { shuffle } from './shuffle';

/**
 * Genera un array de Card[] listo para el tablero.
 * 1. Crea `pairs` pairIds únicos ("pair-0", "pair-1", …).
 * 2. Por cada pairId genera 2 instancias de Card con ids únicos.
 * 3. Baraja el array resultante con shuffle().
 *
 * @param pairs — Número de parejas.
 * @returns Array barajado de Card[] con longitud pairs * 2.
 */
export function generateCards(pairs: number): Card[] {
  const cards: Card[] = [];

  for (let i = 0; i < pairs; i++) {
    const pairId = `pair-${i}`;

    cards.push(
      { id: crypto.randomUUID(), pairId, flipped: false, matched: false, flipCount: 0 },
      { id: crypto.randomUUID(), pairId, flipped: false, matched: false, flipCount: 0 },
    );
  }

  return shuffle(cards);
}
