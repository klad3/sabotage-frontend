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
      class="h-full bg-sabotage-dark border-2 border-sabotage-border p-4 md:p-5 rounded-lg cursor-pointer transition-all duration-400 relative overflow-hidden shimmer hover-lift group flex flex-col"
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
        <!-- Product Name: fixed height for 2 lines -->
        <h3 class="text-base md:text-lg font-bold mb-2 text-sabotage-light uppercase line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
          {{ product().name }}
        </h3>
        
        <!-- Description: fixed height for 2 lines -->
        <p class="text-xs md:text-sm text-sabotage-muted mb-3 leading-relaxed line-clamp-2 min-h-[2.25rem] md:min-h-[2.5rem]">
          {{ product().description }}
        </p>

        <!-- Color indicators & Theme tag row -->
        <div class="flex items-center justify-between gap-2 h-7 mb-2">
          <!-- Color swatches -->
          @if (product().colors.length > 1) {
            <div class="flex items-center gap-1">
              @for (color of product().colors.slice(0, 4); track color.id) {
                <span
                  class="w-4 h-4 rounded-full border border-sabotage-border"
                  [style.background-color]="color.hexCode || '#808080'"
                  [attr.title]="color.name"
                ></span>
              }
              @if (product().colors.length > 4) {
                <span class="text-xs text-sabotage-muted ml-1">+{{ product().colors.length - 4 }}</span>
              }
            </div>
          } @else {
            <div></div>
          }

          <!-- Theme tag -->
          @if (product().theme) {
            <span class="inline-block px-2 md:px-3 py-1 bg-sabotage-border text-sabotage-light text-xs rounded-xl font-semibold uppercase truncate max-w-[50%]">
              {{ product().theme }}
            </span>
          }
        </div>

        <!-- Price: always at bottom -->
        <div class="text-lg md:text-2xl font-extrabold text-sabotage-light mt-auto">
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
    class: 'block h-full'
  }
})
export class ProductCardComponent {
  readonly product = input.required<Product>();

  readonly cardClick = output<Product>();
}
