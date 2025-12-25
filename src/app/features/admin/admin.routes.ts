import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component')
            .then(m => m.LoginComponent),
        title: 'SABOTAGE Admin - Login'
    },
    {
        path: '',
        loadComponent: () => import('./components/admin-layout/admin-layout.component')
            .then(m => m.AdminLayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard.component')
                    .then(m => m.DashboardComponent),
                title: 'SABOTAGE Admin - Dashboard'
            },
            {
                path: 'products',
                loadChildren: () => import('./pages/products/products.routes')
                    .then(m => m.PRODUCTS_ROUTES),
                title: 'SABOTAGE Admin - Productos'
            },
            {
                path: 'categories',
                loadComponent: () => import('./pages/categories/category-list/category-list.component')
                    .then(m => m.CategoryListComponent),
                title: 'SABOTAGE Admin - Categorías'
            },
            {
                path: 'discount-codes',
                loadComponent: () => import('./pages/discount-codes/discount-list/discount-list.component')
                    .then(m => m.DiscountListComponent),
                title: 'SABOTAGE Admin - Códigos de Descuento'
            },
            {
                path: 'subscribers',
                loadComponent: () => import('./pages/subscribers/subscriber-list/subscriber-list.component')
                    .then(m => m.SubscriberListComponent),
                title: 'SABOTAGE Admin - Suscriptores'
            },
            {
                path: 'orders',
                loadComponent: () => import('./pages/orders/order-list/order-list.component')
                    .then(m => m.OrderListComponent),
                title: 'SABOTAGE Admin - Órdenes'
            },
            {
                path: 'banners',
                loadComponent: () => import('./pages/banners/banner-list/banner-list.component')
                    .then(m => m.BannerListComponent),
                title: 'SABOTAGE Admin - Banners'
            },
            {
                path: 'settings',
                loadComponent: () => import('./pages/settings/site-settings/site-settings.component')
                    .then(m => m.SiteSettingsComponent),
                title: 'SABOTAGE Admin - Configuración'
            },
            {
                path: 'social-embeds',
                loadComponent: () => import('./pages/social-embeds/social-embed-list/social-embed-list.component')
                    .then(m => m.SocialEmbedListComponent),
                title: 'SABOTAGE Admin - Redes Sociales'
            }
        ]
    }
];
