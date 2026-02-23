import { computed, Injectable, signal } from '@angular/core';

interface User {
  username: string;
  password: string;
}

/** Hardcoded user database for demo purposes. */
const USERS: User[] = [
  { username: 'player1', password: 'pass1' },
  { username: 'player2', password: 'pass2' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Current authenticated username, or null if logged out. */
  readonly currentUser = signal<string | null>(null);

  /** Whether a user is currently authenticated. */
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  /**
   * Attempt to log in with the given credentials.
   * Returns true on success, false on failure.
   */
  login(username: string, password: string): boolean {
    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      this.currentUser.set(user.username);
      return true;
    }
    return false;
  }

  /** Log out the current user. */
  logout(): void {
    this.currentUser.set(null);
  }
}
