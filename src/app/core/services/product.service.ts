import { Injectable, signal, computed, inject } from '@angular/core';
import { Product, FilterState, DbProduct, DbCategory, dbProductToProduct, ProductColor } from '../models/product.model';
import { SupabaseService } from './supabase.service';

// Helper to create a mock color with images
function createMockColor(name: string, hexCode: string | null, imageUrl: string, inStock = true): ProductColor {
    return {
        id: `mock-color-${name.toLowerCase()}`,
        name,
        hexCode,
        displayOrder: 0,
        isDefault: true,
        inStock,
        images: [{
            id: `mock-img-${name.toLowerCase()}`,
            url: imageUrl,
            displayOrder: 0,
            isPrimary: true
        }]
    };
}

// Mock products for when Supabase is not configured
const MOCK_PRODUCTS: Product[] = [
    {
        id: 'oversize-001',
        name: 'POLO OVERSIZE NEGRO BDU',
        description: 'Polo oversize de algodón premium con diseño urbano exclusivo. Estampado de alta calidad.',
        price: 49.90,
        category: 'oversize',
        type: 'personalizado',
        theme: 'urbano',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        inStock: true,
        colors: [createMockColor('Negro', '#000000', '/img/NEGRO FRONTAL BDU SOLO C.png')],
        imageUrl: '/img/NEGRO FRONTAL BDU SOLO C.png'
    },
    {
        id: 'oversize-002',
        name: 'POLO OVERSIZE BLANCO ANIME',
        description: 'Diseño exclusivo inspirado en anime. Tela suave y cómoda, perfecto para cualquier ocasión.',
        price: 54.90,
        category: 'oversize',
        type: 'simple',
        theme: '',
        sizes: ['S', 'M', 'L', 'XL'],
        inStock: false,
        colors: [createMockColor('Blanco', '#FFFFFF', '/img/FUERA DE STOCK.png', false)],
        imageUrl: '/img/FUERA DE STOCK.png'
    },
    {
        id: 'oversize-003',
        name: 'POLO OVERSIZE GRIS SKATE',
        description: 'Estilo skateboard urbano. Material resistente y diseño único para los amantes del skate.',
        price: 52.90,
        category: 'oversize',
        type: 'personalizado',
        theme: 'skate',
        sizes: ['M', 'L', 'XL', 'XXL'],
        inStock: true,
        colors: [createMockColor('Gris', '#808080', '/img/NEGRO OVERSIZE SOLO C.png')],
        imageUrl: '/img/NEGRO OVERSIZE SOLO C.png'
    },
    {
        id: 'oversize-004',
        name: 'POLO OVERSIZE NEGRO GAMING',
        description: 'Para los verdaderos gamers. Diseño inspirado en los videojuegos más populares del momento.',
        price: 56.90,
        category: 'oversize',
        type: 'personalizado',
        theme: 'videojuegos',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        inStock: true,
        colors: [createMockColor('Negro', '#000000', '/img/NEGRO SOLO A FRONTAL.png')],
        imageUrl: '/img/NEGRO SOLO A FRONTAL.png'
    },
    {
        id: 'clasico-001',
        name: 'POLO CLASICO NEGRO',
        description: 'Edición Día de los Inocentes. Polo clásico de algodón premium.',
        price: 49.90,
        category: 'clasico',
        type: 'personalizado',
        theme: 'urbano',
        sizes: ['S', 'M', 'L', 'XL'],
        inStock: true,
        colors: [createMockColor('Negro', '#000000', '/img/NEGRO SOLO A FRONTAL.png')],
        imageUrl: '/img/NEGRO SOLO A FRONTAL.png'
    },
    {
        id: 'clasico-002',
        name: 'POLO CLASICO GUINDA',
        description: 'Edición Navidad. Color guinda elegante para las fiestas.',
        price: 49.90,
        category: 'clasico',
        type: 'simple',
        theme: '',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        inStock: true,
        colors: [createMockColor('Rojo', '#800000', '/img/ROJO OSCURO ESPALDAS 3-4 SOLO A.png')],
        imageUrl: '/img/ROJO OSCURO ESPALDAS 3-4 SOLO A.png'
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
    private _initPromise: Promise<void> | null = null;

    // Public readonly signals
    readonly products = this._products.asReadonly();
    readonly categories = this._categories.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    constructor() {
        this.ensureInitialized();
    }

    /**
     * Initialize products - loads from Supabase if configured, otherwise uses mock data
     */
    async ensureInitialized(): Promise<void> {
        if (!this._initPromise) {
            this._initPromise = this.initializeProducts();
        }
        return this._initPromise;
    }

    private async initializeProducts(): Promise<void> {
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

                // Load products with colors and images using nested select
                const client = this.supabase.client;
                if (!client) {
                    throw new Error('Supabase client not initialized');
                }

                const { data: dbProducts, error } = await client
                    .from('products')
                    .select(`
                        *,
                        colors:product_colors(
                            *,
                            images:product_images(*)
                        )
                    `)
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Convert DB products to frontend Model
                const products = (dbProducts || []).map((dbProduct: DbProduct) => {
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
        this._initPromise = null;
        await this.ensureInitialized();
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

            // Color filter - now checks against product.colors array
            if (filters.colors.length > 0) {
                const productColorNames = product.colors.map(c => c.name.toLowerCase());
                const hasMatchingColor = filters.colors.some(fc =>
                    productColorNames.includes(fc.toLowerCase())
                );
                if (!hasMatchingColor) {
                    return false;
                }
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
            // Search in all color names
            const colorMatch = product.colors.some(c =>
                c.name.toLowerCase().includes(searchTerm)
            );
            const categoryMatch = product.category.toLowerCase().includes(searchTerm);

            return nameMatch || descMatch || themeMatch || colorMatch || categoryMatch;
        });
    }

    /**
     * Get all unique color names from products (for filters)
     */
    getAllColors(): string[] {
        const colorSet = new Set<string>();
        this._products().forEach(product => {
            product.colors.forEach(color => {
                colorSet.add(color.name);
            });
        });
        return Array.from(colorSet).sort();
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
