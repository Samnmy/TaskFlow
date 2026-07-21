import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    <div class="modal-overlay" (click)="cancel.emit()">
      <div class="modal-panel" (click)="$event.stopPropagation()">
        <!-- Icon -->
        <div class="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 mx-auto">
          <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <!-- Content -->
        <div class="text-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{{ title() }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ message() }}</p>
        </div>
        <!-- Actions -->
        <div class="flex gap-3 justify-center">
          <button class="btn-secondary" (click)="cancel.emit()">Cancel</button>
          <button class="btn-danger" (click)="confirm.emit()">{{ confirmLabel() }}</button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmModalComponent {
  title        = input('Confirm Action');
  message      = input('Are you sure you want to proceed?');
  confirmLabel = input('Confirm');
  cancel       = output<void>();
  confirm      = output<void>();
}
