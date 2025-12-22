import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-products-month',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="py-12 md:py-20 px-5 md:px-10 max-w-[1400px] mx-auto">
      <h2 class="text-3xl md:text-5xl font-extrabold text-center mb-10 md:mb-16 tracking-wider slide-in">
        PRODUCTOS DEL MES
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
        @for (product of featuredProducts(); track product.id; let i = $index) {
          <a
            [routerLink]="product.category === 'oversize' ? '/oversize' : '/polos-clasicos'"
            class="bg-sabotage-dark border-2 border-sabotage-border p-5 cursor-pointer relative overflow-hidden shimmer hover-lift group"
            [style.animation-delay]="i * 0.15 + 's'"
          >
            <div class="w-full bg-sabotage-gray mb-5 overflow-hidden">
              <img
                [src]="product.imageUrl"
                [alt]="product.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div class="product-info">
              <h3 class="text-lg md:text-2xl font-bold mb-2 uppercase">{{ product.name }}</h3>
              <p class="text-sm md:text-lg text-sabotage-muted mb-4">{{ product.description }}</p>
              <div class="text-xl md:text-3xl font-extrabold">S/ {{ product.price.toFixed(2) }}</div>
            </div>
          </a>
        }
      </div>
    </section>
  `,
  host: {
    class: 'block'
  }
})
export class ProductsMonthComponent {
  private readonly productService = inject(ProductService);

  readonly featuredProducts = this.productService.featuredProducts;
}
