import { Injectable, signal } from '@angular/core';
import { ToastNotification } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastNotification[]>([]);

  private show(type: ToastNotification['type'], title: string, message: string): void {
    const id = crypto.randomUUID();
    this.toasts.update(t => [...t, { id, type, title, message }]);
    // Auto-remove after 4s
    setTimeout(() => this.remove(id), 4000);
  }

  success(title: string, message = ''): void { this.show('success', title, message); }
  error(title: string, message = ''):   void { this.show('error',   title, message); }
  info(title: string, message = ''):    void { this.show('info',    title, message); }
  warning(title: string, message = ''): void { this.show('warning', title, message); }

  remove(id: string): void {
    this.toasts.update(t => t.filter(n => n.id !== id));
  }
}
