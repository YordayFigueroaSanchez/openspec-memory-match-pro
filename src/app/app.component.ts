import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col items-center py-8">
      <h1 class="text-3xl font-bold text-slate-800 mb-6">Memory Match Pro</h1>
      <router-outlet />
    </div>
  `,
})
export class AppComponent {}
