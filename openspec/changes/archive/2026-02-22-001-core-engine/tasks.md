# Tasks — Fase 1: Motor del Juego y Tablero Reactivo

## Change ID
`001-core-engine`

> **Instrucciones para el Developer Agent:**
> Ejecuta cada tarea en orden. Al completar cada una, verifica que la app compile sin errores (`ng build` o `ng serve`). No avances a la siguiente si hay errores de compilación.

---

## Pre-requisito: Scaffold del Proyecto

### Task 0.1 — Crear proyecto Angular 18
- [x] Ejecutar `ng new memory-match-pro --standalone --style=css --routing=false --skip-tests` (o verificar que ya existe).
- [x] Confirmar que `angular.json` apunta a Angular 18+.
- [x] Verificar que `tsconfig.json` tiene `"strict": true`.

### Task 0.2 — Instalar dependencias
- [x] `npm install -D tailwindcss @tailwindcss/postcss postcss` (o la versión que corresponda a Tailwind v4).
- [x] Configurar Tailwind: crear/actualizar `postcss.config.js` y el archivo CSS de entrada (`styles.css`) con las directivas de Tailwind.
- [x] `npm install lucide-angular` (se usará en fases posteriores, pero se instala ahora).
- [x] Verificar que `ng serve` arranca sin errores.

---

## Bloque 1: Modelos e Interfaces

### Task 1.1 — Crear interfaz `Card`
- [x] Crear archivo `src/app/models/card.interface.ts`.
- [x] Definir la interfaz `Card` con las propiedades: `id: string`, `pairId: string`, `flipped: boolean`, `matched: boolean`.
- [x] Marcar `id` y `pairId` como `readonly`.
- [x] Exportar la interfaz.

### Task 1.2 — Crear tipo `GameState`
- [x] Crear archivo `src/app/models/game-state.type.ts`.
- [x] Definir y exportar `type GameState = 'idle' | 'playing' | 'won'`.

### Task 1.3 — Crear barrel export
- [x] Crear `src/app/models/index.ts` que re-exporte `Card` y `GameState`.

---

## Bloque 2: Utilidades

### Task 2.1 — Implementar Fisher-Yates shuffle
- [x] Crear archivo `src/app/utils/shuffle.ts`.
- [x] Implementar `export function shuffle<T>(array: T[]): T[]`.
- [x] La función debe retornar un **nuevo** array (no mutar el original).
- [x] Usar el algoritmo Fisher-Yates (Knuth) iterando desde el final al inicio.

### Task 2.2 — Implementar generador de cartas
- [x] Crear archivo `src/app/utils/card-generator.ts`.
- [x] Implementar `export function generateCards(pairs: number): Card[]`.
- [x] Generar `pairs` pairIds únicos (formato sugerido: `"pair-0"`, `"pair-1"`, …).
- [x] Por cada `pairId`, crear 2 objetos `Card` con `id` único (usar `crypto.randomUUID()` o un contador).
- [x] Todas las cartas inician con `flipped: false` y `matched: false`.
- [x] Barajar el array resultante usando `shuffle()` de Task 2.1.
- [x] Retornar el array barajado.

### Task 2.3 — Barrel export de utils
- [x] Crear `src/app/utils/index.ts` que re-exporte `shuffle` y `generateCards`.

---

## Bloque 3: GameService

### Task 3.1 — Scaffold del servicio
- [x] Crear archivo `src/app/services/game.service.ts`.
- [x] Decorar con `@Injectable({ providedIn: 'root' })`.
- [x] Inyectar `DestroyRef` en el constructor para limpieza del timer.

### Task 3.2 — Definir señales primarias
- [x] `cards = signal<Card[]>([])`.
- [x] `flippedIds = signal<string[]>([])`.
- [x] `moves = signal<number>(0)`.
- [x] `gameState = signal<GameState>('idle')`.
- [x] `startTime = signal<number | null>(null)`.
- [x] Declarar campo privado `private timerRef: ReturnType<typeof setInterval> | null = null`.
- [x] Declarar campo privado `private currentPairs = 0` para poder hacer reset.

