import { Component, input, signal, computed, inject, ChangeDetectionStrategy, effect, resource } from '@angular/core';
import { Router } from '@angular/router';
import { ProductFiltersComponent } from './components/product-filters/product-filters.component';
import { ProductGridComponent } from './components/product-grid/product-grid.component';
import { ProductService } from '../../core/services/product.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { AosService } from '../../core/services/aos.service';
import { SeoService } from '../../core/services/seo.service';
import { Product, FilterState, DbCategory } from '../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductFiltersComponent, ProductGridComponent],
  template: `
    <!-- Page Header -->
    <section class="text-center py-12 md:py-16 px-5 bg-sabotage-dark border-b-2 border-sabotage-border" data-aos="fade-down">
      @if (categoryResource.isLoading()) {
        <!-- Skeleton while loading -->
        <div class="h-10 md:h-14 w-64 md:w-96 bg-sabotage-gray/50 rounded mx-auto mb-4 animate-pulse"></div>
        <div class="h-5 md:h-6 w-48 md:w-80 bg-sabotage-gray/30 rounded mx-auto animate-pulse"></div>
      } @else {
        <h2 class="text-3xl md:text-5xl font-extrabold mb-4 tracking-wider">
          {{ categoryResource.value()?.name?.toUpperCase() || title() }}
        </h2>
        <p class="text-base md:text-lg text-sabotage-muted">
          {{ categoryResource.value()?.description || subtitle() }}
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
  private readonly seo = inject(SeoService);

  // Inputs for different catalog types (fallback values)
  readonly category = input<string>('oversize');
  readonly title = input('POLOS OVERSIZE');
  readonly subtitle = input('Descubre nuestra colección de polos con estilo urbano');
  readonly showTypeFilter = input(true);

  // Category data from database
  // State
  readonly currentFilters = signal<FilterState>({
    types: [],
    sizes: [],
    colors: [],
    themes: [],
    priceRange: { min: 0, max: 150 }
  });

  // Resource for category metadata
  readonly categoryResource = resource<DbCategory | null, string>({
    params: () => this.category(),
    loader: async ({ params: slug }) => {
      // Ensure product service is ready (which loads categories)
      await this.productService.ensureInitialized();

      // Try cache first
      const cachedFn = this.productService.categories().find(c => c.slug === slug);
      if (cachedFn) return cachedFn;

      // Fallback fetch if not in cache (rare)
      const categories = await this.supabase.getAll<DbCategory>('categories', {
        filters: [{ column: 'slug', operator: 'eq', value: slug }]
      });
      return categories[0] || null;
    }
  });

  constructor() {
    // Initialize AOS
    this.aos.init();

    // Effect to update SEO when resource loads
    effect(() => {
      const cat = this.categoryResource.value();
      const slug = this.category();
      if (cat) {
        this.seo.updateTags({
          title: cat.name.toUpperCase(),
          description: cat.description || this.subtitle(),
          url: `https://sabotage.pe/${slug}`,
          type: 'website'
        });
      } else if (!this.categoryResource.isLoading()) {
        // Fallback SEO
        this.seo.updateTags({
          title: this.title(),
          description: this.subtitle(),
          url: `https://sabotage.pe/${slug}`,
          type: 'website'
        });
      }
    });
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
