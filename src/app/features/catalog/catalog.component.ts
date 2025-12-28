import { Component, input, signal, computed, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ProductFiltersComponent } from './components/product-filters/product-filters.component';
import { ProductGridComponent } from './components/product-grid/product-grid.component';
import { ProductService } from '../../core/services/product.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { AosService } from '../../core/services/aos.service';
import { Product, FilterState, DbCategory } from '../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductFiltersComponent, ProductGridComponent],
  template: `
    <!-- Page Header -->
    <section class="text-center py-12 md:py-16 px-5 bg-sabotage-dark border-b-2 border-sabotage-border" data-aos="fade-down">
      @if (loadingCategory()) {
        <!-- Skeleton while loading -->
        <div class="h-10 md:h-14 w-64 md:w-96 bg-sabotage-gray/50 rounded mx-auto mb-4 animate-pulse"></div>
        <div class="h-5 md:h-6 w-48 md:w-80 bg-sabotage-gray/30 rounded mx-auto animate-pulse"></div>
      } @else {
        <h2 class="text-3xl md:text-5xl font-extrabold mb-4 tracking-wider">
          {{ categoryData()?.name?.toUpperCase() || title() }}
        </h2>
        <p class="text-base md:text-lg text-sabotage-muted">
          {{ categoryData()?.description || subtitle() }}
        </p>
      }
    </section>

    <!-- Main Content -->
    <div class="flex flex-col md:flex-row md:items-start max-w-[1600px] mx-auto p-5 md:p-10 gap-6 md:gap-8" data-aos="fade-up">
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
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly aos = inject(AosService);

  // Inputs for different catalog types (fallback values)
  readonly category = input<string>('oversize');
  readonly title = input('POLOS OVERSIZE');
  readonly subtitle = input('Descubre nuestra colección de polos con estilo urbano');
  readonly showTypeFilter = input(true);

  // Category data from database
  readonly categoryData = signal<DbCategory | null>(null);
  readonly loadingCategory = signal(true);

  // State
  readonly currentFilters = signal<FilterState>({
    types: [],
    sizes: [],
    colors: [],
    themes: [],
    priceRange: { min: 0, max: 150 }
  });

  constructor() {
    // Effect to load category when slug changes (handles initial load too)
    effect(() => {
      const slug = this.category();
      if (slug) {
        this.loadCategoryData(slug);
      }
    });

    // Initialize AOS
    this.aos.init();
  }

  private async loadCategoryData(slug: string): Promise<void> {
    this.loadingCategory.set(true);

    try {
      // First, try to find category in already-loaded ProductService cache
      const cachedCategories = this.productService.categories();
      const cachedCategory = cachedCategories.find(c => c.slug === slug);

      if (cachedCategory) {
        // Use cached category - no API call needed
        this.categoryData.set(cachedCategory);
        return;
      }

      // Not in cache - fetch from API (happens when entering directly to category page)
      const categories = await this.supabase.getAll<DbCategory>('categories', {
        filters: [{ column: 'slug', operator: 'eq', value: slug }]
      });

      if (categories.length > 0) {
        this.categoryData.set(categories[0]);
      }
    } catch (error) {
      console.warn('Could not load category data:', error);
    } finally {
      this.loadingCategory.set(false);
    }
  }

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

      // Color filter - check against product.colors array
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
  });

  onFiltersChange(filters: FilterState): void {
    this.currentFilters.set(filters);
  }

  goToProduct(product: Product): void {
    const slug = this.productService.generateSlug(product.name);
    this.router.navigate(['/producto', slug]);
  }
}