### Task 3.3 — Definir señales derivadas
- [x] `matchedCount = computed(() => this.cards().filter(c => c.matched).length)`.
- [x] `isLocked = computed(() => this.flippedIds().length === 2)`.
- [x] `isVictory = computed(() => this.cards().length > 0 && this.matchedCount() === this.cards().length)`.
- [x] `elapsedTime = signal<number>(0)` — se actualizará manualmente via el timer (no es `computed` porque depende del reloj).

### Task 3.4 — Implementar `initGame(pairs: number)`
- [x] Asignar `this.currentPairs = pairs`.
- [x] Generar cartas con `generateCards(pairs)`.
- [x] `this.cards.set(generatedCards)`.
- [x] `this.flippedIds.set([])`.
- [x] `this.moves.set(0)`.
- [x] `this.elapsedTime.set(0)`.
- [x] `this.gameState.set('idle')`.
- [x] `this.startTime.set(null)`.
- [x] Llamar `this.stopTimer()`.

### Task 3.5 — Implementar `flipCard(cardId: string)`
- [x] Guard: si `this.isLocked()` → return.
- [x] Guard: si la carta con `cardId` ya tiene `flipped === true` o `matched === true` → return.
- [x] Si `this.gameState() === 'idle'`:
  - Cambiar `this.gameState.set('playing')`.
  - `this.startTime.set(Date.now())`.
  - Llamar `this.startTimer()`.
- [x] Actualizar `cards`: `this.cards.update(prev => prev.map(c => c.id === cardId ? { ...c, flipped: true } : c))`.
- [x] Actualizar `flippedIds`: `this.flippedIds.update(prev => [...prev, cardId])`.
- [x] Si `this.flippedIds().length === 2` → llamar `this.evaluateMatch()`.

### Task 3.6 — Implementar `evaluateMatch()` (método privado)
- [x] Obtener las dos cartas volteadas usando `flippedIds()` y buscándolas en `cards()`.
- [x] Incrementar moves: `this.moves.update(m => m + 1)`.
- [x] **Si los `pairId` coinciden (match):**
  - Actualizar `cards`: marcar ambas como `{ ...card, matched: true, flipped: false }`.
  - Limpiar `flippedIds.set([])`.
  - Verificar victoria: si `this.isVictory()` → `this.gameState.set('won')`, `this.stopTimer()`.
- [x] **Si NO coinciden (no match):**
  - Usar `setTimeout(() => { ... }, FLIP_DELAY)` donde `FLIP_DELAY = 1000`.
  - Dentro del timeout: actualizar `cards` para poner `flipped: false` en ambas cartas.
  - Limpiar `flippedIds.set([])`.

### Task 3.7 — Implementar timer (`startTimer` / `stopTimer`)
- [x] `startTimer()`: si `timerRef` ya existe, no hacer nada. De lo contrario, crear `setInterval` de 1000 ms que haga: `this.elapsedTime.update(t => t + 1)`.
- [x] `stopTimer()`: si `timerRef` existe, `clearInterval(timerRef)` y poner `timerRef = null`.
- [x] En el constructor, registrar limpieza con `DestroyRef`: `destroyRef.onDestroy(() => this.stopTimer())`.

### Task 3.8 — Implementar `resetGame()`
- [x] Llamar `this.initGame(this.currentPairs)`.

---

## Bloque 4: CardComponent

### Task 4.1 — Scaffold del componente
- [x] Crear carpeta `src/app/components/card/`.
- [x] Crear `card.component.ts` como standalone component, selector: `app-card`.
- [x] Definir `@Input({ required: true }) card!: Card`.
- [x] Definir `@Output() flip = new EventEmitter<string>()`.
- [x] Crear `card.component.html` inline o como archivo separado.

### Task 4.2 — Template del CardComponent
- [x] Estructura HTML: un `<div>` contenedor con clases Tailwind.
- [x] Binding de clic: `(click)="flip.emit(card.id)"`.
- [x] Usar `@if (card.flipped || card.matched)` para mostrar el contenido (`pairId`) o la cara oculta.
- [x] Clases condicionales:
  - Cara oculta: fondo azul/gris oscuro (e.g. `bg-slate-700`).
  - Volteada: fondo blanco.
  - Matched: fondo verde suave (e.g. `bg-emerald-200`) con opacidad reducida.
