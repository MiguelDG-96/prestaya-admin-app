import { HttpInterceptorFn, HttpErrorResponse, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, filter, take, BehaviorSubject, throwError } from 'rxjs';

export const IS_RETRY_REQUEST = new HttpContextToken<boolean>(() => false);

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
    return next(req);
  }

  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => {
        const retryRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          },
          context: req.context.set(IS_RETRY_REQUEST, true)
        });
        return next(retryRequest);
      })
    );
  }

  const token = localStorage.getItem('auth_token');
  let request = req;

  if (token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (req.context.get(IS_RETRY_REQUEST)) {
          authService.logout();
          return throwError(() => error);
        }

        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          authService.logout();
          return throwError(() => error);
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken(refreshToken).pipe(
            switchMap((newAuth) => {
              isRefreshing = false;
              refreshTokenSubject.next(newAuth.token);
              
              const retryRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAuth.token}`
                },
                context: req.context.set(IS_RETRY_REQUEST, true)
              });
              return next(retryRequest);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              refreshTokenSubject.next(null);
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => {
              const retryRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`
                },
                context: req.context.set(IS_RETRY_REQUEST, true)
              });
              return next(retryRequest);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};
