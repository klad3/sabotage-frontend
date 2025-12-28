import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { AosService } from '../../core/services/aos.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../catalog/components/product-card/product-card.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-search-results',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, ProductCardComponent],
    template: `
        <div class="min-h-screen bg-sabotage-dark">
            <!-- Header -->
            <section class="py-12 px-5 bg-sabotage-dark border-b-2 border-sabotage-border" data-aos="fade-down">
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl md:text-5xl font-extrabold mb-4 tracking-wider">
                        RESULTADOS DE BÚSQUEDA
                    </h1>
                    <p class="text-lg text-sabotage-muted">
                        @if (searchQuery()) {
                            {{ results().length }} resultados para "{{ searchQuery() }}"
                        } @else {
                            Ingresa un término de búsqueda
                        }
                    </p>
                </div>
            </section>

            <!-- Search Bar -->
            <div class="max-w-7xl mx-auto px-5 py-6">
                <div class="flex items-center gap-2 bg-sabotage-gray border-2 border-sabotage-border rounded-lg p-2">
                    <svg class="w-5 h-5 ml-2 text-sabotage-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </svg>
                    <input
                        type="text"
                        [(ngModel)]="inputQuery"
                        (keydown.enter)="search()"
                        placeholder="Buscar productos..."
                        class="search-input flex-1 py-2 bg-transparent text-white text-base placeholder-sabotage-muted"
                    />
                    <button
                        type="button"
                        (click)="search()"
                        class="px-5 py-2 bg-sabotage-light text-black font-bold rounded transition-all duration-300 hover:bg-white"
                    >
                        BUSCAR
                    </button>
                </div>
            </div>

            <!-- Results Grid -->
            <div class="max-w-7xl mx-auto px-5 py-8" data-aos="fade-up">
                @if (results().length > 0) {
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        @for (product of results(); track product.id) {
                            <app-product-card
                                [product]="product"
                                (click)="goToProduct(product)"
                            />
                        }
                    </div>
                } @else if (searchQuery()) {
                    <div class="text-center py-20">
                        <p class="text-6xl mb-4">🔍</p>
                        <h2 class="text-2xl font-bold text-white mb-2">Sin resultados</h2>
                        <p class="text-sabotage-muted mb-6">No encontramos productos para "{{ searchQuery() }}"</p>
                        <div class="flex flex-col items-center gap-4">
                            <p class="text-sabotage-muted text-sm">Prueba con otros términos:</p>
                            <div class="flex flex-wrap justify-center gap-2">
                                @for (suggestion of suggestions; track suggestion) {
                                    <button
                                        type="button"
                                        (click)="searchFor(suggestion)"
                                        class="px-4 py-2 bg-sabotage-gray text-white rounded-full hover:bg-sabotage-border transition-colors"
                                    >
                                        {{ suggestion }}
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
                } @else {
                    <div class="text-center py-20">
                        <p class="text-6xl mb-4">👆</p>
                        <h2 class="text-2xl font-bold text-white mb-2">¿Qué estás buscando?</h2>
                        <p class="text-sabotage-muted">Escribe en la barra de búsqueda para comenzar</p>
                    </div>
                }
            </div>
        </div>
    `,
    styles: [`
        .search-input {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }
        .search-input:focus {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }
    `],
    host: {
        class: 'block'
    }
})
export class SearchResultsComponent implements OnInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly productService = inject(ProductService);
    private readonly aos = inject(AosService);

    readonly searchQuery = signal('');
    readonly results = signal<Product[]>([]);
    inputQuery = '';

    readonly suggestions = ['oversize', 'negro', 'anime', 'gaming', 'blanco'];

    private queryParamSub?: Subscription;

    ngOnInit(): void {
        this.aos.init();

        this.queryParamSub = this.route.queryParams.subscribe(params => {
            const q = params['q'] || '';
            this.searchQuery.set(q);
            this.inputQuery = q;

            if (q) {
                this.performSearch(q);
            } else {
                this.results.set([]);
            }
        });
    }

    ngOnDestroy(): void {
        this.queryParamSub?.unsubscribe();
    }

    search(): void {
        if (this.inputQuery.trim()) {
            this.router.navigate(['/buscar'], {
                queryParams: { q: this.inputQuery.trim() }
            });
        }
    }

    searchFor(term: string): void {
        this.inputQuery = term;
        this.search();
    }

    private async performSearch(query: string): Promise<void> {
        // Wait for products to load if needed
        while (this.productService.loading()) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const searchResults = this.productService.searchProducts(query);
        this.results.set(searchResults);
    }

    goToProduct(product: Product): void {
        const slug = this.productService.generateSlug(product.name);
        this.router.navigate(['/producto', slug]);
    }
}
