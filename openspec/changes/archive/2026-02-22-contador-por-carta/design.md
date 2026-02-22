## Context

El modelo `Card` actual tiene cuatro campos (`id`, `pairId`, `flipped`, `matched`) pero no registra cuántas veces el jugador ha volteado cada carta individual. La propuesta exige agregar `flipCount` como campo obligatorio en cada instancia de carta para rastrear la interacción del jugador a nivel de carta.

Archivos involucrados en el estado actual:
- `src/app/models/card.interface.ts` — Interfaz `Card`.
- `src/app/utils/card-generator.ts` — Fábrica de cartas (`generateCards`).
- `src/app/services/game.service.ts` — Lógica de volteo (`flipCard`) y evaluación (`evaluateMatch`).
- `src/app/components/card/card.component.ts` — Renderizado de cada carta.

## Goals / Non-Goals

**Goals:**
- Agregar `flipCount: number` a la interfaz `Card`.
- Inicializar `flipCount` en `0` al generar cartas.
- Incrementar `flipCount` de forma inmutable cada vez que una carta es volteada en `GameService.flipCard`.
- Mostrar `flipCount` visualmente en el componente `CardComponent` cuando la carta está boca arriba o emparejada.

**Non-Goals:**
- No se persiste `flipCount` entre sesiones (no hay almacenamiento).
- No se calculan estadísticas agregadas (promedios, máximos, etc.) — eso queda fuera de este cambio.
- No se altera la lógica de match/bloqueo/victoria existente.

## Decisions

### D1 — `flipCount` como campo mutable en la interfaz

Agregar `flipCount: number` (no `readonly`) a `Card`. Sigue el mismo patrón que `flipped` y `matched`, que ya son campos mutables actualizados inmutablemente mediante spread.

**Alternativa descartada:** Usar un `Map<string, number>` externo en `GameService` para rastrear volteos.  
**Razón:** Rompe la co-localización del estado de cada carta y complica la propagación a componentes vía signals. Mantener el dato en la propia instancia de `Card` es más coherente con la arquitectura actual de signals + spread inmutable.

### D2 — Incremento en `GameService.flipCard`

Incrementar `flipCount` en el mismo `cards.update(prev => prev.map(...))` que ya marca `flipped: true` dentro de `flipCard`. Esto garantiza una sola actualización de signal por volteo.

**Alternativa descartada:** Incrementar en el componente o en `evaluateMatch`.  
**Razón:** El componente es presentacional (no debe mutar estado). Hacerlo en `evaluateMatch` solo captura volteos de la segunda carta, no de la primera.

### D3 — Visualización en `CardComponent`

Mostrar `flipCount` como badge o texto secundario dentro del template del componente, visible cuando la carta está `flipped` o `matched`. Se usará un `<span>` con clases Tailwind para estilo discreto.

**Alternativa descartada:** Mostrar `flipCount` siempre visible (incluso boca abajo).  
**Razón:** Revelaría indirectamente la identidad de las cartas al usuario (cartas con más volteos serían reconocibles).

### D4 — Reset en `initGame` / `generateCards`

Dado que `generateCards` crea objetos `Card` con spread literal, basta agregar `flipCount: 0` al literal. No se necesita lógica adicional de reset porque `initGame` regenera las cartas desde cero.

## Risks / Trade-offs

- **[Bajo] Spread overhead** — Agregar un campo al spread de `cards.update` es insignificante a nivel de rendimiento para tableros de tamaño razonable (≤ 36 cartas). → Sin mitigación necesaria.
- **[Bajo] Breaking change en tests** — Si existen tests que usan objetos `Card` literales, habrá que agregar `flipCount`. → Actualizar tests al implementar.
