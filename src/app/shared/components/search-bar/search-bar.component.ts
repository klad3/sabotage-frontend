import { Component, inject, signal, input, effect, ChangeDetectionStrategy, HostListener, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
    selector: 'app-search-bar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, RouterLink],
    template: `
        <div class="relative flex items-center">
            <!-- Desktop: Expandable Search -->
            @if (!expanded()) {
                <div class="relative flex items-center">
                    <!-- Expanded Input (Desktop) -->
                    <div 
                        class="overflow-hidden transition-all duration-300 ease-out"
                        [style.width]="isOpen() ? '380px' : '0'"
                        [style.opacity]="isOpen() ? '1' : '0'"
                    >
                        <div class="flex items-center bg-sabotage-gray/50 rounded-lg">
                            <svg class="w-5 h-5 ml-4 text-sabotage-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </svg>
                            <input
                                #searchInputDesktop
                                type="text"
                                [(ngModel)]="searchQuery"
                                (ngModelChange)="onSearch($event)"
                                (keydown.enter)="goToSearchResults()"
                                (keydown.escape)="closeSearch()"
                                placeholder="Buscar productos..."
                                class="flex-1 px-3 py-3 bg-transparent text-white placeholder-sabotage-muted focus:outline-none text-base min-w-0"
                                autocomplete="off"
                            />
                        </div>
                    </div>

                    <!-- Close/Toggle Button -->
                    <button
                        type="button"
                        (click)="toggleSearch()"
                        class="p-2 text-sabotage-light hover:text-white transition-colors flex-shrink-0"
                        [attr.aria-expanded]="isOpen()"
                        aria-label="Buscar productos"
                    >
                        @if (isOpen()) {
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        } @else {
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </svg>
                        }
                    </button>

                    <!-- Desktop Results Dropdown - aligned with input -->
                    @if (isOpen() && (searchResults().length > 0 || (searchQuery && searchQuery.length >= 2))) {
                        <div class="absolute left-0 top-full mt-2 z-50 animate-fade-in w-[380px]">
                            <div class="bg-sabotage-dark border border-sabotage-border rounded-xl shadow-2xl overflow-hidden">
                                @if (searchResults().length > 0) {
                                    <div class="max-h-[450px] overflow-y-auto">
                                        @for (product of searchResults().slice(0, 5); track product.id) {
                                            <a
                                                [routerLink]="['/producto', productService.generateSlug(product.name)]"
                                                (click)="closeSearch()"
                                                class="flex items-center gap-4 p-3.5 hover:bg-sabotage-gray transition-colors cursor-pointer"
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

                                        @if (searchResults().length > 5) {
                                            <button
                                                type="button"
                                                (click)="goToSearchResults()"
                                                class="w-full py-3 text-center text-sabotage-accent hover:bg-sabotage-gray transition-colors font-medium border-t border-sabotage-border"
                                            >
                                                Ver todos ({{ searchResults().length }})
                                            </button>
                                        }
                                    </div>
                                } @else if (searchQuery && searchQuery.length >= 2) {
                                    <div class="p-5 text-center text-sabotage-muted">
                                        No se encontraron productos
                                    </div>
                                }
                            </div>
                        </div>
                    }
                </div>
            }

            <!-- Mobile: Expanded Mode (full width input) -->
            @if (expanded()) {
                <div class="w-full">
                    <!-- Input with same styling as desktop -->
                    <div class="flex items-center bg-sabotage-gray/50 rounded-lg">
                        <svg class="w-5 h-5 ml-4 text-sabotage-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                        <input
                            #searchInputMobile
                            type="text"
                            [(ngModel)]="searchQuery"
                            (ngModelChange)="onSearch($event)"
                            (keydown.enter)="goToSearchResults()"
                            placeholder="Buscar productos..."
                            class="flex-1 px-3 py-3 bg-transparent text-white placeholder-sabotage-muted focus:outline-none text-base min-w-0"
                            autocomplete="off"
                        />
                        @if (searchQuery) {
                            <button
                                type="button"
                                (click)="clearSearch()"
                                class="pr-4 text-sabotage-muted hover:text-white transition-colors"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        }
                    </div>

                    <!-- Results dropdown with same styling as desktop -->
                    @if (searchResults().length > 0 || (searchQuery && searchQuery.length >= 2)) {
                        <div class="mt-3 bg-sabotage-dark border border-sabotage-border rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                            @if (searchResults().length > 0) {
                                <div class="max-h-[350px] overflow-y-auto">
                                    @for (product of searchResults().slice(0, 5); track product.id) {
                                        <a
                                            [routerLink]="['/producto', productService.generateSlug(product.name)]"
                                            (click)="closeSearch()"
                                            class="flex items-center gap-4 p-3.5 hover:bg-sabotage-gray transition-colors cursor-pointer"
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

                                    @if (searchResults().length > 5) {
                                        <button
                                            type="button"
                                            (click)="goToSearchResults()"
                                            class="w-full py-3 text-center text-sabotage-accent hover:bg-sabotage-gray transition-colors font-medium border-t border-sabotage-border"
                                        >
                                            Ver todos ({{ searchResults().length }})
                                        </button>
                                    }
                                </div>
                            } @else if (searchQuery && searchQuery.length >= 2) {
                                <div class="p-5 text-center text-sabotage-muted">
                                    No se encontraron productos
                                </div>
                            }
                        </div>
                    }
                </div>
            }
        </div>
    `,
    styles: [`
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-5px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .animate-fade-in {
            animation: fadeIn 0.15s ease-out;
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
        class: 'relative block'
    }
})
export class SearchBarComponent {
    readonly productService = inject(ProductService);
    private readonly router = inject(Router);
    private readonly elementRef = inject(ElementRef);

    readonly expanded = input(false);

    readonly isOpen = signal(false);
    readonly searchResults = signal<Product[]>([]);
    searchQuery = '';

    constructor() {
        effect(() => {
            if (this.expanded()) {
                setTimeout(() => {
                    const input = this.elementRef.nativeElement.querySelector('input');
                    input?.focus();
                }, 100);
            }
        });
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.closeSearch();
        }
    }

    toggleSearch(): void {
        this.isOpen.update(v => !v);
        if (this.isOpen()) {
            setTimeout(() => {
                const input = this.elementRef.nativeElement.querySelector('input');
                input?.focus();
            }, 150);
        } else {
            this.clearSearch();
        }
    }

    closeSearch(): void {
        this.isOpen.set(false);
        this.clearSearch();
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
