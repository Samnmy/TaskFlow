import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink }   from '@angular/router';
import { TaskService }  from '../../core/services/task.service';
import { AuthService }  from '../../core/services/auth.service';
import { TaskFormComponent } from '../tasks/task-form/task-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TaskFormComponent],
  template: `
    <div class="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Good {{ greeting() }}, <span class="text-gradient bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">{{ auth.currentUser()?.username }}</span> 👋
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Here's your productivity overview</p>
        </div>
        <button id="dash-create-task" class="btn-primary" (click)="showForm.set(true)">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          New Task
        </button>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <!-- Total -->
        <div class="stat-card col-span-1">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</span>
            <div class="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <svg class="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
          </div>
          <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ taskSvc.stats().total }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tasks created</span>
        </div>

        <!-- Pending -->
        <div class="stat-card col-span-1">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pending</span>
            <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ taskSvc.stats().pending }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">In progress</span>
        </div>

        <!-- Completed -->
        <div class="stat-card col-span-1">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Done</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ taskSvc.stats().completed }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Completed</span>
        </div>

        <!-- Overdue -->
        <div class="stat-card col-span-1">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Overdue</span>
            <div class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
          <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ taskSvc.stats().overdue }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Past due</span>
        </div>

        <!-- Upcoming -->
        <div class="stat-card col-span-1">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Due Soon</span>
            <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
          </div>
          <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ taskSvc.stats().upcoming }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Next 7 days</span>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Completion Progress -->
        <div class="card p-6 lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-semibold text-gray-900 dark:text-white">Overall Progress</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">Task completion rate</p>
            </div>
            <span class="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
              {{ taskSvc.stats().progress }}%
            </span>
          </div>
          <div class="progress-bar mb-3">
            <div class="progress-fill" [style.width.%]="taskSvc.stats().progress"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>{{ taskSvc.stats().completed }} completed</span>
            <span>{{ taskSvc.stats().total }} total</span>
          </div>

          <!-- Mini priority bars -->
          @if (taskSvc.stats().total > 0) {
            <div class="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3">
              @for (p of priorityBreakdown(); track p.label) {
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-gray-500 dark:text-gray-400">{{ p.label }}</span>
                    <span class="font-medium" [class]="p.color">{{ p.count }}</span>
                  </div>
                  <div class="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                    <div class="h-full rounded-full transition-all duration-700" [class]="p.barColor"
                         [style.width.%]="taskSvc.stats().total > 0 ? (p.count / taskSvc.stats().total) * 100 : 0"></div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Quick Actions -->
        <div class="card p-6">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <button class="w-full flex items-center gap-3 p-3 rounded-xl border border-violet-100 dark:border-violet-900/40
                           hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all duration-200 text-left group"
                    (click)="showForm.set(true)">
              <div class="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center
                          group-hover:bg-violet-200 dark:group-hover:bg-violet-900/60 transition-colors">
                <svg class="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">Create Task</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Add a new task</p>
              </div>
            </button>

            <a routerLink="/tasks" class="w-full flex items-center gap-3 p-3 rounded-xl border border-violet-100 dark:border-violet-900/40
                           hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all duration-200 text-left group">
              <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">View All Tasks</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ taskSvc.stats().total }} tasks total</p>
              </div>
            </a>

            <a routerLink="/inspector" class="w-full flex items-center gap-3 p-3 rounded-xl border border-violet-100 dark:border-violet-900/40
                           hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all duration-200 text-left group">
              <div class="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">API Inspector</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Live request console</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Recent Tasks -->
      @if (taskSvc.tasks().length > 0) {
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
            <a routerLink="/tasks" class="text-xs text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 transition-colors">View all →</a>
          </div>
          <div class="space-y-2">
            @for (task of taskSvc.tasks().slice(0, 5); track task.id) {
              <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-200"
                   [class.opacity-60]="task.status === 'COMPLETED'">
                <!-- Priority dot -->
                <div class="w-2 h-2 rounded-full flex-shrink-0" [class]="priorityDot(task.priority)"></div>
                <!-- Title -->
                <span class="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate"
                      [class.line-through]="task.status === 'COMPLETED'">{{ task.title }}</span>
                <!-- Status badge -->
                <span class="badge {{ statusBadge(task.status) }}">{{ task.status }}</span>
                <!-- Days -->
                <span class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {{ task.remainingDays >= 0 ? task.remainingDays + 'd left' : Math.abs(task.remainingDays) + 'd ago' }}
                </span>
              </div>
            }
          </div>
        </div>
      } @else {
        <!-- Empty state -->
        <div class="card p-12 text-center">
          <div class="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-2">No tasks yet</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">Create your first task to get started</p>
          <button class="btn-primary" (click)="showForm.set(true)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Create First Task
          </button>
        </div>
      }

      <!-- Task Create Form Modal -->
      @if (showForm()) {
        <app-task-form (close)="showForm.set(false)" />
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  taskSvc  = inject(TaskService);
  auth     = inject(AuthService);
  showForm = signal(false);
  Math = Math;

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 18) return 'afternoon';
    return 'evening';
  }

  ngOnInit(): void {
    this.taskSvc.loadTasks().subscribe();
  }

  priorityBreakdown() {
    const tasks = this.taskSvc.tasks();
    return [
      { label: 'Critical', count: tasks.filter(t => t.priority === 'CRITICAL').length, color: 'text-red-500', barColor: 'bg-red-400' },
      { label: 'High',     count: tasks.filter(t => t.priority === 'HIGH').length,     color: 'text-orange-500', barColor: 'bg-orange-400' },
      { label: 'Medium',   count: tasks.filter(t => t.priority === 'MEDIUM').length,   color: 'text-yellow-500', barColor: 'bg-yellow-400' },
      { label: 'Low',      count: tasks.filter(t => t.priority === 'LOW').length,      color: 'text-green-500', barColor: 'bg-green-400' },
    ];
  }

  priorityDot(p: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'bg-red-500', HIGH: 'bg-orange-400', MEDIUM: 'bg-yellow-400', LOW: 'bg-green-400'
    };
    return map[p] ?? 'bg-gray-300';
  }

  statusBadge(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'badge-pending', COMPLETED: 'badge-completed', OVERDUE: 'badge-overdue'
    };
    return map[s] ?? '';
  }
}
