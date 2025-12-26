import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../catalog/components/product-card/product-card.component';

@Component({
    selector: 'app-product-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, ProductCardComponent],
    template: `
        @if (loading()) {
            <div class="min-h-screen flex items-center justify-center bg-sabotage-dark">
                <div class="text-center">
                    <div class="w-12 h-12 border-4 border-sabotage-border border-t-sabotage-accent rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-sabotage-muted">Cargando producto...</p>
                </div>
            </div>
        } @else if (product()) {
            <div class="min-h-screen bg-sabotage-dark">
                <!-- Breadcrumb -->
                <div class="max-w-7xl mx-auto px-4 py-4">
                    <nav class="flex items-center gap-2 text-sm text-sabotage-muted">
                        <a routerLink="/" class="hover:text-sabotage-light transition-colors">Inicio</a>
                        <span>/</span>
                        <a [routerLink]="'/' + product()!.category" class="hover:text-sabotage-light transition-colors uppercase">
                            {{ categoryName() }}
                        </a>
                        <span>/</span>
                        <span class="text-sabotage-light font-semibold">{{ product()!.name }}</span>
                    </nav>
                </div>

                <!-- Product Content -->
                <div class="max-w-7xl mx-auto px-4 py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <!-- Product Image -->
                        <div class="relative">
                            <div class="aspect-square rounded-2xl overflow-hidden bg-sabotage-gray">
                                <img
                                    [src]="product()!.imageUrl"
                                    [alt]="product()!.name"
                                    class="w-full h-full object-cover"
                                />
                            </div>

                            @if (!product()!.inStock) {
                                <div class="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm">
                                    AGOTADO
                                </div>
                            }
                        </div>

                        <!-- Product Info -->
                        <div class="flex flex-col flex-1">
                            <!-- Name -->
                            <h2 class="text-2xl md:text-3xl font-extrabold mb-4 tracking-wide">
                                {{ product()!.name }}
                            </h2>

                            <!-- Description -->
                            <p class="text-base md:text-lg text-sabotage-muted leading-relaxed mb-5">
                                {{ product()!.description }}
                            </p>

                            <!-- Price -->
                            <div class="text-3xl md:text-4xl font-extrabold text-sabotage-light my-5">
                                S/ {{ product()!.price.toFixed(2) }}
                            </div>

                            <!-- Options -->
                            <div class="my-6 md:my-8">
                                <!-- Size Selector -->
                                <div class="mb-6">
                                    <label class="block font-bold mb-3 tracking-wide text-sm">TALLA:</label>
                                    <div class="flex flex-wrap gap-3">
                                        @for (size of product()!.sizes; track size) {
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
                                [disabled]="!product()!.inStock || isAdding()"
                                class="w-full py-4 md:py-5 font-extrabold text-lg tracking-[2px] rounded mt-auto transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                [class]="addedToCart() 
                                    ? 'bg-[#4CAF50] text-white' 
                                    : product()!.inStock 
                                        ? 'bg-sabotage-light text-sabotage-black hover:opacity-90 hover:scale-[1.02]' 
                                        : 'bg-sabotage-gray text-sabotage-muted'"
                            >
                                @if (addedToCart()) {
                                    ✓ AGREGADO AL CARRITO
                                } @else if (!product()!.inStock) {
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

    readonly loading = signal(true);
    readonly product = signal<Product | null>(null);
    readonly selectedSize = signal<string>('');
    readonly quantity = signal(1);
    readonly isAdding = signal(false);
    readonly addedToCart = signal(false);

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

    async ngOnInit(): Promise<void> {
        const slug = this.route.snapshot.paramMap.get('slug');

        if (slug) {
            // Wait for products to load
            while (this.productService.loading()) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const foundProduct = this.productService.getProductBySlug(slug);
            this.product.set(foundProduct || null);

            // Auto-select first size
            if (foundProduct?.sizes?.length) {
                this.selectedSize.set(foundProduct.sizes[0]);
            }
        }

        this.loading.set(false);
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
        if (!p || !this.selectedSize()) return;

        this.isAdding.set(true);

        try {
            const success = await this.cartService.addItem(p.id, this.selectedSize(), this.quantity());

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
