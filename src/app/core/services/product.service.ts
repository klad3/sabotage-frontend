import { Injectable, signal, computed, inject } from '@angular/core';
import { Product, FilterState, DbProduct, DbCategory, dbProductToProduct } from '../models/product.model';
import { SupabaseService } from './supabase.service';

// Mock products for when Supabase is not configured
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
    private readonly supabase = inject(SupabaseService);

    // State signals
    private readonly _products = signal<Product[]>([]);
    private readonly _categories = signal<DbCategory[]>([]);
    private readonly _loading = signal(true);
    private readonly _error = signal<string | null>(null);
    private _initialized = false;

    // Public readonly signals
    readonly products = this._products.asReadonly();
    readonly categories = this._categories.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    constructor() {
        this.initializeProducts();
    }

    /**
     * Initialize products - loads from Supabase if configured, otherwise uses mock data
     */
    private async initializeProducts(): Promise<void> {
        if (this._initialized) return;
        this._initialized = true;

        this._loading.set(true);
        this._error.set(null);

        try {
            if (this.supabase.isEnabled) {
                // Load categories first
                const categories = await this.supabase.getAll<DbCategory>('categories', {
                    filters: [{ column: 'is_active', operator: 'eq', value: true }]
                });
                this._categories.set(categories);

                // Create a map for quick category lookup
                const categoryMap = new Map(categories.map(c => [c.id, c]));

                // Load products with category info
                const dbProducts = await this.supabase.getAll<DbProduct>('products', {
                    filters: [{ column: 'is_active', operator: 'eq', value: true }],
                    orderBy: { column: 'created_at', ascending: false }
                });

                // Convert DB products to frontend Model
                const products = dbProducts.map(dbProduct => {
                    const category = dbProduct.category_id ? categoryMap.get(dbProduct.category_id) : null;
                    return dbProductToProduct(dbProduct, category?.slug);
                });

                this._products.set(products);
            } else {
                // Use mock data when Supabase is not configured
                this._products.set(MOCK_PRODUCTS);
            }
        } catch (err) {
            console.error('Error loading products:', err);
            this._error.set('Error cargando productos');
            // Fallback to mock data on error
            this._products.set(MOCK_PRODUCTS);
        } finally {
            this._loading.set(false);
        }
    }

    /**
     * Refresh products from Supabase
     */
    async refreshProducts(): Promise<void> {
        this._initialized = false;
        await this.initializeProducts();
    }

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
     * Get a single product by slug (URL-friendly ID)
     */
    getProductBySlug(slug: string): Product | undefined {
        return this._products().find(p => this.generateSlug(p.name) === slug || p.id === slug);
    }

    /**
     * Search products by name, description, theme, or color
     */
    searchProducts(query: string): Product[] {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const searchTerm = query.toLowerCase().trim();

        return this._products().filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const descMatch = product.description.toLowerCase().includes(searchTerm);
            const themeMatch = product.theme?.toLowerCase().includes(searchTerm);
            const colorMatch = product.color.toLowerCase().includes(searchTerm);
            const categoryMatch = product.category.toLowerCase().includes(searchTerm);

            return nameMatch || descMatch || themeMatch || colorMatch || categoryMatch;
        });
    }

    /**
     * Generate URL-friendly slug from product name
     */
    generateSlug(name: string): string {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
