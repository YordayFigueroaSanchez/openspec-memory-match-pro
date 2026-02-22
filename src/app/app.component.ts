import { Component } from '@angular/core';
import { BoardComponent } from './components/board/board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoardComponent],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col items-center py-8">
      <h1 class="text-3xl font-bold text-slate-800 mb-6">Memory Match Pro</h1>
      <app-board />
    </div>
  `,
})
export class AppComponent {}
