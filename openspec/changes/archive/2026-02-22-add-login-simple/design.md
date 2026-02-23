## Context

The Memory Match Pro app is a standalone Angular 18 application using Signals for state management and Tailwind CSS for styling. Currently, `AppComponent` directly renders `BoardComponent` with no routing or access control. The `@angular/router` package is already installed but not configured. The spec (`openspec/specs/add-login-simple/spec.md`) requires a user database with username/passwordHash fields and login/logout flow with success and failure scenarios.

## Goals / Non-Goals

**Goals:**
- Gate game access behind a simple login form
- Validate credentials against a hardcoded in-memory user list
- Use Angular Router to navigate between login and game views
- Store authentication state via a signal-based `AuthService`
- Keep the implementation minimal and client-side only

**Non-Goals:**
- No backend API or server-side authentication
- No user registration or sign-up flow
- No session persistence across page reloads (refresh = logged out)
- No role-based access control or authorization layers
- No real cryptographic password hashing (use plain comparison for hardcoded users)

## Decisions

### 1. Angular Router for view switching

**Choice**: Use `@angular/router` with route guards to switch between login and game views.

**Rationale**: The router is already an installed dependency. Route guards (`CanActivateFn`) provide a clean, declarative way to protect the game route. Alternative considered: conditional rendering via `@if` in `AppComponent` — rejected because it doesn't scale and bypasses URL-based navigation.

**Routes**:
- `/login` → `LoginComponent`
- `/game` → `BoardComponent` (guarded)
- `**` → redirect to `/login`

### 2. Signal-based AuthService

**Choice**: Create an `AuthService` with a `signal<string | null>` holding the current username (or `null` if logged out). Expose `isAuthenticated` as a `computed` signal.

**Rationale**: Aligns with the project's signals-first architecture. The service is `providedIn: 'root'` like `GameService`. Alternative considered: using `BehaviorSubject` from RxJS — rejected in favor of consistency with the existing signal-based patterns.

### 3. Hardcoded in-memory user database

**Choice**: Define users as a constant array inside `AuthService` with `{ username, password }` entries using plain-text comparison.

**Rationale**: The spec requires a "database of users" but the project has no backend. A hardcoded array satisfies the spec for this simple implementation. Real hashing (bcrypt/SHA-256) is unnecessary for demo data and would add a dependency for no practical security gain in a client-side-only app.

**Users**: Two demo accounts — `player1` / `pass1` and `player2` / `pass2`.

### 4. LoginComponent with Reactive Forms

**Choice**: Use Angular Reactive Forms (`FormGroup` with `FormControl`) for the login form.

**Rationale**: `@angular/forms` is already installed. Reactive forms provide typed validation and simpler testing compared to template-driven forms.

### 5. AppComponent becomes a router shell

**Choice**: Replace the direct `<app-board />` in `AppComponent` with `<router-outlet />`.

**Rationale**: This is the standard Angular pattern. The game title and wrapper styling move into the individual routed components or remain in `AppComponent` as a shared layout.

## Risks / Trade-offs

- **[No persistence]** → Users will be logged out on page refresh. Acceptable for this scope; future change could add `sessionStorage`.
- **[Plain-text passwords]** → No real security. Acceptable because this is a client-side demo with hardcoded users. The spec's `passwordHash` requirement is acknowledged but deferred to a backend implementation.
- **[Route guard bypass]** → A user could navigate directly to `/game` by inspecting the code. The `CanActivateFn` guard mitigates casual bypass. True security requires a backend.
- **[Breaking existing layout]** → Moving from direct component embedding to routing changes `AppComponent`. Risk of visual regression. Mitigation: keep the shared wrapper styles in `AppComponent` around `<router-outlet />`.