- [x] Tamaño de carta: `w-20 h-20` o similar, con `rounded-lg`, `cursor-pointer`, `flex items-center justify-center`.

---

## Bloque 5: BoardComponent

### Task 5.1 — Scaffold del componente
- [x] Crear carpeta `src/app/components/board/`.
- [x] Crear `board.component.ts` como standalone component, selector: `app-board`.
- [x] Importar `CardComponent` en el array `imports`.
- [x] Inyectar `GameService` en el constructor (o con `inject()`).

### Task 5.2 — Template del BoardComponent
- [x] Sección de contadores:
  - Mostrar `Moves: {{ gameService.moves() }}`.
  - Mostrar `Time: {{ formattedTime() }}` (crear un `computed` local que formatee `elapsedTime` a `MM:SS`).
- [x] Grid de cartas:
  ```html
  <div class="grid grid-cols-4 gap-3">
    @for (card of gameService.cards(); track card.id) {
      <app-card [card]="card" (flip)="onCardFlip($event)" />
    }
  </div>
  ```
- [x] Método `onCardFlip(cardId: string)`: llama a `this.gameService.flipCard(cardId)`.
- [x] Botón "New Game" que llame a `gameService.initGame(8)` (8 pares = 16 cartas, grid 4×4).
- [x] Botón "Reset" que llame a `gameService.resetGame()`.
- [x] `@if (gameService.isVictory())` → mostrar un mensaje de victoria (texto simple, sin overlay elaborado).

### Task 5.3 — Estilos del BoardComponent
- [x] Centrar el tablero: `flex flex-col items-center gap-4`.
- [x] Contadores con `text-lg font-semibold`.
- [x] Botones con estilos Tailwind básicos (`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700`).

---

## Bloque 6: Integración en App

### Task 6.1 — Actualizar AppComponent
- [x] Abrir `src/app/app.component.ts`.
- [x] Importar `BoardComponent` en `imports`.
- [x] En el template, colocar `<app-board />`.
- [x] Opcionalmente agregar un título `<h1>Memory Match Pro</h1>` con estilos Tailwind.

### Task 6.2 — Verificación final
- [x] Ejecutar `ng serve`.
- [x] Verificar que el tablero se renderiza con 16 cartas (4×4).
- [x] Verificar que al hacer clic en una carta se voltea.
- [x] Verificar que al hacer clic en dos cartas iguales se marcan como matched.
- [x] Verificar que al hacer clic en dos cartas distintas se voltean de regreso tras ~1s.
- [x] Verificar que el contador de movimientos incrementa correctamente.
- [x] Verificar que el cronómetro arranca al primer clic y se detiene al ganar.
- [x] Verificar que el tablero queda bloqueado mientras se validan dos cartas.
- [x] Verificar que el botón "Reset" reinicia todo el estado.
- [x] Verificar que al emparejar todas las cartas aparece el mensaje de victoria.

---

## Resumen de Archivos a Crear/Modificar

| # | Archivo | Acción |
|---|---|---|
| 1 | `src/app/models/card.interface.ts` | Crear |
| 2 | `src/app/models/game-state.type.ts` | Crear |
| 3 | `src/app/models/index.ts` | Crear |
| 4 | `src/app/utils/shuffle.ts` | Crear |
| 5 | `src/app/utils/card-generator.ts` | Crear |
| 6 | `src/app/utils/index.ts` | Crear |
| 7 | `src/app/services/game.service.ts` | Crear |
| 8 | `src/app/components/card/card.component.ts` | Crear |
| 9 | `src/app/components/card/card.component.html` | Crear |
| 10 | `src/app/components/board/board.component.ts` | Crear |
| 11 | `src/app/components/board/board.component.html` | Crear |
| 12 | `src/app/app.component.ts` | Modificar |
| 13 | `styles.css` | Modificar (Tailwind directives) |

**Total: 11 archivos nuevos, 2 modificaciones.**
