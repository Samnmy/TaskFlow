import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Task, TaskCreatePayload, TaskUpdatePayload, DashboardStats, TaskStatus } from '../models/models';

const API_BASE = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class TaskService {

  tasks = signal<Task[]>([]);

  // Filter/search state
  filterStatus   = signal<TaskStatus | 'ALL'>('ALL');
  filterPriority = signal<string>('ALL');
  searchQuery    = signal<string>('');

  // Derived filtered task list
  filteredTasks = computed(() => {
    let result = this.tasks();
    const status   = this.filterStatus();
    const priority = this.filterPriority();
    const query    = this.searchQuery().toLowerCase().trim();

    if (status   !== 'ALL') result = result.filter(t => t.status   === status);
    if (priority !== 'ALL') result = result.filter(t => t.priority === priority);
    if (query)              result = result.filter(t => t.title.toLowerCase().includes(query));
    return result;
  });

  // Dashboard statistics
  stats = computed<DashboardStats>(() => {
    const all = this.tasks();
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const total     = all.length;
    const completed = all.filter(t => t.status === 'COMPLETED').length;
    const pending   = all.filter(t => t.status === 'PENDING').length;
    const overdue   = all.filter(t => t.status === 'OVERDUE').length;
    const upcoming  = all.filter(t => {
      const due = new Date(t.dueDate);
      return t.status === 'PENDING' && due <= in7Days && due >= now;
    }).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, overdue, upcoming, progress };
  });

  constructor(private http: HttpClient) {}

  loadTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${API_BASE}/tasks`).pipe(
      tap(tasks => this.tasks.set(tasks))
    );
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${API_BASE}/tasks/${id}`);
  }

  createTask(payload: TaskCreatePayload): Observable<Task> {
    return this.http.post<Task>(`${API_BASE}/tasks`, payload).pipe(
      tap(newTask => this.tasks.update(tasks => [newTask, ...tasks]))
    );
  }

  updateTask(id: string, payload: TaskUpdatePayload): Observable<Task> {
    return this.http.put<Task>(`${API_BASE}/tasks/${id}`, payload).pipe(
      tap(updated => this.tasks.update(tasks =>
        tasks.map(t => t.id === id ? updated : t)
      ))
    );
  }

  deleteTask(id: string): Observable<unknown> {
    return this.http.delete(`${API_BASE}/tasks/${id}`).pipe(
      tap(() => this.tasks.update(tasks => tasks.filter(t => t.id !== id)))
    );
  }
}
