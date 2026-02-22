# Design — Fase 1: Motor del Juego y Tablero Reactivo

## Change ID
`001-core-engine`

---

## 1. Modelo de Datos

### 1.1 Interfaz `Card`

```typescript
// src/app/models/card.interface.ts

export interface Card {
  /** Identificador único de la instancia en el tablero (UUID o nanoid). */
  readonly id: string;

  /** Clave del icono o emoji que representa el par (e.g. "star", "heart").
   *  Dos cartas comparten el mismo pairId cuando forman pareja. */
  readonly pairId: string;

  /** true cuando la carta está boca arriba (volteada por el jugador en el turno actual). */
  flipped: boolean;

  /** true cuando la carta ya fue emparejada exitosamente y permanece visible. */
  matched: boolean;
}
```

> **Nota de inmutabilidad:** Aunque las propiedades `flipped` y `matched` son mutables en la interfaz, las actualizaciones del array se harán siempre mediante `signal.update(prev => prev.map(...))`, generando un nuevo array con nuevos objetos `Card`. Nunca se mutará un objeto in-place.

### 1.2 Tipo `GameState`

```typescript
// src/app/models/game-state.type.ts

export type GameState = 'idle' | 'playing' | 'won';
```

| Estado | Significado |
|---|---|
| `idle` | Partida no iniciada o reiniciada. El cronómetro está detenido. |
| `playing` | El jugador está interactuando con el tablero. El cronómetro corre. |
| `won` | Todas las cartas emparejadas. El cronómetro se detiene. |

---

## 2. `GameService` — Firma Pública

```typescript
// src/app/services/game.service.ts

@Injectable({ providedIn: 'root' })
export class GameService {

  // ─── Señales Primarias ─────────────────────────

  /** Array inmutable que representa el estado actual de todas las cartas. */
  readonly cards: WritableSignal<Card[]>;

  /** IDs de las cartas volteadas en el turno actual (0, 1 o 2 elementos). */
  readonly flippedIds: WritableSignal<string[]>;

  /** Cantidad de pares intentados por el jugador. */
  readonly moves: WritableSignal<number>;

  /** Estado global de la partida. */
  readonly gameState: WritableSignal<GameState>;

  /** Timestamp (Date.now()) del momento en que se volteó la primera carta.
   *  null cuando el juego está en 'idle'. */
  readonly startTime: WritableSignal<number | null>;

  // ─── Señales Derivadas ─────────────────────────

  /** Número de cartas que ya fueron emparejadas. */
  readonly matchedCount: Signal<number>;

  /** true cuando hay 2 cartas volteadas pendientes de validación
   *  → el tablero debe ignorar nuevos clics. */
  readonly isLocked: Signal<boolean>;

  /** true cuando todas las cartas han sido emparejadas. */
  readonly isVictory: Signal<boolean>;

  /** Segundos transcurridos desde el inicio de la partida.
   *  Se actualiza cada segundo mientras gameState === 'playing'. */
  readonly elapsedTime: Signal<number>;

  // ─── Métodos Públicos ──────────────────────────

  /**
   * Inicializa (o re-inicializa) el tablero.
   * 1. Genera pares de cartas según las dimensiones recibidas.
   * 2. Baraja con Fisher-Yates.
   * 3. Resetea contadores, flippedIds y gameState a 'idle'.
   *
   * @param pairs — Cantidad de parejas a generar (total de cartas = pairs * 2).
   */
  initGame(pairs: number): void;

  /**
   * Voltea una carta. Flujo:
   * 1. Si isLocked() o la carta ya está matched/flipped → no-op.
   * 2. Si gameState es 'idle' → transiciona a 'playing' (arranca timer).
   * 3. Actualiza cards (flipped = true) y agrega el id a flippedIds.
   * 4. Si flippedIds alcanza 2 → llama a evaluateMatch() internamente.
   *
   * @param cardId — El id único de la carta clickeada.
   */
  flipCard(cardId: string): void;

  /**
   * Reinicia la partida actual con el mismo número de pares.
   * Equivalente a llamar initGame() con la cantidad de pares actual.
   */
  resetGame(): void;
}
```

### Métodos Privados (internos del servicio)

```typescript
  /**
   * Compara las dos cartas volteadas.
   * - Match   → marca ambas como matched, incrementa moves, limpia flippedIds.
   * - No match→ espera FLIP_DELAY ms, voltea ambas boca abajo, incrementa moves,
   *              limpia flippedIds.
   * En ambos casos, al terminar verifica isVictory para transicionar estado.
   */
  private evaluateMatch(): void;

  /**
   * Arranca el cronómetro interno (setInterval cada 1 s).
   * Guarda la referencia del intervalo para poder limpiarlo.
   */
  private startTimer(): void;

  /**
   * Detiene el cronómetro limpiando el intervalo.
   */
  private stopTimer(): void;
```

### Constantes

```typescript
// src/app/services/game.service.ts (o un archivo de constantes)

/** Milisegundos que se muestran las cartas no coincidentes antes de voltearlas. */
const FLIP_DELAY = 1000;

/** Intervalo de actualización del cronómetro. */
const TIMER_INTERVAL = 1000;
```

