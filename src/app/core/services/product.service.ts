import { Injectable, signal, computed } from '@angular/core';
import { Product, FilterState } from '../models/product.model';

// Mock products for initial development (will be replaced by Supabase data)
const MOCK_PRODUCTS: Product[] = [
    {
        id: 'oversize-001',
        name: 'POLO OVERSIZE NEGRO BDU',
        description: 'Polo oversize de algodón premium con diseño urbano exclusivo. Estampado de alta calidad.',
        price: 49.90,
        category: 'oversize',
        type: 'personalizado',
        color: 'negro',
        theme: 'urbano',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        imageUrl: '/img/NEGRO FRONTAL BDU SOLO C.png',
        inStock: true
    },
    {
        id: 'oversize-002',
        name: 'POLO OVERSIZE BLANCO ANIME',
        description: 'Diseño exclusivo inspirado en anime. Tela suave y cómoda, perfecto para cualquier ocasión.',
        price: 54.90,
        category: 'oversize',
        type: 'simple',
        color: 'blanco',
        theme: '',
        sizes: ['S', 'M', 'L', 'XL'],
        imageUrl: '/img/FUERA DE STOCK.png',
        inStock: false
    },
    {
        id: 'oversize-003',
        name: 'POLO OVERSIZE GRIS SKATE',
        description: 'Estilo skateboard urbano. Material resistente y diseño único para los amantes del skate.',
        price: 52.90,
        category: 'oversize',
        type: 'personalizado',
        color: 'gris',
        theme: 'skate',
        sizes: ['M', 'L', 'XL', 'XXL'],
        imageUrl: '/img/NEGRO OVERSIZE SOLO C.png',
        inStock: true
    },
    {
        id: 'oversize-004',
        name: 'POLO OVERSIZE NEGRO GAMING',
        description: 'Para los verdaderos gamers. Diseño inspirado en los videojuegos más populares del momento.',
        price: 56.90,
        category: 'oversize',
        type: 'personalizado',
        color: 'negro',
        theme: 'videojuegos',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        imageUrl: '/img/NEGRO SOLO A FRONTAL.png',
        inStock: true
    },
    {
        id: 'oversize-005',
        name: 'POLO OVERSIZE AZUL ESPIRITUAL',
        description: 'Diseño místico y espiritual. Perfecto para quienes buscan algo diferente y único.',
        price: 53.90,
        category: 'oversize',
        type: 'simple',
        color: 'azul',
        theme: '',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        imageUrl: '/img/NEGRO OVERSIZE SOLO C.png',
        inStock: true
    },
    {
        id: 'oversize-006',
        name: 'POLO OVERSIZE ROJO MÚSICA',
        description: 'Para los amantes de la música. Estampado de bandas legendarias con estilo urbano.',
        price: 55.90,
        category: 'oversize',
        type: 'simple',
        color: 'rojo',
        theme: '',
        sizes: ['S', 'M', 'L', 'XL'],
        imageUrl: '/img/ROJO OSCURO ESPALDAS 3-4 SOLO A.png',
        inStock: true
    },
    {
        id: 'oversize-007',
        name: 'POLO OVERSIZE VERDE ANIME',
        description: 'Diseño exclusivo de anime japonés. Calidad premium y estilo inigualable.',
        price: 57.90,
        category: 'oversize',
        type: 'personalizado',
        color: 'verde',
        theme: 'anime',
        sizes: ['M', 'L', 'XL', 'XXL'],
        imageUrl: '/img/NEGRO FRONTAL BDU SOLO C.png',
        inStock: true
    },
    {
        id: 'oversize-008',
        name: 'POLO OVERSIZE BLANCO URBANO',
        description: 'Minimalista y elegante. Perfecto para el día a día con estilo urbano único.',
        price: 48.90,
        category: 'oversize',
        type: 'simple',
        color: 'blanco',
        theme: '',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        imageUrl: '/img/BLANCO MOCKUP ENJAMBRE 1.png',
        inStock: true
    },
    {
        id: 'oversize-009',
        name: 'POLO OVERSIZE NEGRO ESPIRITUAL',
        description: 'Diseño místico en negro. Símbolos ancestrales con estilo moderno.',
        price: 59.90,
        category: 'oversize',
        type: 'simple',
        color: 'negro',
        theme: '',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        imageUrl: '/img/NEGRO SOLO A FRONTAL.png',
        inStock: true
    },
    {
        id: 'oversize-010',
        name: 'POLO OVERSIZE GRIS GAMING',
        description: 'Edición especial gaming. Para los que viven y respiran videojuegos.',
        price: 58.90,
        category: 'oversize',
        type: 'simple',
        color: 'gris',
        theme: '',
        sizes: ['M', 'L', 'XL'],
        imageUrl: '/img/NEGRO OVERSIZE SOLO C.png',
        inStock: true
    },
    // Classic polos
    {
        id: 'clasico-001',
        name: 'POLO CLASICO NEGRO',
        description: 'Edición Día de los Inocentes. Polo clásico de algodón premium.',
        price: 49.90,
        category: 'clasico',
        type: 'personalizado',
        color: 'negro',
        theme: 'urbano',
        sizes: ['S', 'M', 'L', 'XL'],
        imageUrl: '/img/NEGRO SOLO A FRONTAL.png',
        inStock: true
    },
    {
        id: 'clasico-002',
        name: 'POLO CLASICO GUINDA',
        description: 'Edición Navidad. Color guinda elegante para las fiestas.',
        price: 49.90,
        category: 'clasico',
        type: 'simple',
        color: 'rojo',
        theme: '',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        imageUrl: '/img/ROJO OSCURO ESPALDAS 3-4 SOLO A.png',
        inStock: true
    }
];

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    // State signals
    private readonly _products = signal<Product[]>(MOCK_PRODUCTS);
    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);

    // Public readonly signals
    readonly products = this._products.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    /**
     * Get products filtered by category
     */
    getProductsByCategory(category: 'oversize' | 'clasico') {
        return computed(() =>
            this._products().filter(p => p.category === category)
        );
    }

    /**
     * Get featured products for the home page
     */
    readonly featuredProducts = computed(() =>
        this._products().slice(0, 4)
    );

    /**
     * Filter products based on filter state
     */
    filterProducts(filters: FilterState): Product[] {
        return this._products().filter(product => {
            // Type filter
            if (filters.types.length > 0 && !filters.types.includes(product.type)) {
                return false;
            }

            // Size filter
            if (filters.sizes.length > 0 && !filters.sizes.some(s => product.sizes.includes(s))) {
                return false;
            }

            // Color filter
            if (filters.colors.length > 0 && !filters.colors.includes(product.color)) {
                return false;
            }

            // Theme filter (only for personalized products)
            if (product.type === 'personalizado' && filters.themes.length > 0) {
                if (!filters.themes.includes(product.theme)) {
                    return false;
                }
            }

            // Price filter
            if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
                return false;
            }

            return true;
        });
    }

    /**
     * Get a single product by ID
     */
    getProductById(id: string): Product | undefined {
        return this._products().find(p => p.id === id);
    }

    /**
     * Load products from Supabase (for future use)
     * @param supabase - SupabaseService instance (passed to avoid circular dependency)
     */
    async loadProductsFromSupabase(supabase: { getAll: <T>(table: string) => Promise<T[]> }): Promise<void> {
        if (!supabase) {
            console.warn('Supabase not available, using mock data.');
            return;
        }

        this._loading.set(true);
        this._error.set(null);

        try {
            const products = await supabase.getAll<Product>('products');
            if (products.length > 0) {
                this._products.set(products);
            }
        } catch (err) {
            this._error.set('Error loading products');
            console.error('Failed to load products:', err);
        } finally {
            this._loading.set(false);
        }
    }
}
