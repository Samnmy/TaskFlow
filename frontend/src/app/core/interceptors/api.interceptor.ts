import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError, throwError } from 'rxjs';
import { AuthService }         from '../services/auth.service';
import { ApiInspectorService } from '../services/api-inspector.service';
import { ApiLog, HttpMethod }  from '../models/models';

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth      = inject(AuthService);
  const inspector = inject(ApiInspectorService);

  const token     = auth.getToken();
  const startTime = performance.now();

  // Attach JWT token to every request if available
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  const reqBodyStr = JSON.stringify(authReq.body ?? {});
  const reqSize    = new Blob([reqBodyStr]).size;

  return next(authReq).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const elapsed    = Math.round(performance.now() - startTime);
        const resBodyStr = JSON.stringify(event.body ?? {});
        const resSize    = new Blob([resBodyStr]).size;

        const log: ApiLog = {
          id:              crypto.randomUUID(),
          method:          authReq.method as HttpMethod,
          endpoint:        authReq.url.replace('http://localhost:8080', ''),
          timestamp:       new Date(),
          responseTimeMs:  elapsed,
          statusCode:      event.status,
          success:         event.status >= 200 && event.status < 300,
          username:        auth.currentUser()?.username,
          requestSize:     reqSize,
          responseSize:    resSize,
          message:         buildMessage(authReq.method, authReq.url, event.status),
          requestHeaders:  buildHeaders(authReq, token),
          requestBody:     authReq.body,
          responseBody:    event.body,
          responseHeaders: {
            'Content-Type':   event.headers.get('Content-Type') ?? 'application/json',
            'Status':         String(event.status),
            'X-Execution-Time': `${elapsed}ms`,
          },
        };
        inspector.addLog(log);
      }
    }),
    catchError((err: HttpErrorResponse) => {
      const elapsed = Math.round(performance.now() - startTime);
      const log: ApiLog = {
        id:             crypto.randomUUID(),
        method:         authReq.method as HttpMethod,
        endpoint:       authReq.url.replace('http://localhost:8080', ''),
        timestamp:      new Date(),
        responseTimeMs: elapsed,
        statusCode:     err.status,
        success:        false,
        username:       auth.currentUser()?.username,
        requestSize:    reqSize,
        responseSize:   new Blob([JSON.stringify(err.error ?? {})]).size,
        message:        err.error?.message ?? err.message ?? 'Request failed',
        requestHeaders: buildHeaders(authReq, token),
        requestBody:    authReq.body,
        responseBody:   err.error,
      };
      inspector.addLog(log);
      return throwError(() => err);
    })
  );
};

function buildMessage(method: string, url: string, status: number): string {
  const path = url.replace('http://localhost:8080/api', '').split('?')[0];
  const messages: Record<string, Record<string, string>> = {
    'POST':   { '/auth/register': 'User registered successfully', '/auth/login': 'Login successful', '/tasks': 'Task created successfully' },
    'GET':    { '/tasks': 'Tasks fetched successfully', '/profile': 'Profile loaded' },
    'PUT':    { '/tasks': 'Task updated successfully' },
    'DELETE': { '/tasks': 'Task deleted successfully' },
  };
  const baseKey = Object.keys(messages[method] ?? {}).find(k => path.startsWith(k));
  return messages[method]?.[baseKey ?? ''] ?? `${method} ${path} → ${status}`;
}

function buildHeaders(req: HttpRequest<unknown>, token: string | null): Record<string, string> {
  const masked = token ? `Bearer ${token.slice(0, 12)}•••${token.slice(-8)}` : 'None';
  return {
    'Authorization': masked,
    'Content-Type':  req.headers.get('Content-Type') ?? 'application/json',
    'Accept':        'application/json',
  };
}
