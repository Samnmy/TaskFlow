import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { TaskService }   from '../../core/services/task.service';
import { ToastService }  from '../../core/services/toast.service';
import { Task, TaskPriority, TaskStatus } from '../../core/models/models';
import { TaskFormComponent }    from './task-form/task-form.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskFormComponent, ConfirmModalComponent],
  template: `
    <div class="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {{ taskSvc.filteredTasks().length }} of {{ taskSvc.tasks().length }} tasks
          </p>
        </div>
        <button id="tasks-create-btn" class="btn-primary" (click)="showCreate.set(true)">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          New Task
        </button>
      </div>

      <!-- Filters + Search -->
      <div class="card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <!-- Search -->
        <div class="relative flex-1 min-w-48">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" id="task-search" placeholder="Search tasks..."
                 [(ngModel)]="searchValue" (ngModelChange)="taskSvc.searchQuery.set($event)"
                 class="input-field pl-9 py-2 text-sm">
        </div>

        <!-- Status filter -->
        <select id="filter-status" class="input-field w-auto text-sm py-2"
                [(ngModel)]="statusValue" (ngModelChange)="taskSvc.filterStatus.set($event)">
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="OVERDUE">Overdue</option>
        </select>

        <!-- Priority filter -->
        <select id="filter-priority" class="input-field w-auto text-sm py-2"
                [(ngModel)]="priorityValue" (ngModelChange)="taskSvc.filterPriority.set($event)">
          <option value="ALL">All Priority</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <!-- Clear filters -->
        @if (statusValue !== 'ALL' || priorityValue !== 'ALL' || searchValue) {
          <button class="btn-ghost text-sm py-2" (click)="clearFilters()">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Clear
          </button>
        }
      </div>

      <!-- Task Grid -->
      @if (loading()) {
        <!-- Skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (s of [1,2,3,4,5,6]; track s) {
            <div class="card p-5 space-y-3">
              <div class="skeleton h-4 w-3/4 rounded"></div>
              <div class="skeleton h-3 w-1/2 rounded"></div>
              <div class="skeleton h-3 w-2/3 rounded"></div>
              <div class="flex gap-2 pt-2">
                <div class="skeleton h-6 w-16 rounded-full"></div>
                <div class="skeleton h-6 w-20 rounded-full"></div>
              </div>
            </div>
          }
        </div>
      } @else if (taskSvc.filteredTasks().length === 0) {
        <!-- Empty state -->
        <div class="card p-16 text-center">
          <div class="w-20 h-20 rounded-3xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-5">
            <svg class="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tasks found</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
            {{ taskSvc.tasks().length > 0 ? 'Try adjusting your filters.' : 'Create your first task to get started.' }}
          </p>
          @if (taskSvc.tasks().length === 0) {
            <button class="btn-primary" (click)="showCreate.set(true)">Create First Task</button>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (task of taskSvc.filteredTasks(); track task.id) {
            <div class="card p-5 flex flex-col gap-3 hover:scale-[1.01] transition-all duration-300 animate-fade-in cursor-default"
                 [class.opacity-70]="task.status === 'COMPLETED'"
                 [class.ring-2]="task.status === 'OVERDUE'"
                 [class.ring-red-300]="task.status === 'OVERDUE'"
                 [class.dark:ring-red-700]="task.status === 'OVERDUE'">

              <!-- Top Row: ID + Badges -->
              <div class="flex items-start justify-between gap-2">
                <span class="text-[10px] font-mono text-gray-400 dark:text-gray-600 truncate">
                  #{{ task.id.slice(0, 8) }}
                </span>
                <div class="flex gap-1.5 flex-shrink-0">
                  <span class="badge {{ priorityBadge(task.priority) }}">{{ task.priority }}</span>
                  <span class="badge {{ statusBadge(task.status) }}">{{ task.status }}</span>
                </div>
              </div>

              <!-- Title -->
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2"
                  [class.line-through]="task.status === 'COMPLETED'"
                  [class.text-gray-400]="task.status === 'COMPLETED'">
                {{ task.title }}
              </h3>

              <!-- Progress indicator for pending -->
              @if (task.status === 'PENDING' && task.remainingDays >= 0) {
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="daysProgress(task.remainingDays)"></div>
                </div>
              }

              <!-- Meta -->
              <div class="grid grid-cols-2 gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <div class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>Due {{ formatDate(task.dueDate) }}</span>
                </div>
                <div class="flex items-center gap-1" [class.text-red-500]="task.remainingDays < 0" [class.dark:text-red-400]="task.remainingDays < 0">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ task.remainingDays >= 0 ? task.remainingDays + 'd left' : Math.abs(task.remainingDays) + 'd overdue' }}</span>
                </div>
                <div class="flex items-center gap-1 col-span-2">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  <span>Created {{ formatDate(task.createdAt) }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 pt-1 border-t border-gray-100 dark:border-gray-800 mt-auto">
                <button id="edit-task-{{ task.id.slice(0,8) }}" class="btn-ghost flex-1 text-xs py-1.5" (click)="editTask.set(task)">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit
                </button>
                @if (task.status !== 'COMPLETED') {
                  <button class="btn-ghost flex-1 text-xs py-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          (click)="completeTask(task)">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    Done
                  </button>
                }
                <button id="delete-task-{{ task.id.slice(0,8) }}" class="btn-ghost flex-1 text-xs py-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        (click)="deleteTarget.set(task)">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Create/Edit Modal -->
      @if (showCreate()) {
        <app-task-form (close)="showCreate.set(false)" />
      }
      @if (editTask()) {
        <app-task-form [editTask]="editTask()" (close)="editTask.set(null)" />
      }

      <!-- Delete Confirm Modal -->
      @if (deleteTarget()) {
        <app-confirm-modal
          title="Delete Task"
          message="Are you sure you want to delete '{{ deleteTarget()!.title }}'? This action cannot be undone."
          confirmLabel="Delete Task"
          (cancel)="deleteTarget.set(null)"
          (confirm)="confirmDelete()" />
      }
    </div>
  `
})
export class TasksComponent implements OnInit {
  taskSvc    = inject(TaskService);
  toast      = inject(ToastService);
  showCreate = signal(false);
  editTask   = signal<Task | null>(null);
  deleteTarget = signal<Task | null>(null);
  loading    = signal(true);
  Math = Math;

