# Proposal — Fase 1: Motor del Juego y Tablero Reactivo

## Change ID
`001-core-engine`

## Objetivo
Construir el núcleo reactivo del juego de memoria: el **estado del juego gestionado enteramente con Angular Signals**, el servicio que orquesta la lógica de turnos, y el tablero que refleja cada cambio de estado sin suscripciones manuales ni detección de cambios innecesaria.

---

## Contexto y Motivación

El juego de memoria requiere un estado que cambia con alta frecuencia (voltear cartas, validar pares, contadores de movimientos, cronómetro). Las soluciones tradicionales basadas en `BehaviorSubject` u observables generan complejidad innecesaria para este tipo de reactividad granular.

**Angular Signals** (estables desde Angular 16, maduros en 18) ofrecen:

| Ventaja | Impacto en el proyecto |
|---|---|
| Reactividad granular sin zonas | Solo se re-renderizan los componentes que leen la señal modificada. |
| Modelo push sincrónico | `flip()` actualiza la señal → la vista se repinta en el mismo ciclo. |
| `computed()` derivado | `isVictory`, `matchedCount`, `elapsedTime` se calculan automáticamente. |
| `effect()` para side-effects | Ideal para arrancar / detener el cronómetro cuando cambia el estado de juego. |
| Inmutabilidad con `update()` | `cards.update(prev => prev.map(...))` devuelve un array nuevo en cada turno. |

---

## Estrategia de Signals para el Estado del Juego

### 1. Señales Primarias (source of truth)

```
cards        : WritableSignal<Card[]>      → Array inmutable de cartas del tablero.
flippedIds   : WritableSignal<string[]>    → IDs de las cartas volteadas en el turno actual (máx. 2).
moves        : WritableSignal<number>      → Contador de pares intentados.
gameState    : WritableSignal<GameState>   → 'idle' | 'playing' | 'won'
startTime    : WritableSignal<number|null> → Timestamp de inicio de partida.
```

### 2. Señales Derivadas (`computed`)

```
matchedCount : Signal<number>   → cards().filter(c => c.matched).length
isLocked     : Signal<boolean>  → flippedIds().length === 2  (bloqueo de tablero)
isVictory    : Signal<boolean>  → matchedCount() === cards().length
elapsedTime  : Signal<number>   → Segundos transcurridos desde startTime()
```

### 3. Efectos (`effect`)

| Efecto | Disparo | Acción |
|---|---|---|
| `victoryEffect` | `isVictory() === true` | Cambia `gameState` a `'won'`, detiene cronómetro. |
| `timerEffect` | `gameState() === 'playing'` | Arranca un `setInterval` interno; lo limpia al ganar o reiniciar. |

### 4. Flujo de un Turno Completo

```
Usuario hace clic en Carta A
  → flipCard(idA)
  → flippedIds.update([idA])
  → cards.update(…flip card A)

Usuario hace clic en Carta B
  → flipCard(idB)
  → flippedIds.update([idA, idB])
  → isLocked = true  (computed, bloquea el tablero)
  → cards.update(…flip card B)
  → evaluateMatch():
       • Match   → marcar ambas como matched, limpiar flippedIds, moves++
       • No match → esperar ~1 s, voltear ambas boca abajo, limpiar flippedIds, moves++
```

---

## Principios Arquitectónicos

1. **Signals-First** — Cero `BehaviorSubject`, cero `subscribe()`. Todo el estado vive en signals dentro de `GameService`.
2. **Standalone Components** — Sin `NgModule`. Cada componente declara sus importaciones en `imports: [...]`.
3. **Nuevo Control Flow** — `@for (card of cards(); track card.id)` en el template del tablero; `@if` para estados condicionales.
4. **Inmutabilidad estricta** — `signal.update()` siempre recibe una función que retorna un nuevo valor: nunca `push()`, nunca `splice()`.
5. **Separación de responsabilidades** — El componente solo lee señales y llama métodos del servicio; la lógica de negocio reside 100 % en `GameService`.

---

## Alcance de esta Fase

### Incluido
- Interfaz `Card` y tipo `GameState`.
- `GameService` con toda la lógica de signals.
- Algoritmo Fisher-Yates en `src/app/utils/shuffle.ts`.
- `BoardComponent` (standalone) con grid CSS y `@for`.
- `CardComponent` (standalone) con evento de flip y estados visuales básicos.
- Lógica de bloqueo mientras se valida un par.
- Contadores de movimientos y tiempo.
- Detección de victoria.

### Excluido (fases posteriores)
- Animaciones CSS / Angular Animations para flip 3D.
- Íconos Lucide en las caras de las cartas.
- Pantalla de configuración de dificultad (n × n).
- Pantalla de victoria con estadísticas.
- Tests unitarios.
- Deploy / CI.

---

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|---|---|
| `effect()` ejecutándose fuera del contexto de inyección | Registrar todos los effects en el constructor de `GameService` o usando `runInInjectionContext`. |
| Mutación accidental del array de cartas | Enforce con `Readonly<Card>[]` en la interfaz de la señal y revisión en tasks. |
| Doble clic en la misma carta | `flipCard` debe ignorar si `id` ya está en `flippedIds` o la carta ya está `matched`. |
| Timer leak al destruir componente | Limpiar `setInterval` en `DestroyRef.onDestroy` o en la función de cleanup del `effect`. |

---

## Decisión
Proceder con el diseño detallado (→ `design.md`) y la lista de tareas (→ `tasks.md`).
