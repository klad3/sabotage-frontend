import { Component, input, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ProductFiltersComponent } from './components/product-filters/product-filters.component';
import { ProductGridComponent } from './components/product-grid/product-grid.component';
import { ProductService } from '../../core/services/product.service';
import { Product, FilterState } from '../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductFiltersComponent, ProductGridComponent],
  template: `
    <!-- Page Header -->
    <section class="text-center py-12 md:py-16 px-5 bg-sabotage-dark border-b-2 border-sabotage-border">
      <h2 class="text-3xl md:text-5xl font-extrabold mb-4 tracking-wider">
        {{ title() }}
      </h2>
      <p class="text-base md:text-lg text-sabotage-muted">
        {{ subtitle() }}
      </p>
    </section>

    <!-- Main Content -->
    <div class="flex flex-col md:flex-row md:items-start max-w-[1600px] mx-auto p-5 md:p-10 gap-6 md:gap-8">
      <!-- Filters -->
      <app-product-filters
        class="md:self-start"
        [showTypeFilter]="showTypeFilter()"
        (filtersChange)="onFiltersChange($event)"
      />

      <!-- Products Grid -->
      <app-product-grid
        [products]="filteredProducts()"
        (productClick)="goToProduct($event)"
      />
    </div>
  `,
  host: {
    class: 'block'
  }
})
export class CatalogComponent {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  // Inputs for different catalog types
  readonly category = input<'oversize' | 'clasico'>('oversize');
  readonly title = input('POLOS OVERSIZE');
  readonly subtitle = input('Descubre nuestra colección de polos con estilo urbano');
  readonly showTypeFilter = input(true);

  // State
  readonly currentFilters = signal<FilterState>({
    types: [],
    sizes: [],
    colors: [],
    themes: [],
    priceRange: { min: 0, max: 150 }
  });

  // Get products for current category
  private readonly categoryProducts = computed(() =>
    this.productService.products().filter(p => p.category === this.category())
  );

  // Apply filters
  readonly filteredProducts = computed(() => {
    const filters = this.currentFilters();
    const products = this.categoryProducts();

    return products.filter(product => {
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
  });

  onFiltersChange(filters: FilterState): void {
    this.currentFilters.set(filters);
  }

  goToProduct(product: Product): void {
    const slug = this.productService.generateSlug(product.name);
    this.router.navigate(['/producto', slug]);
  }
}

