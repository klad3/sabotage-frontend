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
      class="h-auto bg-sabotage-dark border-2 border-sabotage-border p-4 md:p-5 rounded-lg cursor-pointer transition-all duration-400 relative overflow-hidden shimmer hover-lift group flex flex-col"
      [attr.aria-label]="'Ver detalles de ' + product().name"
    >
      <!-- Product Image -->
      <div class="bg-sabotage-gray mb-4 overflow-hidden rounded aspect-[3/4]">
        <img
          [src]="product().imageUrl"
          [alt]="product().name"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      <!-- Product Info -->
      <div class="flex-1 flex flex-col">
        <h3 class="text-base md:text-xl font-bold mb-2 text-sabotage-light">
          {{ product().name }}
        </h3>
        <p class="text-xs md:text-sm text-sabotage-muted mb-3 leading-relaxed line-clamp-2">
          {{ product().description }}
        </p>

        @if (product().theme) {
          <span class="inline-block px-2 md:px-3 py-1 bg-sabotage-border text-sabotage-light text-xs rounded-xl mb-2 font-semibold uppercase w-fit">
            {{ product().theme }}
          </span>
        }

        <div class="text-lg md:text-2xl font-extrabold text-sabotage-light mt-auto pt-2">
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

