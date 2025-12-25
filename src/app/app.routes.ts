import { Routes } from '@angular/router';

export const routes: Routes = [
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
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
