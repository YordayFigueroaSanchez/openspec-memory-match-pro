import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="w-full max-w-sm mx-auto mt-12">
      <div class="bg-white rounded-xl shadow-md p-8">
        <h2 class="text-2xl font-bold text-slate-800 text-center mb-6">Log In</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="username" class="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              id="username"
              formControlName="username"
              type="text"
              autocomplete="username"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
            />
          </div>

          <div class="mb-6">
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              formControlName="password"
              type="password"
              autocomplete="current-password"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          @if (errorMessage()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {{ errorMessage() }}
            </div>
          }

          <button
            type="submit"
            [disabled]="loginForm.invalid"
            class="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Log In
          </button>
        </form>

        <p class="mt-4 text-xs text-slate-400 text-center">
          Demo: player1 / pass1 or player2 / pass2
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly errorMessage = signal<string>('');

  readonly loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }

    const { username, password } = this.loginForm.getRawValue();
    const success = this.authService.login(username, password);

    if (success) {
      this.errorMessage.set('');
      this.router.navigate(['/game']);
    } else {
      this.errorMessage.set('Invalid username or password.');
    }
  }
}
