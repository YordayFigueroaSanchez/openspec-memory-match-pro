## 1. Routing Setup

- [x] 1.1 Configure Angular Router in `app.config.ts` with `provideRouter` and define routes (`/login`, `/game`, `**` redirect)
- [x] 1.2 Replace `<app-board />` in `AppComponent` with `<router-outlet />` and keep shared layout wrapper

## 2. Auth Service

- [x] 2.1 Create `AuthService` in `src/app/services/auth.service.ts` with hardcoded user array, `currentUser` signal, `isAuthenticated` computed, and `login(username, password)` method
- [x] 2.2 Create `authGuard` (`CanActivateFn`) in `src/app/guards/auth.guard.ts` that redirects to `/login` if not authenticated

## 3. Login Component

- [x] 3.1 Create `LoginComponent` in `src/app/components/login/login.component.ts` with reactive form (username, password fields, submit button)
- [x] 3.2 Add form validation — disable submit when fields are empty, show error message on failed login
- [x] 3.3 On successful login, navigate to `/game` using `Router.navigate`

## 4. Game Route Integration

- [x] 4.1 Move game board view into the `/game` route protected by `authGuard`
- [x] 4.2 Verify unauthenticated access to `/game` redirects to `/login`

## 5. Styling & Polish

- [x] 5.1 Style login form with Tailwind CSS to match existing app look and feel
- [x] 5.2 Verify end-to-end flow: login screen → authenticate → game board → refresh returns to login
