import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private readonly _toasts = signal<Toast[]>([]);
    readonly toasts = this._toasts.asReadonly();

    show(message: string, type: ToastType = 'info', duration = 4000): void {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const toast: Toast = { id, message, type, duration };

        this._toasts.update(toasts => [...toasts, toast]);

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    success(message: string, duration = 4000): void {
        this.show(message, 'success', duration);
    }

    error(message: string, duration = 5000): void {
        this.show(message, 'error', duration);
    }

    warning(message: string, duration = 4000): void {
        this.show(message, 'warning', duration);
    }

    info(message: string, duration = 4000): void {
        this.show(message, 'info', duration);
    }

    remove(id: string): void {
        this._toasts.update(toasts => toasts.filter(t => t.id !== id));
    }

    clear(): void {
        this._toasts.set([]);
    }
}
