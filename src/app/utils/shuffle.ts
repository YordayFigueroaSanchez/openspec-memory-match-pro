/**
 * Implementación pura del algoritmo Fisher-Yates (Knuth shuffle).
 * Retorna un NUEVO array barajado — no muta el original.
 *
 * @param array — Array de entrada.
 * @returns Nuevo array con los mismos elementos en orden aleatorio.
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
