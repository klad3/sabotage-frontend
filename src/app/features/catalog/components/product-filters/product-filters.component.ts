import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterState } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <!-- Mobile Toggle Button -->
    <div class="md:hidden mb-4">
      <button
        type="button"
        (click)="toggleFilters()"
        class="w-full py-3 px-4 bg-sabotage-dark border-2 border-sabotage-border text-sabotage-light font-bold rounded-lg flex items-center justify-center gap-2"
      >
        ☰ FILTROS
      </button>
    </div>

    <!-- Filters Panel -->
    <aside
      class="w-full md:w-[300px] bg-sabotage-dark border-2 border-sabotage-border p-6 h-fit md:sticky md:top-[120px] rounded-lg transition-all duration-300"
      [class.hidden]="!isOpen() && isMobile()"
      [class.block]="isOpen() || !isMobile()"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 pb-4 border-b-2 border-sabotage-border">
        <h3 class="text-xl md:text-2xl font-bold tracking-wide">FILTROS</h3>
        <button
          type="button"
          (click)="clearFilters()"
          class="bg-transparent border border-[#666] text-sabotage-muted px-4 py-2 text-sm rounded cursor-pointer transition-all duration-300 hover:bg-sabotage-border hover:text-sabotage-light hover:border-sabotage-light"
        >
          Limpiar Todo
        </button>
      </div>

      <!-- Type Filter -->
      <div class="mb-6 pb-5 border-b border-sabotage-border">
        <h4 class="text-base font-bold mb-4 tracking-wide">TIPO</h4>
        <div class="flex flex-col gap-2">
          <label class="flex items-center cursor-pointer p-2 rounded transition-all duration-300 hover:bg-sabotage-gray">
            <input
              type="checkbox"
              [checked]="isTypeSelected('simple')"
              (change)="toggleType('simple')"
              class="w-[18px] h-[18px] mr-3 cursor-pointer accent-sabotage-light"
            />
            <span class="text-sabotage-muted">Sin personalizar</span>
          </label>
          <label class="flex items-center cursor-pointer p-2 rounded transition-all duration-300 hover:bg-sabotage-gray">
            <input
              type="checkbox"
              [checked]="isTypeSelected('personalizado')"
              (change)="toggleType('personalizado')"
              class="w-[18px] h-[18px] mr-3 cursor-pointer accent-sabotage-light"
            />
            <span class="text-sabotage-muted">Personalizado</span>
          </label>
        </div>
      </div>


      <!-- Size Filter -->
      <div class="mb-6 pb-5 border-b border-sabotage-border">
        <h4 class="text-base font-bold mb-4 tracking-wide">TALLAS</h4>
        <div class="flex flex-col gap-2">
          @for (size of sizes; track size) {
            <label class="flex items-center cursor-pointer p-2 rounded transition-all duration-300 hover:bg-sabotage-gray">
              <input
                type="checkbox"
                [checked]="isSizeSelected(size)"
                (change)="toggleSize(size)"
                class="w-[18px] h-[18px] mr-3 cursor-pointer accent-sabotage-light"
              />
              <span class="text-sabotage-muted">{{ size }}</span>
            </label>
          }
        </div>
      </div>

      <!-- Color Filter -->
      <div class="mb-6 pb-5 border-b border-sabotage-border">
        <h4 class="text-base font-bold mb-4 tracking-wide">COLORES</h4>
        <div class="flex flex-col gap-2">
          @for (color of colors; track color.value) {
            <label class="flex items-center cursor-pointer p-2 rounded transition-all duration-300 hover:bg-sabotage-gray">
              <input
                type="checkbox"
                [checked]="isColorSelected(color.value)"
                (change)="toggleColor(color.value)"
                class="w-[18px] h-[18px] mr-3 cursor-pointer accent-sabotage-light"
              />
              <span class="text-sabotage-muted">{{ color.label }}</span>
            </label>
          }
        </div>
      </div>

      <!-- Theme Filter (only for personalized) -->
      @if (showThemeFilter()) {
        <div class="mb-6 pb-5 border-b border-sabotage-border">
          <h4 class="text-base font-bold mb-4 tracking-wide">TEMÁTICA</h4>
          <div class="flex flex-col gap-2">
            @for (theme of themes; track theme.value) {
              <label class="flex items-center cursor-pointer p-2 rounded transition-all duration-300 hover:bg-sabotage-gray">
                <input
                  type="checkbox"
                  [checked]="isThemeSelected(theme.value)"
                  (change)="toggleTheme(theme.value)"
                  class="w-[18px] h-[18px] mr-3 cursor-pointer accent-sabotage-light"
                />
                <span class="text-sabotage-muted">{{ theme.label }}</span>
              </label>
            }
          </div>
        </div>
      }

      <!-- Price Filter -->
      <div class="mb-6">
        <h4 class="text-base font-bold mb-4 tracking-wide">PRECIO MÁXIMO</h4>
        <div class="px-1 py-2">
          <div class="text-center mb-3 font-semibold text-xl">
            S/ {{ priceMax() }}
          </div>
          <input
            type="range"
            [min]="10"
            [max]="150"
            [value]="priceMax()"
            (input)="updatePriceMax($event)"
            class="w-full h-[6px] bg-sabotage-border rounded-md outline-none cursor-pointer accent-sabotage-light"
          />
          <div class="flex justify-between text-sm text-sabotage-muted mt-2">
            <span>S/ 10</span>
            <span>S/ 150</span>
          </div>
        </div>
      </div>
    </aside>
  `,
  host: {
    class: 'block'
  }
})
export class ProductFiltersComponent {
  readonly showTypeFilter = input(true);

  readonly filtersChange = output<FilterState>();

  readonly sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  readonly colors = [
    { value: 'negro', label: 'Negro' },
    { value: 'blanco', label: 'Blanco' },
    { value: 'gris', label: 'Gris' },
    { value: 'azul', label: 'Azul' },
    { value: 'rojo', label: 'Rojo' },
    { value: 'verde', label: 'Verde' },
    { value: 'amarillo', label: 'Amarillo' }
  ];

  readonly themes = [
    { value: 'anime', label: 'Anime' },
    { value: 'videojuegos', label: 'Videojuegos' },
    { value: 'espiritual', label: 'Espiritual' },
    { value: 'urbano', label: 'Urbano' },
    { value: 'musica', label: 'Música' },
    { value: 'skate', label: 'Skate' }
  ];

  // State
  readonly isOpen = signal(false);
  readonly selectedTypes = signal<string[]>([]);
  readonly selectedSizes = signal<string[]>([]);
  readonly selectedColors = signal<string[]>([]);
  readonly selectedThemes = signal<string[]>([]);
  readonly priceMin = signal(0);
  readonly priceMax = signal(150);

  readonly showThemeFilter = computed(() =>
    this.selectedTypes().includes('personalizado')
  );

  readonly isMobile = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      this.isMobile.set(window.innerWidth < 768);
      window.addEventListener('resize', () => {
        this.isMobile.set(window.innerWidth < 768);
      });
    }
  }

  toggleFilters(): void {
    this.isOpen.update(v => !v);
  }

  isTypeSelected(type: string): boolean {
    return this.selectedTypes().includes(type);
  }

  isSizeSelected(size: string): boolean {
    return this.selectedSizes().includes(size);
  }

  isColorSelected(color: string): boolean {
    return this.selectedColors().includes(color);
  }

  isThemeSelected(theme: string): boolean {
    return this.selectedThemes().includes(theme);
  }

  toggleType(type: string): void {
    this.selectedTypes.update(types =>
      types.includes(type) ? types.filter(t => t !== type) : [...types, type]
    );

    // Clear themes if personalizado is deselected
    if (!this.selectedTypes().includes('personalizado')) {
      this.selectedThemes.set([]);
    }

    this.emitFilters();
  }

  toggleSize(size: string): void {
    this.selectedSizes.update(sizes =>
      sizes.includes(size) ? sizes.filter(s => s !== size) : [...sizes, size]
    );
    this.emitFilters();
  }

  toggleColor(color: string): void {
    this.selectedColors.update(colors =>
      colors.includes(color) ? colors.filter(c => c !== color) : [...colors, color]
    );
    this.emitFilters();
  }

  toggleTheme(theme: string): void {
    this.selectedThemes.update(themes =>
      themes.includes(theme) ? themes.filter(t => t !== theme) : [...themes, theme]
    );
    this.emitFilters();
  }

  updatePriceMin(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (value < this.priceMax() - 10) {
      this.priceMin.set(value);
      this.emitFilters();
    }
  }

  updatePriceMax(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (value > this.priceMin() + 10) {
      this.priceMax.set(value);
      this.emitFilters();
    }
  }

  clearFilters(): void {
    this.selectedTypes.set([]);
    this.selectedSizes.set([]);
    this.selectedColors.set([]);
    this.selectedThemes.set([]);
    this.priceMin.set(0);
    this.priceMax.set(150);
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filtersChange.emit({
      types: this.selectedTypes(),
      sizes: this.selectedSizes(),
      colors: this.selectedColors(),
      themes: this.selectedThemes(),
      priceRange: {
        min: this.priceMin(),
        max: this.priceMax()
      }
    });
  }
}
