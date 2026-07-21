import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { ToastNotification } from '../../../core/models/models';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      @for (toast of ts.toasts(); track toast.id) {
        <div class="toast {{ toastClass(toast) }} animate-slide-up"
             role="alert">
          <!-- Icon -->
          <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                      {{ iconBg(toast) }}">
            <span class="text-sm">{{ icon(toast) }}</span>
          </div>
          <!-- Text -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ toast.message }}</p>
            }
          </div>
          <!-- Close -->
          <button (click)="ts.remove(toast.id)"
                  class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                         transition-colors duration-150 ml-1">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  ts = inject(ToastService);

  toastClass(t: ToastNotification): string {
    const map: Record<string, string> = {
      success: 'toast-success',
      error:   'toast-error',
      info:    'toast-info',
      warning: 'toast-info',
    };
    return map[t.type] ?? 'toast-info';
  }

  iconBg(t: ToastNotification): string {
    const map: Record<string, string> = {
      success: 'bg-emerald-100 dark:bg-emerald-900/40',
      error:   'bg-red-100 dark:bg-red-900/40',
      info:    'bg-violet-100 dark:bg-violet-900/40',
      warning: 'bg-amber-100 dark:bg-amber-900/40',
    };
    return map[t.type] ?? '';
  }

  icon(t: ToastNotification): string {
    const map: Record<string, string> = {
      success: '✓', error: '✕', info: 'ℹ', warning: '⚠'
    };
    return map[t.type] ?? 'ℹ';
  }
}
