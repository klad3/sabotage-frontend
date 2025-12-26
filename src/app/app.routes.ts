import { Routes } from '@angular/router';

export const routes: Routes = [
    // Public routes - wrapped in layout with header/footer
    {
        path: '',
        loadComponent: () => import('./shared/components/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
                title: 'SABOTAGE - Moda Urbana'
            },
            {
                path: 'oversize',
                loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
                title: 'SABOTAGE - Polos Oversize',
                data: {
                    category: 'oversize',
                    title: 'POLOS OVERSIZE',
                    subtitle: 'Descubre nuestra colección de polos con estilo urbano'
                }
            },
            {
                path: 'polos-clasicos',
                loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
                title: 'SABOTAGE - Polos Clásicos',
                data: {
                    category: 'clasico',
                    title: 'POLOS CLÁSICOS',
                    subtitle: 'El estilo clásico que nunca pasa de moda'
                }
            },
            {
                path: 'totebags',
                loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
                title: 'SABOTAGE - Totebags',
                data: {
                    category: 'totebags',
                    title: 'TOTEBAGS',
                    subtitle: 'Bolsos urbanos para el día a día'
                }
            },
            {
                path: 'poleras',
                loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
                title: 'SABOTAGE - Poleras',
                data: {
                    category: 'poleras',
                    title: 'POLERAS',
                    subtitle: 'Abrigo con estilo urbano'
                }
            },
            {
                path: 'gorros',
                loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
                title: 'SABOTAGE - Gorros',
                data: {
                    category: 'gorros',
                    title: 'GORROS',
                    subtitle: 'Completa tu look urbano'
                }
            },
            {
                path: 'producto/:slug',
                loadComponent: () => import('./features/product/product-detail.component').then(m => m.ProductDetailComponent),
                title: 'SABOTAGE - Producto'
            },
            {
                path: 'buscar',
                loadComponent: () => import('./features/search/search-results.component').then(m => m.SearchResultsComponent),
                title: 'SABOTAGE - Búsqueda'
            },
            {
                path: 'carrito',
                loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
                title: 'SABOTAGE - Carrito'
            },
            {
                path: 'reviews',
                loadComponent: () => import('./features/reviews/reviews.component').then(m => m.ReviewsComponent),
                title: 'SABOTAGE - Reseñas de Clientes'
            },
            {
                path: 'nosotros',
                loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
                title: 'SABOTAGE - Quiénes Somos'
            }
        ]
    },
    // Admin routes - no header/footer
    {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
