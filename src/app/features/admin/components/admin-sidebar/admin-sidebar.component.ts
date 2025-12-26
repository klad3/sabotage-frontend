import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { filter } from 'rxjs';

interface NavItem {
    label: string;
    route: string;
    icon: string;
}

interface NavGroup {
    title: string;
    icon: string;
    items: NavItem[];
}

@Component({
    selector: 'app-admin-sidebar',
    imports: [RouterLink, RouterLinkActive],
    template: `
        <!-- Mobile backdrop -->
        @if (sidebarService.isMobileOpen()) {
            <div class="backdrop" (click)="sidebarService.closeMobile()"></div>
        }

        <aside 
            class="sidebar" 
            [class.collapsed]="sidebarService.isCollapsed()"
            [class.mobile-open]="sidebarService.isMobileOpen()"
        >
            <div class="sidebar-header">
                <div class="logo">
                    <span class="logo-icon">🔥</span>
                    @if (!sidebarService.isCollapsed()) {
                        <span class="logo-text">SABOTAGE</span>
                    }
                </div>
                <button class="toggle-btn desktop-only" (click)="sidebarService.toggle()">
                    {{ sidebarService.isCollapsed() ? '→' : '←' }}
                </button>
                <button class="close-btn mobile-only" (click)="sidebarService.closeMobile()">
                    ✕
                </button>
            </div>

            <nav class="sidebar-nav">
                @for (group of navGroups; track group.title) {
                    <div class="nav-group">
                        @if (!sidebarService.isCollapsed()) {
                            <div class="group-title">
                                <span class="group-icon">{{ group.icon }}</span>
                                {{ group.title }}
                            </div>
                        } @else {
                            <div class="group-separator"></div>
                        }
                        @for (item of group.items; track item.route) {
                            <a 
                                [routerLink]="item.route" 
                                routerLinkActive="active"
                                [routerLinkActiveOptions]="{ exact: item.route === '/admin/dashboard' }"
                                class="nav-item"
                                [title]="item.label"
                            >
                                <span class="nav-icon">{{ item.icon }}</span>
                                @if (!sidebarService.isCollapsed()) {
                                    <span class="nav-label">{{ item.label }}</span>
                                }
                            </a>
                        }
                    </div>
                }
            </nav>

            <div class="sidebar-footer">
                <button class="logout-btn" (click)="logout()" [title]="'Cerrar Sesión'">
                    <span class="nav-icon">🚪</span>
                    @if (!sidebarService.isCollapsed()) {
                        <span class="nav-label">Cerrar Sesión</span>
                    }
                </button>
            </div>
        </aside>
    `,
    styles: [`
        .backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 99;
            animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

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
            transition: width 0.3s ease, transform 0.3s ease;
            z-index: 100;
        }

        .sidebar.collapsed {
            width: 72px;
        }

        /* Mobile: hidden by default */
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
                width: 280px;
            }

            .sidebar.mobile-open {
                transform: translateX(0);
            }

            .desktop-only {
                display: none !important;
            }
        }

        @media (min-width: 769px) {
            .mobile-only {
                display: none !important;
            }
        }

        .sidebar-header {
            padding: 1.25rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .logo-icon {
            font-size: 1.5rem;
        }

        .logo-text {
            font-size: 1.25rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .toggle-btn, .close-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #fff;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }

        .toggle-btn:hover, .close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-nav {
            flex: 1;
            overflow-y: auto;
            padding: 0.75rem 0;
        }

        .nav-group {
            margin-bottom: 0.5rem;
        }

        .group-title {
            padding: 0.5rem 1.25rem;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #888;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .group-icon {
            font-size: 0.8rem;
        }

        .group-separator {
            height: 1px;
            background: rgba(255, 255, 255, 0.1);
            margin: 0.5rem 1rem;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1.25rem;
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            transition: all 0.2s;
            border-left: 3px solid transparent;
        }

        .nav-item:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #fff;
        }

        .nav-item.active {
            background: rgba(0, 217, 255, 0.1);
            color: #00d9ff;
            border-left-color: #00d9ff;
        }

        .nav-icon {
            font-size: 1.25rem;
            width: 24px;
            text-align: center;
        }

        .nav-label {
            font-size: 0.9rem;
            font-weight: 500;
        }

        .sidebar-footer {
            padding: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(255, 100, 100, 0.1);
            border: none;
            border-radius: 8px;
            color: #ff6464;
            cursor: pointer;
            transition: background 0.2s;
        }

        .logout-btn:hover {
            background: rgba(255, 100, 100, 0.2);
        }

        .sidebar.collapsed .nav-item {
            justify-content: center;
            padding: 0.75rem;
        }

        .sidebar.collapsed .logout-btn {
            justify-content: center;
        }

        .sidebar.collapsed .group-title {
            display: none;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSidebarComponent {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    readonly sidebarService = inject(SidebarService);

    readonly navGroups: NavGroup[] = [
        {
            title: 'General',
            icon: '📊',
            items: [
                { label: 'Dashboard', route: '/admin/dashboard', icon: '🏠' }
            ]
        },
        {
            title: 'Tienda',
            icon: '🛒',
            items: [
                { label: 'Productos', route: '/admin/products', icon: '👕' },
                { label: 'Categorías', route: '/admin/categories', icon: '📁' },
                { label: 'Órdenes', route: '/admin/orders', icon: '📦' },
                { label: 'Descuentos', route: '/admin/discount-codes', icon: '🏷️' }
            ]
        },
        {
            title: 'Clientes',
            icon: '👥',
            items: [
                { label: 'Suscriptores', route: '/admin/subscribers', icon: '📧' },
                { label: 'Reseñas', route: '/admin/reviews', icon: '💬' }
            ]
        },
        {
            title: 'Apariencia',
            icon: '🎨',
            items: [
                { label: 'Banners', route: '/admin/banners', icon: '🖼️' },
                { label: 'Redes Sociales', route: '/admin/social-embeds', icon: '📱' },
                { label: 'Quiénes Somos', route: '/admin/about-page', icon: '📝' },
                { label: 'Configuración', route: '/admin/settings', icon: '⚙️' }
            ]
        }
    ];

    constructor() {
        // Close mobile sidebar on navigation
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.sidebarService.closeMobile();
        });
    }

    logout(): void {
        this.authService.logout();
    }
}
