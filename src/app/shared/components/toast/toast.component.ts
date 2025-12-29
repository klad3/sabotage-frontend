import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed top-24 right-5 z-50 flex flex-col gap-3">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="min-w-[300px] p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 animate-slide-in relative overflow-hidden group"
          [ngClass]="{
            'bg-gray-800 border-green-500 text-white': toast.type === 'success',
            'bg-gray-800 border-red-500 text-white': toast.type === 'error',
            'bg-gray-800 border-yellow-500 text-white': toast.type === 'warning',
            'bg-gray-800 border-blue-500 text-white': toast.type === 'info'
          }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 pr-4">
              <h4 class="font-bold text-sm uppercase mb-1 tracking-wider opacity-90">{{ toast.type }}</h4>
              <p class="text-sm opacity-90 font-light">{{ toast.message }}</p>
            </div>
            
            <button 
              (click)="toastService.remove(toast.id)" 
              class="text-white hover:text-gray-300 transition-colors focus:outline-none opacity-60 hover:opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Progress bar for auto-dismiss -->
          @if (toast.duration && toast.duration > 0) {
            <div 
              class="absolute bottom-0 left-0 h-1 bg-white/20"
              [style.width.%]="100"
              [style.animation]="'progress ' + toast.duration + 'ms linear forwards'"
            ></div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out forwards;
    }
    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }
  `]
})
export class ToastComponent {
    readonly toastService = inject(ToastService);
}