---

## 3. Utilidades

### 3.1 `shuffle<T>(array: T[]): T[]`

```typescript
// src/app/utils/shuffle.ts

/**
 * Implementación pura del algoritmo Fisher-Yates.
 * Retorna un NUEVO array barajado (no muta el original).
 *
 * @param array — Array de entrada.
 * @returns — Nuevo array con los mismos elementos en orden aleatorio.
 */
export function shuffle<T>(array: T[]): T[];
```

### 3.2 `generateCards(pairs: number): Card[]`

```typescript
// src/app/utils/card-generator.ts

/**
 * Genera un array de Card[] listo para el tablero.
 * 1. Crea `pairs` pairIds únicos (e.g. "pair-0", "pair-1", …).
 * 2. Por cada pairId genera 2 instancias de Card con ids únicos.
 * 3. Baraja el array resultante con shuffle().
 *
 * @param pairs — Número de parejas.
 * @returns — Array barajado de Card[] con longitud pairs * 2.
 */
export function generateCards(pairs: number): Card[];
```

---

## 4. Componentes

### 4.1 `BoardComponent`

```
Selector:    app-board
Standalone:  true
Imports:     [CardComponent]
```

| Responsabilidad | Detalle |
|---|---|
| Inyecta `GameService` | Accede a `cards()`, `moves()`, `elapsedTime()`, `gameState()`. |
| Template | Usa `@for (card of gameService.cards(); track card.id)` para renderizar `<app-card>`. |
| Grid | CSS Grid con columnas dinámicas (e.g. `grid-template-columns: repeat(cols, 1fr)`) via Tailwind. |
| Controles | Botón "New Game" / "Reset" que invoque `gameService.initGame()` o `resetGame()`. |
| Contadores | Muestra `moves()` y `elapsedTime()` formateado (MM:SS). |
| Victoria | `@if (gameService.isVictory())` muestra un mensaje o overlay. |

### 4.2 `CardComponent`

```
Selector:    app-card
Standalone:  true
Imports:     []
```

| Input / Output | Tipo | Descripción |
|---|---|---|
| `@input() card` | `Card` | Datos de la carta a renderizar. |
| `@output() flip` | `EventEmitter<string>` | Emite `card.id` al hacer clic. |

| Responsabilidad | Detalle |
|---|---|
| Vista | Muestra la cara oculta o el contenido (`pairId`) según `card.flipped \|\| card.matched`. |
| Estilo | Clases Tailwind condicionales: fondo distinto para oculta / visible / matched. |
| Clic | `(click)="flip.emit(card.id)"` — el componente NO decide si el flip procede; eso lo controla `BoardComponent` → `GameService`. |

---

## 5. Diagrama de Flujo de Datos

```
┌─────────────┐   (click)    ┌──────────────┐  flipCard(id)  ┌──────────────┐
│ CardComponent│ ──────────► │ BoardComponent│ ─────────────► │  GameService  │
│  @output flip│              │               │                │               │
└─────────────┘              └──────────────┘                │  cards signal │
                                                              │  flippedIds   │
       ┌──────────────────────────────────────────────────────│  moves        │
       │                    Signals (auto-propagation)        │  gameState    │
       ▼                                                      └──────────────┘
  Template re-render
  (@for re-evaluates cards())
```

---

## 6. Estrategia de Inmutabilidad

Toda actualización de `cards` seguirá el patrón:

```typescript
this.cards.update(prev =>
  prev.map(card =>
    card.id === targetId
      ? { ...card, flipped: true }   // nuevo objeto
      : card                          // referencia existente (sin cambio)
  )
);
```

Esto garantiza:
- Angular detecta el cambio en la señal (nueva referencia de array).
- `@for ... track card.id` recicla los DOM nodes que no cambiaron.
- El componente `CardComponent` solo se repinta si su input `card` cambió de referencia.

---

## 7. Gestión del Cronómetro

| Evento | Acción |
|---|---|
| `flipCard()` y `gameState === 'idle'` | `gameState.set('playing')` → `startTimer()` → `startTime.set(Date.now())`. |
| Cada 1 000 ms mientras `gameState === 'playing'` | Actualizar `elapsedTime` signal via `computed` o tick manual. |
| `isVictory() === true` | `effect()` detecta el cambio → `stopTimer()` → `gameState.set('won')`. |
| `resetGame()` | `stopTimer()` → `gameState.set('idle')` → `startTime.set(null)`. |

> **Implementación preferida:** Usar un `effect()` que observe `gameState()`. Cuando transiciona a `'playing'`, arranca el intervalo. Cuando deja de ser `'playing'`, lo limpia. La función de cleanup del effect garantiza que no haya leaks.

---

## 8. Estructura de Archivos Resultante

```
src/
└── app/
    ├── components/
    │   ├── board/
    │   │   ├── board.component.ts
    │   │   └── board.component.html
    │   └── card/
    │       ├── card.component.ts
    │       └── card.component.html
    ├── models/
    │   ├── card.interface.ts
    │   └── game-state.type.ts
    ├── services/
    │   └── game.service.ts
    └── utils/
        ├── shuffle.ts
        └── card-generator.ts
```
