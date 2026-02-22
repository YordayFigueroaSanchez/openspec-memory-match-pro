import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card } from '../../models';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div
      class="w-20 h-20 rounded-lg cursor-pointer flex items-center justify-center text-lg font-bold select-none transition-colors duration-200"
      [class.bg-slate-700]="!card.flipped && !card.matched"
      [class.text-slate-700]="!card.flipped && !card.matched"
      [class.bg-white]="card.flipped && !card.matched"
      [class.bg-emerald-200]="card.matched"
      [class.opacity-60]="card.matched"
      [class.shadow-md]="card.flipped || card.matched"
      (click)="flip.emit(card.id)"
    >
      @if (card.flipped || card.matched) {
        <div class="flex flex-col items-center">
          <span>{{ card.pairId }}</span>
          <span class="text-xs text-slate-400">{{ card.flipCount }}</span>
        </div>
      } @else {
        <span class="text-2xl">?</span>
      }
    </div>
  `,
})
export class CardComponent {
  @Input({ required: true }) card!: Card;
  @Output() flip = new EventEmitter<string>();
}
