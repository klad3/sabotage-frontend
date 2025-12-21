import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../admin-header/admin-header.component';

@Component({
    selector: 'app-admin-layout',
    imports: [RouterOutlet, AdminSidebarComponent, AdminHeaderComponent],
    template: `
        <div class="admin-layout">
            <app-admin-sidebar />
            <div class="admin-main">
                <app-admin-header />
                <main class="admin-content">
                    <router-outlet />
                </main>
            </div>
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
        }

        .admin-content {
            flex: 1;
            padding: 24px;
            overflow-y: auto;
        }

        @media (max-width: 768px) {
            .admin-main {
                margin-left: 0;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent { }
