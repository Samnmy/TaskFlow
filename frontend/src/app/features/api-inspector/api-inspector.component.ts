import { Component, inject, signal } from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FormsModule }          from '@angular/forms';
import { ApiInspectorService }  from '../../core/services/api-inspector.service';
import { ApiLog, HttpMethod }   from '../../core/models/models';

@Component({
  selector: 'app-api-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 max-w-full animate-fade-in h-full flex flex-col gap-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            API Inspector
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              LIVE
            </span>
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time request &amp; response visualization for every API call
          </p>
        </div>
        <div class="flex gap-2">
          <button class="btn-secondary text-sm py-2 px-3" (click)="inspector.togglePause()" id="pause-btn">
            @if (inspector.paused()) {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Resume
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Pause
            }
          </button>
          <button class="btn-ghost text-sm py-2 px-3" (click)="inspector.clearLogs()" id="clear-btn">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Clear
          </button>
        </div>
      </div>

      <!-- Metrics Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div class="card p-3 text-center col-span-1">
          <div class="text-xl font-bold text-gray-900 dark:text-white">{{ inspector.metrics().totalRequests }}</div>
          <div class="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Total</div>
        </div>
        <div class="card p-3 text-center col-span-1">
          <div class="text-xl font-bold text-emerald-500">{{ inspector.metrics().successfulRequests }}</div>
          <div class="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Success</div>
        </div>
        <div class="card p-3 text-center col-span-1">
          <div class="text-xl font-bold text-red-500">{{ inspector.metrics().failedRequests }}</div>
          <div class="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Failed</div>
        </div>
        <div class="card p-3 text-center col-span-1">
          <div class="text-xl font-bold text-violet-500">{{ inspector.metrics().averageResponseTimeMs }}<span class="text-sm font-normal">ms</span></div>
          <div class="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Avg Time</div>
        </div>
        <div class="card p-3 text-center col-span-1">
          <div class="text-xl font-bold text-amber-500">{{ inspector.metrics().slowestRequestMs }}<span class="text-sm font-normal">ms</span></div>
          <div class="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Slowest</div>
        </div>
        <div class="card p-3 text-center col-span-1">
          <div class="text-xl font-bold text-green-500">{{ inspector.metrics().fastestRequestMs }}<span class="text-sm font-normal">ms</span></div>
          <div class="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Fastest</div>
        </div>
        <div class="card p-3 text-center col-span-2">
          <div class="text-sm font-bold text-purple-500 truncate">{{ inspector.metrics().mostCalledEndpoint }}</div>
          <div class="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Top Endpoint</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card p-4 flex flex-wrap gap-3 items-center">
        <div class="relative flex-1 min-w-48">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" id="inspector-search" placeholder="Search endpoint or message..."
                 [(ngModel)]="searchVal" (ngModelChange)="inspector.searchFilter.set($event)"
                 class="input-field pl-9 py-2 text-sm">
        </div>

        <!-- Method filters -->
        <div class="flex gap-1.5 flex-wrap">
          @for (m of methods; track m) {
            <button class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border"
                    [class]="methodActive(m) ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300'"
                    (click)="setMethod(m)">{{ m }}</button>
          }
        </div>

        <!-- Status filters -->
        <div class="flex gap-1.5">
          @for (s of statuses; track s.label) {
            <button class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border"
                    [class]="statusActive(s.value) ? s.activeClass : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-300'"
                    (click)="setStatus(s.value)">{{ s.label }}</button>
          }
        </div>
      </div>

      <!-- Console + Detail Panel -->
      <div class="flex gap-4 flex-1 min-h-0">

        <!-- Log console -->
        <div class="flex-1 card overflow-hidden flex flex-col min-h-0">
          <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div class="flex gap-1.5">
              <div class="w-3 h-3 rounded-full bg-red-400"></div>
              <div class="w-3 h-3 rounded-full bg-amber-400"></div>
              <div class="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span class="text-xs font-mono text-gray-500 dark:text-gray-400 ml-2">
              API Console — {{ inspector.filteredLogs().length }} entries
            </span>
            @if (inspector.paused()) {
              <span class="ml-auto text-xs text-amber-500 font-semibold flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a1 1 0 00-1 1v10a1 1 0 002 0V5a1 1 0 00-1-1zm10 0a1 1 0 00-1 1v10a1 1 0 002 0V5a1 1 0 00-1-1z"/>
                </svg>
                PAUSED
              </span>
            }
          </div>

          <div class="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono">
            @if (inspector.filteredLogs().length === 0) {
              <div class="flex flex-col items-center justify-center h-full text-center py-16">
                <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400">No requests yet.</p>
                <p class="text-xs text-gray-400 dark:text-gray-600 mt-1">Perform any action to see live logs here.</p>
              </div>
            }

            @for (log of inspector.filteredLogs(); track log.id) {
              <div class="log-entry" [class.selected]="selectedLog()?.id === log.id" (click)="selectedLog.set(log)">
                <!-- Method badge -->
                <span class="flex-shrink-0 badge {{ methodBadge(log.method) }} text-[10px] w-14 justify-center">{{ log.method }}</span>

                <!-- Status code -->
                <span class="flex-shrink-0 text-xs font-bold w-10" [class]="statusColor(log.statusCode)">{{ log.statusCode }}</span>

                <!-- Endpoint -->
                <span class="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">{{ log.endpoint }}</span>

                <!-- Time -->
                <span class="flex-shrink-0 text-xs" [class]="timeColor(log.responseTimeMs)">{{ log.responseTimeMs }}ms</span>

                <!-- Timestamp -->
                <span class="flex-shrink-0 text-[10px] text-gray-400 dark:text-gray-600">{{ formatTime(log.timestamp) }}</span>

                <!-- Success/Error dot -->
                <div class="flex-shrink-0 w-2 h-2 rounded-full" [class]="log.success ? 'bg-green-400' : 'bg-red-400'"></div>
              </div>
            }
          </div>
        </div>

        <!-- Detail Panel -->
        @if (selectedLog()) {
          <div class="w-96 flex-shrink-0 card overflow-hidden flex flex-col animate-slide-up">
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div class="flex items-center gap-2">
                <span class="badge {{ methodBadge(selectedLog()!.method) }}">{{ selectedLog()!.method }}</span>
                <span class="text-xs font-mono text-gray-700 dark:text-gray-300 truncate max-w-40">{{ selectedLog()!.endpoint }}</span>
              </div>
              <button class="btn-ghost p-1.5 rounded-lg" (click)="selectedLog.set(null)">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-gray-100 dark:border-gray-800">
              @for (tab of tabs; track tab) {
                <button class="flex-1 py-2 text-xs font-medium transition-colors duration-200"
                        [class]="activeTab() === tab ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-500 -mb-px' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'"
                        (click)="activeTab.set(tab)">{{ tab }}</button>
              }
            </div>

            <!-- Tab Content -->
            <div class="flex-1 overflow-y-auto p-4 text-xs font-mono">

              @if (activeTab() === 'Info') {
                <div class="space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
                      <div class="text-[10px] text-gray-400 uppercase mb-1">Status</div>
                      <div class="font-bold text-sm" [class]="statusColor(selectedLog()!.statusCode)">{{ selectedLog()!.statusCode }}</div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
                      <div class="text-[10px] text-gray-400 uppercase mb-1">Time</div>
                      <div class="font-bold text-sm" [class]="timeColor(selectedLog()!.responseTimeMs)">{{ selectedLog()!.responseTimeMs }}ms</div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
                      <div class="text-[10px] text-gray-400 uppercase mb-1">Req Size</div>
                      <div class="font-semibold">{{ formatSize(selectedLog()!.requestSize) }}</div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
                      <div class="text-[10px] text-gray-400 uppercase mb-1">Res Size</div>
                      <div class="font-semibold">{{ formatSize(selectedLog()!.responseSize) }}</div>
                    </div>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
                    <div class="text-[10px] text-gray-400 uppercase mb-1">Message</div>
                    <div class="text-gray-700 dark:text-gray-300">{{ selectedLog()!.message }}</div>
                  </div>
                  @if (selectedLog()!.username) {
                    <div class="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3">
                      <div class="text-[10px] text-gray-400 uppercase mb-1">User</div>
                      <div class="text-violet-600 dark:text-violet-400">&#64;{{ selectedLog()!.username }}</div>
                    </div>
                  }
                </div>
              }

              @if (activeTab() === 'Request') {
                <div class="space-y-3">
                  <div>
                    <div class="text-[10px] text-gray-400 uppercase mb-2">Headers</div>
                    <div class="bg-gray-50 dark:bg-gray-900/60 rounded-lg p-3 space-y-1">
                      @for (h of objEntries(selectedLog()!.requestHeaders ?? {}); track h[0]) {
                        <div class="flex gap-2">
                          <span class="json-key">{{ h[0] }}:</span>
                          <span class="json-string break-all">{{ h[1] }}</span>
                        </div>
                      }
                    </div>
                  </div>
                  @if (selectedLog()!.requestBody) {
                    <div>
                      <div class="text-[10px] text-gray-400 uppercase mb-2">Body</div>
                      <pre class="bg-gray-50 dark:bg-gray-900/60 rounded-lg p-3 overflow-auto text-[11px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ formatJson(selectedLog()!.requestBody) }}</pre>
                    </div>
                  }
                </div>
              }

              @if (activeTab() === 'Response') {
                <div class="space-y-3">
                  @if (selectedLog()!.responseHeaders) {
                    <div>
                      <div class="text-[10px] text-gray-400 uppercase mb-2">Headers</div>
                      <div class="bg-gray-50 dark:bg-gray-900/60 rounded-lg p-3 space-y-1">
                        @for (h of objEntries(selectedLog()!.responseHeaders ?? {}); track h[0]) {
                          <div class="flex gap-2">
                            <span class="json-key">{{ h[0] }}:</span>
                            <span class="json-string">{{ h[1] }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                  @if (selectedLog()!.responseBody) {
                    <div>
                      <div class="text-[10px] text-gray-400 uppercase mb-2">Body</div>
                      <pre class="bg-gray-50 dark:bg-gray-900/60 rounded-lg p-3 overflow-auto text-[11px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ formatJson(selectedLog()!.responseBody) }}</pre>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ApiInspectorComponent {
  inspector   = inject(ApiInspectorService);
  selectedLog = signal<ApiLog | null>(null);
  activeTab   = signal<string>('Info');
  searchVal   = '';

  tabs    = ['Info', 'Request', 'Response'];
  methods = ['ALL', 'GET', 'POST', 'PUT', 'DELETE'] as const;
  statuses = [
    { label: 'All',  value: 'ALL', activeClass: 'bg-violet-600 text-white border-violet-600' },
    { label: '2xx',  value: '2xx', activeClass: 'bg-green-500 text-white border-green-500' },
    { label: '4xx',  value: '4xx', activeClass: 'bg-amber-500 text-white border-amber-500' },
    { label: '5xx',  value: '5xx', activeClass: 'bg-red-500 text-white border-red-500' },
  ];

  setMethod(m: string): void {
    this.inspector.methodFilter.set(m as HttpMethod | 'ALL');
  }
  setStatus(s: string): void {
    this.inspector.statusFilter.set(s);
  }
  methodActive(m: string): boolean { return this.inspector.methodFilter() === m; }
  statusActive(s: string): boolean { return this.inspector.statusFilter() === s; }

  methodBadge(m: HttpMethod): string {
    const map: Record<string, string> = {
      GET: 'badge-get', POST: 'badge-post', PUT: 'badge-put', DELETE: 'badge-delete', PATCH: 'badge-put'
    };
    return map[m] ?? 'badge';
  }

  statusColor(code: number): string {
    if (code >= 200 && code < 300) return 'text-green-500';
    if (code >= 400 && code < 500) return 'text-amber-500';
    if (code >= 500)               return 'text-red-500';
    return 'text-gray-500';
  }

  timeColor(ms: number): string {
    if (ms < 200)  return 'text-green-500';
    if (ms < 500)  return 'text-amber-500';
    return 'text-red-500';
  }

  formatTime(d: Date): string {
    return new Date(d).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    return `${(bytes / 1024).toFixed(1)}KB`;
  }

  formatJson(obj: unknown): string {
    try { return JSON.stringify(obj, null, 2); }
    catch { return String(obj); }
  }

  objEntries(obj: Record<string, string>): [string, string][] {
    return Object.entries(obj);
  }
}
