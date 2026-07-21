import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, User } from '../models/models';

const API_BASE = 'http://localhost:8080/api';
const TOKEN_KEY = 'tf_token';
const USER_KEY  = 'tf_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  currentUser = signal<User | null>(this._loadUser());
  isLoggedIn  = signal<boolean>(!!this._loadToken());

  constructor(private http: HttpClient, private router: Router) {}

  register(username: string, email: string, password: string): Observable<unknown> {
    return this.http.post(`${API_BASE}/auth/register`, { username, email, password });
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        const user: User = { id: res.id, username: res.username, email: res.email };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private _loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private _loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
