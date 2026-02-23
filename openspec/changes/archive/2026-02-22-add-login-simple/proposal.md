## Why

The Memory Match game currently has no access control — anyone can open the app and play immediately. Adding a simple login gate ensures only registered users can access the game, laying the groundwork for future features like per-user score tracking and leaderboards.

## What Changes

- Add a login screen with username and password fields
- Introduce a hardcoded user database (in-memory or static JSON) with hashed passwords
- Gate the game board behind successful authentication
- Display an error message on failed login attempts
- Redirect authenticated users to the game board

## Capabilities

### New Capabilities

_(none — the capability already exists as a main spec)_

### Modified Capabilities

- `add-login-simple`: Implementing the existing spec that defines user database and login requirements

## Impact

- **New components**: A `LoginComponent` for the login form UI
- **New services**: An `AuthService` to handle credential validation and session state
- **Routing**: Introduction of Angular Router to switch between login and game views
- **Dependencies**: May add a lightweight hashing utility (e.g., `bcryptjs` or simple SHA-256) for password verification
- **Existing code**: `AppComponent` will need to incorporate routing; the game board will become a routed view instead of the root view
