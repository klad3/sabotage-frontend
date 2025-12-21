import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { SidebarService } from '../../../../core/services/sidebar.service';

@Component({
    selector: 'app-admin-header',
    imports: [],
    template: `
        <header class="admin-header">
            <div class="header-left">
                <button class="menu-btn" (click)="sidebarService.openMobile()">
                    ☰
                </button>
                <h1 class="page-title">Panel de Administración</h1>
            </div>
            <div class="header-right">
                <div class="user-info">
                    <span class="user-avatar">👤</span>
                    <span class="user-email">{{ authService.user()?.email }}</span>
                </div>
            </div>
        </header>
    `,
    styles: [`
        .admin-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            background: rgba(26, 26, 26, 0.95);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .menu-btn {
            display: none;
            width: 40px;
            height: 40px;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border-radius: 10px;
            cursor: pointer;
            font-size: 20px;
            transition: all 0.2s;
        }

        .menu-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .page-title {
            font-size: 18px;
            font-weight: 600;
            color: #fff;
            margin: 0;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 24px;
        }

        .user-avatar {
            font-size: 20px;
        }

        .user-email {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
        }

        @media (max-width: 768px) {
            .menu-btn {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .user-email {
                display: none;
            }

            .page-title {
                font-size: 16px;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminHeaderComponent {
    readonly authService = inject(AuthService);
    readonly sidebarService = inject(SidebarService);
}

