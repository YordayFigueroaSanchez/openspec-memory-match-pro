## 1. Model

- [x] 1.1 Add `flipCount: number` field to the `Card` interface in `src/app/models/card.interface.ts`

## 2. Card Generation

- [x] 2.1 Initialize `flipCount: 0` in each card literal inside `generateCards()` in `src/app/utils/card-generator.ts`

## 3. Game Service

- [x] 3.1 Increment `flipCount` immutably in `GameService.flipCard()` within the existing `cards.update()` call that sets `flipped: true`

## 4. Card Component

- [x] 4.1 Display `flipCount` in `CardComponent` template when the card is flipped or matched, using a secondary `<span>` with Tailwind styling
- [x] 4.2 Ensure `flipCount` is hidden when the card is face-down

## 5. Verification

- [x] 5.1 Manual test: start a game, flip cards, confirm `flipCount` increments and displays correctly
- [x] 5.2 Manual test: mismatch two cards, flip one again, confirm `flipCount` accumulates (shows `2`)
- [x] 5.3 Manual test: reset game, confirm all `flipCount` values return to `0`
