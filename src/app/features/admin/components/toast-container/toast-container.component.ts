import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ToastService, Toast } from '../../../../core/services/toast.service';

@Component({
    selector: 'app-toast-container',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="toast-container">
            @for (toast of toastService.toasts(); track toast.id) {
                <div 
                    class="toast"
                    [class.success]="toast.type === 'success'"
                    [class.error]="toast.type === 'error'"
                    [class.warning]="toast.type === 'warning'"
                    [class.info]="toast.type === 'info'"
                    (click)="toastService.remove(toast.id)"
                >
                    <span class="toast-icon">{{ getIcon(toast.type) }}</span>
                    <span class="toast-message">{{ toast.message }}</span>
                    <button class="toast-close" (click)="toastService.remove(toast.id); $event.stopPropagation()">
                        ✕
                    </button>
                </div>
            }
        </div>
    `,
    styles: [`
        .toast-container {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 400px;
        }

        .toast {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            animation: slideIn 0.3s ease-out;
            backdrop-filter: blur(10px);
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .toast.success {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9));
            border: 1px solid rgba(16, 185, 129, 0.5);
        }

        .toast.error {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));
            border: 1px solid rgba(239, 68, 68, 0.5);
        }

        .toast.warning {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9));
            border: 1px solid rgba(245, 158, 11, 0.5);
        }

        .toast.info {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9));
            border: 1px solid rgba(59, 130, 246, 0.5);
        }

        .toast-icon {
            font-size: 18px;
        }

        .toast-message {
            flex: 1;
            color: #fff;
            font-weight: 500;
            font-size: 14px;
            line-height: 1.4;
        }

        .toast-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: #fff;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: background 0.2s;
        }

        .toast-close:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 480px) {
            .toast-container {
                left: 16px;
                right: 16px;
                max-width: none;
            }
        }
    `]
})
export class ToastContainerComponent {
    readonly toastService = inject(ToastService);

    getIcon(type: string): string {
        const icons: Record<string, string> = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || 'ℹ';
    }
}
