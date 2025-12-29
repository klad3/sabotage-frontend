import { ErrorHandler, Injectable, inject, Injector } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private readonly injector = inject(Injector);

    handleError(error: any): void {
        const toastService = this.injector.get(ToastService);
        const chunkFailedMessage = /Loading chunk [\d]+ failed/;

        // Log the full error to console for debugging
        console.error('An unexpected error occurred:', error);

        // Check if it's a chunk load error (network issue updating app)
        if (chunkFailedMessage.test(error.message)) {
            toastService.error('Nueva versión disponible. Recargando...', 3000);
            setTimeout(() => window.location.reload(), 3000);
            return;
        }

        // Generic user-friendly message for other unhandled errors
        // We avoid showing tech details to the user unless in dev mode (which we assume is production-like here)
        toastService.error('Ocurrió un error inesperado al procesar tu solicitud.');
    }
}
