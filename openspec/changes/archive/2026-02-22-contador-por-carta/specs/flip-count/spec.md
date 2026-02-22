## ADDED Requirements

### Requirement: Card flip count tracking
Each `Card` instance SHALL have a `flipCount` field of type `number` that tracks how many times that specific card has been flipped during the current game session.

#### Scenario: Initial flip count is zero
- **WHEN** a new game is initialized
- **THEN** every card on the board SHALL have `flipCount` equal to `0`

#### Scenario: Flip count increments on card flip
- **WHEN** a player flips a face-down card
- **THEN** the `flipCount` of that card SHALL be incremented by `1`

#### Scenario: Flip count persists after mismatch
- **WHEN** two cards are flipped and they do not match
- **THEN** both cards are returned face-down but their `flipCount` values SHALL remain unchanged (not decremented)

#### Scenario: Flip count persists after match
- **WHEN** two cards are flipped and they match
- **THEN** both cards are marked as matched and their `flipCount` values SHALL remain unchanged

#### Scenario: Flip count accumulates across turns
- **WHEN** a card is flipped, returned face-down (mismatch), and then flipped again
- **THEN** the card's `flipCount` SHALL reflect the total number of times it has been flipped (e.g., `2` after two flips)

### Requirement: Flip count reset on new game
The `flipCount` for all cards SHALL be reset to `0` when a new game is started or the current game is restarted.

#### Scenario: Reset game resets flip counts
- **WHEN** the player resets or starts a new game
- **THEN** all generated cards SHALL have `flipCount` equal to `0`

### Requirement: Flip count display
The `flipCount` value SHALL be displayed on each card when the card is visible (flipped or matched).

#### Scenario: Flip count visible when card is face-up
- **WHEN** a card is flipped face-up
- **THEN** the card's `flipCount` SHALL be displayed on the card

#### Scenario: Flip count visible when card is matched
- **WHEN** a card is matched
- **THEN** the card's `flipCount` SHALL be displayed on the card

#### Scenario: Flip count hidden when card is face-down
- **WHEN** a card is face-down (not flipped and not matched)
- **THEN** the card's `flipCount` SHALL NOT be displayed
