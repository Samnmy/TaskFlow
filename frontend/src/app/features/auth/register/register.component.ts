import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService }  from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50
                dark:from-[#0f0f1a] dark:via-[#12122a] dark:to-[#0f0f1a] px-4 py-12">

      <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-40"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div class="w-full max-w-md relative">
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-glow
                      flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Start managing tasks like a pro</p>
        </div>

        <div class="card p-8">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
              <input formControlName="username" type="text" id="reg-username" placeholder="Choose a username"
                     class="input-field" [class.ring-2]="isInvalid('username')" [class.ring-red-400]="isInvalid('username')">
              @if (isInvalid('username')) {
                <p class="mt-1 text-xs text-red-500">Username must be 3–50 characters</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input formControlName="email" type="email" id="reg-email" placeholder="your@email.com"
                     class="input-field" [class.ring-2]="isInvalid('email')" [class.ring-red-400]="isInvalid('email')">
              @if (isInvalid('email')) {
                <p class="mt-1 text-xs text-red-500">Please enter a valid email</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div class="relative">
                <input formControlName="password" [type]="showPwd() ? 'text' : 'password'"
                       id="reg-password" placeholder="At least 6 characters"
                       class="input-field pr-10" [class.ring-2]="isInvalid('password')" [class.ring-red-400]="isInvalid('password')">
                <button type="button" (click)="toggleShowPwd()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
              @if (isInvalid('password')) {
                <p class="mt-1 text-xs text-red-500">Password must be at least 6 characters</p>
              }
            </div>

            @if (errorMsg()) {
              <div class="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {{ errorMsg() }}
              </div>
            }

            <button type="submit" id="reg-submit" class="btn-primary w-full" [disabled]="loading()">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creating account...
              } @else {
                Create Account
              }
            </button>
          </form>

          <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?
            <a routerLink="/login" class="text-violet-600 dark:text-violet-400 font-semibold hover:text-violet-700 ml-1">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private toast  = inject(ToastService);
  private router = inject(Router);

  loading  = signal(false);
  showPwd  = signal(false);
  errorMsg = signal('');

  toggleShowPwd(): void { this.showPwd.update(v => !v); }

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const { username, email, password } = this.form.value;
    this.auth.register(username!, email!, password!).subscribe({
      next: () => {
        this.toast.success('Account created!', 'Please sign in to continue.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