  searchValue   = '';
  statusValue   = 'ALL';
  priorityValue = 'ALL';

  ngOnInit(): void {
    this.taskSvc.loadTasks().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }

  clearFilters(): void {
    this.searchValue = '';
    this.statusValue = 'ALL';
    this.priorityValue = 'ALL';
    this.taskSvc.searchQuery.set('');
    this.taskSvc.filterStatus.set('ALL');
    this.taskSvc.filterPriority.set('ALL');
  }

  completeTask(task: Task): void {
    this.taskSvc.updateTask(task.id, { title: task.title, dueDate: task.dueDate, status: 'COMPLETED' }).subscribe({
      next: () => this.toast.success('Task completed! ✓'),
      error: (e) => this.toast.error('Failed to complete task', e?.error?.message)
    });
  }

  confirmDelete(): void {
    const task = this.deleteTarget();
    if (!task) return;
    this.taskSvc.deleteTask(task.id).subscribe({
      next: () => { this.toast.success('Task deleted', task.title); this.deleteTarget.set(null); },
      error: (e) => { this.toast.error('Delete failed', e?.error?.message); this.deleteTarget.set(null); }
    });
  }

  priorityBadge(p: TaskPriority): string {
    const map: Record<string, string> = {
      CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium', LOW: 'badge-low'
    };
    return map[p] ?? '';
  }

  statusBadge(s: TaskStatus): string {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', COMPLETED: 'badge-completed', OVERDUE: 'badge-overdue'
    };
    return map[s] ?? '';
  }

  daysProgress(remaining: number): number {
    // Higher urgency = fuller bar (inverted logic for visual urgency)
    if (remaining <= 0) return 100;
    if (remaining >= 30) return 5;
    return Math.round(((30 - remaining) / 30) * 100);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
