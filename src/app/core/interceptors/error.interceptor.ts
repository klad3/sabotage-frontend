import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastService = inject(ToastService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let message = 'Ocurrió un error desconocido';

            // Don't show toast for 404s on checking products/categories if handled elsewhere
            // But generally good to protect.

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                message = `Error: ${error.error.message}`;
            } else {
                // Server-side error
                switch (error.status) {
                    case 400:
                        message = error.error?.message || 'Solicitud incorrecta.';
                        break;
                    case 401:
                        message = 'Tu sesión ha expirado. Por favor ingresa nuevamente.';
                        // Optional: Navigate to login if admin route
                        break;
                    case 403:
                        message = 'No tienes permiso para realizar esta acción.';
                        break;
                    case 404:
                        message = 'El recurso solicitado no fue encontrado.';
                        break;
                    case 422:
                        message = error.error?.message || 'Error de validación.';
                        break;
                    case 500:
                        message = 'Error interno del servidor. Inténtalo más tarde.';
                        break;
                    case 503:
                        message = 'Servicio no disponible temporalmente.';
                        break;
                    default:
                        message = `Error ${error.status}: ${error.statusText || 'Desconocido'}`;
                }
            }

            // Avoid showing toasts for "expected" 404s if the app handles them (like product not found -> redirect)
            // For now, we show them to be safe/explicit.

            toastService.error(message);
            console.error('HTTP Error caught by interceptor:', error);

            return throwError(() => error);
        })
    );
};
