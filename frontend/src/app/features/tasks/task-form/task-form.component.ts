import { Component, inject, output, input, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService }  from '../../../core/services/task.service';
import { ToastService } from '../../../core/services/toast.service';
import { Task } from '../../../core/models/models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-panel w-full max-w-lg" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ editTask() ? 'Edit Task' : 'New Task' }}
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Priority is calculated automatically from due date
            </p>
          </div>
          <button (click)="close.emit()" class="btn-ghost p-2 rounded-xl">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Task Title</label>
            <input formControlName="title" type="text" id="task-title" placeholder="What needs to be done?"
                   class="input-field" [class.ring-red-400]="isInvalid('title')" [class.ring-2]="isInvalid('title')">
            @if (isInvalid('title')) {
              <p class="mt-1 text-xs text-red-500">Please enter a task title</p>
            }
          </div>

          <!-- Due Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Due Date</label>
            <input formControlName="dueDate" type="date" id="task-due-date"
                   class="input-field" [class.ring-red-400]="isInvalid('dueDate')" [class.ring-2]="isInvalid('dueDate')">
            @if (isInvalid('dueDate')) {
              <p class="mt-1 text-xs text-red-500">Please select a due date</p>
            }
          </div>

          <!-- Status (edit only) -->
          @if (editTask()) {
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select formControlName="status" id="task-status" class="input-field">
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          }

          <!-- Priority preview -->
          @if (previewPriority()) {
            <div class="flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40">
              <svg class="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-xs text-violet-700 dark:text-violet-300">
                Auto priority: <strong>{{ previewPriority() }}</strong> ({{ previewDays() }} days remaining)
              </span>
            </div>
          }

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button type="button" class="btn-secondary flex-1" (click)="close.emit()">Cancel</button>
            <button type="submit" id="task-submit" class="btn-primary flex-1" [disabled]="loading()">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving...
              } @else {
                {{ editTask() ? 'Update Task' : 'Create Task' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private taskSvc = inject(TaskService);
  private toast   = inject(ToastService);

  editTask = input<Task | null>(null);
  close    = output<void>();
  loading  = signal(false);

  form = this.fb.group({
    title:   ['', [Validators.required, Validators.maxLength(255)]],
    dueDate: ['', Validators.required],
    status:  ['PENDING'],
  });

  ngOnInit(): void {
    const task = this.editTask();
    if (task) {
      const dateStr = new Date(task.dueDate).toISOString().split('T')[0];
      this.form.patchValue({ title: task.title, dueDate: dateStr, status: task.status });
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  previewDays(): number {
    const raw = this.form.get('dueDate')?.value;
    if (!raw) return 0;
    const due = new Date(raw);
    const now = new Date();
    return Math.ceil((due.getTime() - now.setHours(0,0,0,0)) / 86400000);
  }

  previewPriority(): string {
    const days = this.previewDays();
    if (!this.form.get('dueDate')?.value) return '';
    if (days < 7)  return 'CRITICAL 🔴';
    if (days <= 14) return 'HIGH 🟠';
    if (days <= 30) return 'MEDIUM 🟡';
    return 'LOW 🟢';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const { title, dueDate, status } = this.form.value;
    const dueDateIso = new Date(dueDate! + 'T12:00:00Z').toISOString();
    const task = this.editTask();

    if (task) {
      this.taskSvc.updateTask(task.id, { title: title!, dueDate: dueDateIso, status: status as any }).subscribe({
        next: () => { this.toast.success('Task updated!'); this.close.emit(); },
        error: (e) => { this.toast.error('Update failed', e?.error?.message); this.loading.set(false); }
      });
    } else {
      this.taskSvc.createTask({ title: title!, dueDate: dueDateIso }).subscribe({
        next: () => { this.toast.success('Task created!', title!); this.close.emit(); },
        error: (e) => { this.toast.error('Create failed', e?.error?.message); this.loading.set(false); }
      });
    }
  }
}
