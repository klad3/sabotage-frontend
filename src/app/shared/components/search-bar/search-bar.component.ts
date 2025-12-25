import { Component, inject, signal, ChangeDetectionStrategy, HostListener, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
    selector: 'app-search-bar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, RouterLink],
    template: `
        <div class="relative" (clickOutside)="closeSearch()">
            <!-- Search Toggle Button -->
            <button
                type="button"
                (click)="toggleSearch()"
                class="p-2 text-sabotage-light hover:text-white transition-colors"
                aria-label="Buscar productos"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                </svg>
            </button>

            <!-- Expanded Search Input -->
            @if (isOpen()) {
                <div class="absolute right-0 top-full mt-2 z-50 animate-fade-in">
                    <div class="bg-sabotage-dark border-2 border-sabotage-border rounded-xl shadow-2xl overflow-hidden min-w-[300px] md:min-w-[400px]">
                        <!-- Input -->
                        <div class="flex items-center">
                            <svg
                                class="w-5 h-5 ml-4 text-sabotage-muted"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </svg>
                            <input
                                #searchInput
                                type="text"
                                [(ngModel)]="searchQuery"
                                (ngModelChange)="onSearch($event)"
                                (keydown.enter)="goToSearchResults()"
                                (keydown.escape)="closeSearch()"
                                placeholder="Buscar productos..."
                                class="flex-1 px-3 py-3 bg-transparent text-white placeholder-sabotage-muted focus:outline-none focus:ring-0 border-0 text-base"
                                autocomplete="off"
                            />
                            @if (searchQuery) {
                                <button
                                    type="button"
                                    (click)="clearSearch()"
                                    class="mr-3 text-sabotage-muted hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            }
                        </div>

                        <!-- Results -->
                        @if (searchResults().length > 0) {
                            <div class="max-h-[400px] overflow-y-auto">
                                @for (product of searchResults().slice(0, 6); track product.id) {
                                    <a
                                        [routerLink]="['/producto', productService.generateSlug(product.name)]"
                                        (click)="closeSearch()"
                                        class="flex items-center gap-4 p-3 hover:bg-sabotage-gray transition-colors cursor-pointer"
                                    >
                                        <img
                                            [src]="product.imageUrl"
                                            [alt]="product.name"
                                            class="w-12 h-12 object-cover rounded-lg bg-sabotage-gray"
                                        />
                                        <div class="flex-1 min-w-0">
                                            <p class="text-white font-medium truncate">{{ product.name }}</p>
                                            <p class="text-sabotage-accent text-sm font-bold">S/ {{ product.price.toFixed(2) }}</p>
                                        </div>
                                    </a>
                                }

                                @if (searchResults().length > 6) {
                                    <button
                                        type="button"
                                        (click)="goToSearchResults()"
                                        class="w-full py-3 text-center text-sabotage-accent hover:bg-sabotage-gray transition-colors font-medium"
                                    >
                                        Ver todos los resultados ({{ searchResults().length }})
                                    </button>
                                }
                            </div>
                        } @else if (searchQuery && searchQuery.length >= 2) {
                            <div class="p-6 text-center text-sabotage-muted">
                                <p>No se encontraron productos</p>
                                <p class="text-sm mt-1">Intenta con otra búsqueda</p>
                            </div>
                        }

                        <!-- Quick Hint -->
                        @if (!searchQuery) {
                            <div class="p-4 text-center text-sabotage-muted text-sm">
                                <p>Escribe para buscar productos</p>
                                <p class="text-xs mt-1 opacity-70">Presiona Enter para ver todos los resultados</p>
                            </div>
                        }
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .animate-fade-in {
            animation: fadeIn 0.2s ease-out;
        }

        input {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }

        input:focus {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }
    `],
    host: {
        class: 'relative'
    }
})
export class SearchBarComponent {
    readonly productService = inject(ProductService);
    private readonly router = inject(Router);
    private readonly elementRef = inject(ElementRef);

    readonly isOpen = signal(false);
    readonly searchResults = signal<Product[]>([]);
    searchQuery = '';

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.closeSearch();
        }
    }

    toggleSearch(): void {
        this.isOpen.update(v => !v);
        if (this.isOpen()) {
            // Focus input after opening
            setTimeout(() => {
                const input = this.elementRef.nativeElement.querySelector('input');
                input?.focus();
            }, 100);
        }
    }

    closeSearch(): void {
        this.isOpen.set(false);
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.searchResults.set([]);
    }

    onSearch(query: string): void {
        if (query.length >= 2) {
            const results = this.productService.searchProducts(query);
            this.searchResults.set(results);
        } else {
            this.searchResults.set([]);
        }
    }

    goToSearchResults(): void {
        if (this.searchQuery.trim()) {
            this.router.navigate(['/buscar'], {
                queryParams: { q: this.searchQuery.trim() }
            });
            this.closeSearch();
        }
    }
}
