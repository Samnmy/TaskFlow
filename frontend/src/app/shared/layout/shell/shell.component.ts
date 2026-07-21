import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex h-screen overflow-hidden" [class.dark]="isDark()">
      <!-- ─── Sidebar ─── -->
      <aside class="w-64 flex-shrink-0 flex flex-col h-full
                    bg-white dark:bg-[#12121f]
                    border-r border-violet-100 dark:border-violet-900/40
                    transition-all duration-300">

        <!-- Logo -->
        <div class="px-6 pt-6 pb-4 flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-glow">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <span class="font-bold text-gray-900 dark:text-white text-sm tracking-tight">TaskFlow</span>
            <span class="block text-xs text-violet-500 font-medium">API</span>
          </div>
        </div>

        <!-- User pill -->
        <div class="mx-4 mb-4 px-3 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/40">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-600
                        flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {{ userInitial() }}
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{{ auth.currentUser()?.username }}</p>
              <p class="text-[10px] text-gray-500 dark:text-gray-500 truncate">{{ auth.currentUser()?.email }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 space-y-1">
          <a routerLink="/dashboard" routerLinkActive="active" class="sidebar-link">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 3v4M16 3v4"/>
            </svg>
            Dashboard
          </a>
          <a routerLink="/tasks" routerLinkActive="active" class="sidebar-link">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Tasks
            @if (taskSvc.stats().total > 0) {
              <span class="ml-auto text-[10px] font-bold bg-violet-500 text-white px-1.5 py-0.5 rounded-full">
                {{ taskSvc.stats().total }}
              </span>
            }
          </a>
          <a routerLink="/inspector" routerLinkActive="active" class="sidebar-link">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
            </svg>
            API Inspector
            <span class="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse-slow"></span>
          </a>
        </nav>

        <!-- Bottom actions -->
        <div class="p-3 border-t border-violet-100 dark:border-violet-900/40 space-y-1">
          <!-- Theme toggle -->
          <button (click)="toggleDark()" class="sidebar-link w-full">
            @if (isDark()) {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
              </svg>
              Light Mode
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
              Dark Mode
            }
          </button>
          <!-- Logout -->
          <button (click)="auth.logout()" class="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <!-- ─── Main Content ─── -->
      <main class="flex-1 overflow-y-auto bg-[var(--surface-bg)] transition-colors duration-300">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  auth    = inject(AuthService);
  taskSvc = inject(TaskService);
  isDark  = signal(false);

  userInitial(): string {
    return (this.auth.currentUser()?.username ?? 'U').charAt(0).toUpperCase();
  }

  toggleDark(): void {
    this.isDark.update(d => !d);
    // Also toggle on documentElement for Tailwind dark mode
    document.documentElement.classList.toggle('dark', !this.isDark());
    // Fix: we just toggled signal, now sync html class
    document.documentElement.classList.toggle('dark', this.isDark());
  }
}
