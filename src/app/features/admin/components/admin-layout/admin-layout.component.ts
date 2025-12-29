import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { ToastContainerComponent } from '../toast-container/toast-container.component';
import { SidebarService } from '../../../../core/services/sidebar.service';

@Component({
    selector: 'app-admin-layout',
    imports: [RouterOutlet, AdminSidebarComponent, AdminHeaderComponent, ToastContainerComponent],
    template: `
        <div class="admin-layout dark-section">
            <app-admin-sidebar />
            <div class="admin-main" [class.collapsed]="sidebarService.isCollapsed()">
                <app-admin-header />
                <main class="admin-content">
                    <router-outlet />
                </main>
            </div>
            <app-toast-container />
        </div>
    `,
    styles: [`
        .admin-layout {
            display: flex;
            min-height: 100vh;
            background: #0f0f0f;
        }

        .admin-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            margin-left: 260px;
            min-height: 100vh;
            transition: margin-left 0.3s ease;
        }

        .admin-main.collapsed {
            margin-left: 72px;
        }

        .admin-content {
            flex: 1;
            padding: 24px;
            overflow-y: auto;
        }

        @media (max-width: 768px) {
            .admin-layout {
                display: block;
            }

            .admin-main,
            .admin-main.collapsed {
                margin-left: 0;
                min-height: auto;
            }

            .admin-content {
                padding: 16px;
                overflow-x: auto;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent {
    readonly sidebarService = inject(SidebarService);
}

