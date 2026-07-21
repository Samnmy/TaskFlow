import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService }  from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50
                dark:from-[#0f0f1a] dark:via-[#12122a] dark:to-[#0f0f1a] px-4 py-12">

      <!-- Background blobs -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl opacity-40"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div class="w-full max-w-md relative">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-glow
                      flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your TaskFlow account</p>
        </div>

        <!-- Card -->
        <div class="card p-8">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">

            <!-- Username -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
              <input formControlName="username" type="text" id="login-username" placeholder="Enter your username"
                     class="input-field" [class.ring-2]="isInvalid('username')" [class.ring-red-400]="isInvalid('username')">
              @if (isInvalid('username')) {
                <p class="mt-1 text-xs text-red-500">Username is required</p>
              }
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div class="relative">
                <input formControlName="password" [type]="showPwd() ? 'text' : 'password'"
                       id="login-password" placeholder="Enter your password"
                       class="input-field pr-10" [class.ring-2]="isInvalid('password')" [class.ring-red-400]="isInvalid('password')">
                <button type="button" (click)="toggleShowPwd()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    @if (showPwd()) {
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    } @else {
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    }
                  </svg>
                </button>
              </div>
              @if (isInvalid('password')) {
                <p class="mt-1 text-xs text-red-500">Password is required</p>
              }
            </div>

            <!-- Error message -->
            @if (errorMsg()) {
              <div class="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {{ errorMsg() }}
              </div>
            }

            <!-- Submit -->
            <button type="submit" id="login-submit" class="btn-primary w-full" [disabled]="loading()">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <!-- Register link -->
          <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?
            <a routerLink="/register" class="text-violet-600 dark:text-violet-400 font-semibold hover:text-violet-700 ml-1">Create one</a>
          </p>
        </div>

        <!-- API hint -->
        <p class="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
          Every action is logged live in the <span class="text-violet-500 font-medium">API Inspector</span>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private toast  = inject(ToastService);
  private router = inject(Router);

  loading  = signal(false);
  showPwd  = signal(false);
  errorMsg = signal('');

  toggleShowPwd(): void { this.showPwd.update(v => !v); }

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => {
        this.toast.success('Welcome back!', `Logged in as ${username}`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message ?? 'Invalid credentials. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
