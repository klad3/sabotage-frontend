import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '../../../../core/models/product.model';

@Component({
    selector: 'app-product-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <article
      (click)="cardClick.emit(product())"
      (keydown.enter)="cardClick.emit(product())"
      tabindex="0"
      role="button"
      class="h-[550px] bg-sabotage-dark border-2 border-sabotage-border p-5 rounded-lg cursor-pointer transition-all duration-400 relative overflow-hidden shimmer hover-lift group"
      [attr.aria-label]="'Ver detalles de ' + product().name"
    >
      <!-- Product Image -->
      <div class="bg-sabotage-gray mb-5 overflow-hidden rounded">
        <img
          [src]="product().imageUrl"
          [alt]="product().name"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <h3 class="text-lg md:text-xl font-bold mb-2 text-sabotage-light">
          {{ product().name }}
        </h3>
        <p class="text-sm text-sabotage-muted mb-3 leading-relaxed line-clamp-2">
          {{ product().description }}
        </p>

        @if (product().theme) {
          <span class="inline-block px-3 py-1 bg-sabotage-border text-sabotage-light text-xs rounded-xl mt-2 font-semibold uppercase">
            {{ product().theme }}
          </span>
        }

        <div class="text-xl md:text-2xl font-extrabold text-sabotage-light mt-4">
          S/ {{ product().price.toFixed(2) }}
        </div>
      </div>

      @if (!product().inStock) {
        <div class="absolute inset-0 bg-black/70 flex items-center justify-center">
          <span class="text-xl font-bold text-sabotage-accent">AGOTADO</span>
        </div>
      }
    </article>
  `,
    host: {
        class: 'block'
    }
})
export class ProductCardComponent {
    readonly product = input.required<Product>();

    readonly cardClick = output<Product>();
}
