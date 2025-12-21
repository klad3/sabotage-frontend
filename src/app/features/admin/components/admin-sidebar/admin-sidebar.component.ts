import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ChangeDetectionStrategy } from '@angular/core';

interface NavItem {
    label: string;
    route: string;
    icon: string;
}

@Component({
    selector: 'app-admin-sidebar',
    imports: [RouterLink, RouterLinkActive],
    template: `
        <aside class="sidebar" [class.collapsed]="isCollapsed()">
            <div class="sidebar-header">
                <div class="logo">
                    <span class="logo-icon">🔥</span>
                    @if (!isCollapsed()) {
                        <span class="logo-text">SABOTAGE</span>
                    }
                </div>
                <button class="toggle-btn" (click)="toggleSidebar()">
                    {{ isCollapsed() ? '→' : '←' }}
                </button>
            </div>

            <nav class="sidebar-nav">
                @for (item of navItems; track item.route) {
                    <a 
                        [routerLink]="item.route" 
                        routerLinkActive="active"
                        [routerLinkActiveOptions]="{ exact: item.route === '/admin/dashboard' }"
                        class="nav-item"
                        [title]="item.label"
                    >
                        <span class="nav-icon">{{ item.icon }}</span>
                        @if (!isCollapsed()) {
                            <span class="nav-label">{{ item.label }}</span>
                        }
                    </a>
                }
            </nav>

            <div class="sidebar-footer">
                <button class="logout-btn" (click)="logout()" [title]="'Cerrar Sesión'">
                    <span class="nav-icon">🚪</span>
                    @if (!isCollapsed()) {
                        <span class="nav-label">Cerrar Sesión</span>
                    }
                </button>
            </div>
        </aside>
    `,
    styles: [`
        .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            width: 260px;
            height: 100vh;
            background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            transition: width 0.3s ease;
            z-index: 100;
        }

        .sidebar.collapsed {
            width: 72px;
        }

        .sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .logo-icon {
            font-size: 28px;
        }

        .logo-text {
            font-size: 20px;
            font-weight: 800;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: 2px;
        }

        .toggle-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .toggle-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-nav {
            flex: 1;
            padding: 16px 12px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 12px;
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            transition: all 0.2s;
        }

        .nav-item:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }

        .nav-item.active {
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(254, 202, 87, 0.2));
            color: #feca57;
            border: 1px solid rgba(254, 202, 87, 0.3);
        }

        .nav-icon {
            font-size: 20px;
            width: 24px;
            text-align: center;
        }

        .nav-label {
            font-size: 14px;
            font-weight: 500;
        }

        .sidebar-footer {
            padding: 16px 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            width: 100%;
            border: none;
            background: transparent;
            border-radius: 12px;
            color: rgba(255, 107, 107, 0.8);
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }

        .logout-btn:hover {
            background: rgba(255, 107, 107, 0.1);
            color: #ff6b6b;
        }

        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }

            .sidebar.open {
                transform: translateX(0);
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSidebarComponent {
    private readonly authService = inject(AuthService);

    readonly isCollapsed = signal(false);

    readonly navItems: NavItem[] = [
        { label: 'Dashboard', route: '/admin/dashboard', icon: '📊' },
        { label: 'Productos', route: '/admin/products', icon: '👕' },
        { label: 'Categorías', route: '/admin/categories', icon: '📁' },
        { label: 'Descuentos', route: '/admin/discount-codes', icon: '🏷️' },
        { label: 'Suscriptores', route: '/admin/subscribers', icon: '📧' },
        { label: 'Órdenes', route: '/admin/orders', icon: '📦' }
    ];

    toggleSidebar(): void {
        this.isCollapsed.update(v => !v);
    }

    logout(): void {
        this.authService.logout();
    }
}
