import { Injectable, signal, computed } from '@angular/core';
import { ApiLog, ApiMetrics, HttpMethod } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiInspectorService {

  private _logs = signal<ApiLog[]>([]);
  private _paused = signal<boolean>(false);

  // Public signals
  logs    = this._logs.asReadonly();
  paused  = this._paused.asReadonly();

  // Filter state
  methodFilter = signal<HttpMethod | 'ALL'>('ALL');
  statusFilter = signal<string>('ALL');   // 'ALL', '2xx', '4xx', '5xx'
  searchFilter = signal<string>('');

  filteredLogs = computed(() => {
    let result = this._logs();
    const method = this.methodFilter();
    const status = this.statusFilter();
    const search = this.searchFilter().toLowerCase().trim();

    if (method !== 'ALL')  result = result.filter(l => l.method === method);
    if (status === '2xx')  result = result.filter(l => l.statusCode >= 200 && l.statusCode < 300);
    if (status === '4xx')  result = result.filter(l => l.statusCode >= 400 && l.statusCode < 500);
    if (status === '5xx')  result = result.filter(l => l.statusCode >= 500);
    if (search)            result = result.filter(l =>
      l.endpoint.toLowerCase().includes(search) || l.message.toLowerCase().includes(search)
    );
    return result;
  });

  metrics = computed<ApiMetrics>(() => {
    const all = this._logs();
    if (!all.length) {
      return {
        totalRequests: 0, successfulRequests: 0, failedRequests: 0,
        averageResponseTimeMs: 0, slowestRequestMs: 0, fastestRequestMs: 0,
        mostCalledEndpoint: '—', lastRequest: undefined
      };
    }

    const successful = all.filter(l => l.success).length;
    const times      = all.map(l => l.responseTimeMs);
    const avg        = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const slowest    = Math.max(...times);
    const fastest    = Math.min(...times);

    // Most called endpoint (without ID fragments)
    const endpointCounts: Record<string, number> = {};
    all.forEach(l => {
      const base = l.endpoint.replace(/\/[0-9a-f-]{36}$/i, '/{id}');
      endpointCounts[base] = (endpointCounts[base] ?? 0) + 1;
    });
    const mostCalled = Object.entries(endpointCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

    return {
      totalRequests:       all.length,
      successfulRequests:  successful,
      failedRequests:      all.length - successful,
      averageResponseTimeMs: avg,
      slowestRequestMs:    slowest,
      fastestRequestMs:    fastest,
      mostCalledEndpoint:  mostCalled,
      lastRequest:         all[0]?.timestamp,
    };
  });

  addLog(log: ApiLog): void {
    if (this._paused()) return;
    // Prepend newest logs at top, keep max 200
    this._logs.update(logs => [log, ...logs].slice(0, 200));
  }

  togglePause(): void {
    this._paused.update(p => !p);
  }

  clearLogs(): void {
    this._logs.set([]);
  }
}
