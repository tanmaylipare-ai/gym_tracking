import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const storage = inject(StorageService);
  const auth    = inject(AuthService);

  const isAuthEndpoint = req.url.includes('/api/auth/login')
    || req.url.includes('/api/auth/register')
    || req.url.includes('/api/auth/refresh');

  const token = storage.getAccessToken();
  const authReq = (token && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // ── Handle 429 Too Many Requests ────────────────────────────────────
      if (err.status === 429) {
        const retryAfter = err.headers.get('Retry-After');
        const message = retryAfter 
          ? `Too many requests! Please wait ${retryAfter} second(s) before trying again.`
          : 'Too many requests. Please slow down.';

        // Quick native alert popup
        alert(message);

        return throwError(() => err);
      }

      // ── Handle 401 Unauthorized ─────────────────────────────────────────
      if (err.status === 401 && !isAuthEndpoint) {
        return auth.refresh().pipe(
          switchMap(res => {
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            });
            return next(retried);
          }),
          catchError(refreshErr => {
            auth.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => err);
    })
  );
};