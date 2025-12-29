import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit, resource, effect, untracked } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AosService } from '../../core/services/aos.service';
import { SeoService } from '../../core/services/seo.service';
import { Product, ProductColor, ProductImage } from '../../core/models/product.model';
import { ProductCardComponent } from '../catalog/components/product-card/product-card.component';

@Component({
    selector: 'app-product-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, ProductCardComponent, NgOptimizedImage],
    template: `
        @if (productResource.isLoading()) {
            <div class="min-h-screen flex items-center justify-center bg-sabotage-dark">
                <div class="text-center">
                    <div class="w-12 h-12 border-4 border-sabotage-border border-t-sabotage-accent rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-sabotage-muted">Cargando producto...</p>
                </div>
            </div>
        } @else if (productResource.value()) {
            <div class="min-h-screen bg-sabotage-dark">
                <!-- Breadcrumb -->
                <div class="max-w-7xl mx-auto px-4 py-4">
                    <nav class="flex items-center gap-2 text-sm text-sabotage-muted">
                        <a routerLink="/" class="hover:text-sabotage-light transition-colors">Inicio</a>
                        <span>/</span>
                        <a [routerLink]="'/' + productResource.value()!.category" class="hover:text-sabotage-light transition-colors uppercase">
                            {{ categoryName() }}
                        </a>
                        <span>/</span>
                        <span class="text-sabotage-light font-semibold">{{ productResource.value()!.name }}</span>
                    </nav>
                </div>

                <!-- Product Content -->
                <div class="max-w-7xl mx-auto px-4 py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <!-- Product Images Gallery -->
                        <div class="relative" data-aos="fade-right">
                            <!-- Main Image -->
                            <div class="aspect-square rounded-2xl overflow-hidden bg-sabotage-gray mb-4 relative">
                                <img
                                    [ngSrc]="currentMainImage()"
                                    [alt]="productResource.value()!.name"
                                    fill
                                    priority
                                    class="object-cover transition-opacity duration-300"
                                />
                            </div>

                            <!-- Thumbnail Gallery -->
                            @if (currentImages().length > 1) {
                                <div class="flex gap-2 overflow-x-auto pb-2">
                                    @for (image of currentImages(); track image.id; let i = $index) {
                                        <button
                                            type="button"
                                            (click)="selectImage(i)"
                                            class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 relative"
                                            [class.border-blue-500]="selectedImageIndex() === i"
                                            [class.ring-2]="selectedImageIndex() === i"
                                            [class.ring-blue-500]="selectedImageIndex() === i"
                                            [class.border-sabotage-border]="selectedImageIndex() !== i"
                                            [class.opacity-60]="selectedImageIndex() !== i"
                                            [attr.aria-label]="'Ver imagen ' + (i + 1)"
                                        >
                                            <img
                                                [ngSrc]="image.url"
                                                [alt]="productResource.value()!.name + ' - imagen ' + (i + 1)"
                                                fill
                                                class="object-cover"
                                            />
                                        </button>
                                    }
                                </div>
                            }

                            @if (!selectedColorInStock()) {
                                <div class="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm">
                                    AGOTADO
                                </div>
                            }
                        </div>

                        <!-- Product Info -->
                        <div class="flex flex-col flex-1">
                            <!-- Name -->
                            <h2 class="text-2xl md:text-3xl font-extrabold mb-4 tracking-wide">
                                {{ productResource.value()!.name }}
                            </h2>

                            <!-- Description -->
                            <p class="text-base md:text-lg text-sabotage-muted leading-relaxed mb-5">
                                {{ productResource.value()!.description }}
                            </p>

                            <!-- Price -->
                            <div class="text-3xl md:text-4xl font-extrabold text-sabotage-light my-5">
                                S/ {{ productResource.value()!.price.toFixed(2) }}
                            </div>

                            <!-- Options -->
                            <div class="my-6 md:my-8">
                                <!-- Color Selector -->
                                @if (productResource.value()!.colors.length > 1) {
                                    <div class="mb-6">
                                        <label class="block font-bold mb-3 tracking-wide text-sm">
                                            COLOR: <span class="font-normal text-sabotage-muted">{{ selectedColor()?.name }}</span>
                                        </label>
                                        <div class="flex flex-wrap gap-3">
                                            @for (color of productResource.value()!.colors; track color.id) {
                                                <button
                                                    type="button"
                                                    (click)="selectColor(color)"
                                                    class="relative w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-sabotage-dark"
                                                    [class.border-blue-500]="selectedColor()?.id === color.id"
                                                    [class.border-sabotage-border]="selectedColor()?.id !== color.id"
                                                    [class.ring-2]="selectedColor()?.id === color.id"
                                                    [class.ring-blue-500]="selectedColor()?.id === color.id"
                                                    [style.background-color]="color.hexCode || '#808080'"
                                                    [attr.aria-label]="'Seleccionar color ' + color.name"
                                                    [attr.title]="color.name + (color.inStock ? '' : ' (Agotado)')"
                                                >
                                                    @if (!color.inStock) {
                                                        <span class="absolute inset-0 flex items-center justify-center">
                                                            <span class="w-full h-0.5 bg-red-500 rotate-45 absolute"></span>
                                                        </span>
                                                    }
                                                </button>
                                            }
                                        </div>
                                    </div>
                                }

                                <!-- Size Selector -->
                                <div class="mb-6">
                                    <label class="block font-bold mb-3 tracking-wide text-sm">TALLA:</label>
                                    <div class="flex flex-wrap gap-3">
                                        @for (size of productResource.value()!.sizes; track size) {
                                            <button
                                                type="button"
                                                (click)="selectSize(size)"
                                                [class.bg-sabotage-light]="selectedSize() === size"
                                                [class.text-sabotage-black]="selectedSize() === size"
                                                [class.border-sabotage-light]="selectedSize() === size"
                                                [class.bg-sabotage-gray]="selectedSize() !== size"
                                                [class.text-sabotage-light]="selectedSize() !== size"
                                                [class.border-sabotage-border]="selectedSize() !== size"
                                                class="w-14 h-14 border-2 rounded font-bold transition-all duration-300 hover:border-sabotage-light"
                                            >
                                                {{ size }}
                                            </button>
                                        }
                                    </div>
                                </div>

                                <!-- Quantity Selector -->
                                <div class="mb-6">
                                    <label class="block font-bold mb-3 tracking-wide text-sm">
                                        CANTIDAD:
                                    </label>
                                    <div class="flex items-center gap-4">
                                        <button
                                            type="button"
                                            (click)="decreaseQuantity()"
                                            class="w-10 h-10 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light text-xl cursor-pointer rounded flex items-center justify-center transition-all duration-300 hover:bg-sabotage-border hover:border-sabotage-light"
                                            aria-label="Disminuir cantidad"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            [value]="quantity()"
                                            readonly
                                            class="w-16 p-2 text-center bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light text-lg rounded font-semibold"
                                            aria-label="Cantidad"
                                        />
                                        <button
                                            type="button"
                                            (click)="increaseQuantity()"
                                            class="w-10 h-10 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light text-xl cursor-pointer rounded flex items-center justify-center transition-all duration-300 hover:bg-sabotage-border hover:border-sabotage-light"
                                            aria-label="Aumentar cantidad"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Add to Cart -->
                            <button
                                type="button"
                                (click)="addToCart()"
                                [disabled]="!canAddToCart() || isAdding()"
                                class="w-full py-4 md:py-5 font-extrabold text-lg tracking-[2px] rounded mt-auto transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                [class]="addedToCart() 
                                    ? 'bg-[#4CAF50] text-white' 
                                    : canAddToCart() 
                                        ? 'bg-sabotage-light text-sabotage-black hover:opacity-90 hover:scale-[1.02]' 
                                        : 'bg-sabotage-gray text-sabotage-muted'"
                            >
                                @if (addedToCart()) {
                                    ✓ AGREGADO AL CARRITO
                                } @else if (!selectedColorInStock()) {
                                    AGOTADO
                                } @else {
                                    AGREGAR AL CARRITO
                                }
                            </button>

                            <!-- Product Details -->
                            <div class="mt-8 pt-8 border-t border-sabotage-border">
                                <h3 class="text-sabotage-light font-bold mb-4">DETALLES</h3>
                                <ul class="space-y-2 text-sabotage-muted">
                                    <li class="flex items-center gap-2">
                                        <span class="text-sabotage-accent">✓</span>
                                        100% Algodón Premium
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <span class="text-sabotage-accent">✓</span>
                                        Estampado de alta calidad
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <span class="text-sabotage-accent">✓</span>
                                        Envío a todo el Perú
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <span class="text-sabotage-accent">✓</span>
                                        Cambios y devoluciones
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Related Products -->
                @if (relatedProducts().length > 0) {
                    <section class="max-w-7xl mx-auto px-4 py-12 border-t border-sabotage-border">
                        <h2 class="text-2xl md:text-3xl font-extrabold text-sabotage-light mb-8 uppercase tracking-wide">
                            TAMBIÉN TE PUEDE INTERESAR
                        </h2>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            @for (relatedProduct of relatedProducts(); track relatedProduct.id) {
                                <app-product-card
                                    [product]="relatedProduct"
                                    (click)="goToProduct(relatedProduct)"
                                />
                            }
                        </div>
                    </section>
                }
            </div>
        } @else {
            <!-- Not Found -->
            <div class="min-h-screen flex items-center justify-center bg-sabotage-dark">
                <div class="text-center">
                    <p class="text-6xl mb-4">😕</p>
                    <h2 class="text-2xl font-bold text-white mb-2">Producto no encontrado</h2>
                    <p class="text-sabotage-muted mb-6">El producto que buscas no existe o fue eliminado</p>
                    <a
                        routerLink="/"
                        class="inline-block px-6 py-3 bg-sabotage-accent text-black font-bold rounded-xl hover:scale-105 transition-transform"
                    >
                        Volver al inicio
                    </a>
                </div>
            </div>
        }
    `,
    host: {
        class: 'block'
    }
})
export class ProductDetailComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly productService = inject(ProductService);
    private readonly cartService = inject(CartService);
    private readonly aos = inject(AosService);
    private readonly seo = inject(SeoService);

    // Resource: automatically fetches product when route param changes
    readonly productResource = resource<Product | null, string | null>({
        params: () => {
            const slug = this.route.snapshot.paramMap.get('slug');
            return slug;
        },
        loader: async ({ params: slug }) => {
            if (!slug) return null;
            await this.productService.ensureInitialized();
            return this.productService.getProductBySlug(slug) || null;
        }
    });

    // Computed for ease of use (optional, but keeps template cleaner if we used signals before)
    readonly product = computed(() => this.productResource.value());

    readonly selectedSize = signal<string>('');
    readonly quantity = signal(1);
    readonly isAdding = signal(false);
    readonly addedToCart = signal(false);

    // Color and image selection
    readonly selectedColor = signal<ProductColor | null>(null);
    readonly selectedImageIndex = signal(0);

    // Computed: current color's images
    readonly currentImages = computed((): ProductImage[] => {
        const color = this.selectedColor();
        if (!color?.images?.length) {
            // Fallback to legacy imageUrl if no color images
            const p = this.product();
            if (p?.imageUrl) {
                return [{ id: 'legacy', url: p.imageUrl, displayOrder: 0, isPrimary: true }];
            }
            return [];
        }
        return color.images;
    });

    // Computed: current main image URL
    readonly currentMainImage = computed((): string => {
        const images = this.currentImages();
        const index = this.selectedImageIndex();
        return images[index]?.url || images[0]?.url || '';
    });

    // Computed: is selected color in stock
    readonly selectedColorInStock = computed((): boolean => {
        const color = this.selectedColor();
        if (!color) {
            return this.product()?.inStock ?? false;
        }
        return color.inStock;
    });

    // Computed: can add to cart
    readonly canAddToCart = computed((): boolean => {
        return this.selectedColorInStock() && !!this.selectedSize();
    });

    readonly relatedProducts = computed(() => {
        const current = this.product();
        if (!current) return [];

        return this.productService.products()
            .filter(p => p.id !== current.id && p.category === current.category)
            .slice(0, 4);
    });

    readonly categoryName = computed(() => {
        const p = this.product();
        if (!p) return '';

        const category = this.productService.categories().find(c => c.slug === p.category);
        return category?.name || p.category.charAt(0).toUpperCase() + p.category.slice(1);
    });

    constructor() {
        // Initial setup for default selections when product loads
        effect(() => {
            try {
                const p = this.productResource.value();
                if (p) {
                    // Use untracked to check current state without establishing a dependency
                    const currentColor = untracked(() => this.selectedColor());
                    const currentSize = untracked(() => this.selectedSize());

                    // Check if current color is valid for this product
                    const colorIsValid = currentColor && p.colors?.some(c => c.id === currentColor.id);

                    if (!colorIsValid) {
                        // Default to the product's default color or the first one in the list
                        const defaultColor = p.defaultColor || (p.colors && p.colors.length > 0 ? p.colors[0] : null);
                        if (defaultColor) {
                            this.selectedColor.set(defaultColor);
                        }
                    }

                    // Check if current size is valid
                    const sizeIsValid = currentSize && p.sizes?.includes(currentSize);
                    if (!sizeIsValid && p.sizes?.length > 0) {
                        this.selectedSize.set(p.sizes[0]);
                    }

                    // Update SEO (safely)
                    untracked(() => {
                        try {
                            const slug = this.route.snapshot.paramMap.get('slug') || this.route.snapshot.paramMap.get('id') || '';
                            this.seo.updateTags({
                                title: p.name.toUpperCase(),
                                description: p.description,
                                image: p.imageUrl,
                                url: `https://sabotage.pe/producto/${slug}`,
                                type: 'product'
                            });
                        } catch (e) {
                            console.warn('Error updating SEO tags:', e);
                        }
                    });
                }
            } catch (err) {
                console.error('Error in product initialization effect:', err);
            }
        });
    }

    ngOnInit(): void {
        this.aos.init();
    }

    selectColor(color: ProductColor): void {
        this.selectedColor.set(color);
        this.selectedImageIndex.set(0); // Reset to first image when changing color
    }

    selectImage(index: number): void {
        this.selectedImageIndex.set(index);
    }

    selectSize(size: string): void {
        this.selectedSize.set(size);
    }

    decreaseQuantity(): void {
        if (this.quantity() > 1) {
            this.quantity.update(q => q - 1);
        }
    }
    increaseQuantity(): void {
        if (this.quantity() < 10) {
            this.quantity.update(q => q + 1);
        }
    }

    async addToCart(): Promise<void> {
        const p = this.product();
        const color = this.selectedColor();
        if (!p || !this.selectedSize()) return;

        this.isAdding.set(true);

        try {
            // Pass color ID to cart service (will be updated in cart service later)
            const success = await this.cartService.addItem(
                p.id,
                this.selectedSize(),
                this.quantity(),
                color?.id // New parameter for color
            );

            if (success) {
                this.addedToCart.set(true);
                setTimeout(() => {
                    this.addedToCart.set(false);
                }, 2000);
            }
        } finally {
            this.isAdding.set(false);
        }
    }

    goToProduct(product: Product): void {
        const slug = this.productService.generateSlug(product.name);
        this.router.navigate(['/producto', slug]);
    }
}
