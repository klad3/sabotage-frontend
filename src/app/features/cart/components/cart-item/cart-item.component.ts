import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CartItem } from '../../../../core/models/product.model';

@Component({
    selector: 'app-cart-item',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <article class="flex flex-col md:flex-row gap-5 bg-sabotage-dark border-2 border-sabotage-border p-5 rounded-lg transition-all duration-300 animate-[slideIn_0.4s_ease] hover:border-[#555]">
      <!-- Product Image -->
      <div class="w-full md:w-[120px] h-[200px] md:h-[120px] flex-shrink-0 bg-sabotage-gray rounded overflow-hidden">
        <img
          [src]="item().imageUrl"
          [alt]="item().name"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <!-- Product Info -->
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <h3 class="text-lg md:text-xl font-bold mb-2 text-sabotage-light">
            {{ item().name }}
          </h3>
          <p class="text-sm text-sabotage-muted">
            Talla: {{ item().size }} | Tipo: {{ item().type === 'personalizado' ? 'Personalizado' : 'Sin personalizar' }}
          </p>
        </div>

        <!-- Controls -->
        <div class="flex flex-wrap items-center gap-5 mt-4">
          <!-- Quantity Selector -->
          <div class="flex items-center gap-2 bg-sabotage-gray border-2 border-sabotage-border rounded p-1">
            <button
              type="button"
              (click)="decrease.emit()"
              class="w-8 h-8 bg-transparent border-none text-sabotage-light text-xl cursor-pointer rounded transition-all duration-300 hover:bg-sabotage-border"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <input
              type="number"
              [value]="item().quantity"
              readonly
              class="w-12 text-center bg-transparent border-none text-sabotage-light text-lg font-semibold"
              [attr.aria-label]="'Cantidad: ' + item().quantity"
            />
            <button
              type="button"
              (click)="increase.emit()"
              class="w-8 h-8 bg-transparent border-none text-sabotage-light text-xl cursor-pointer rounded transition-all duration-300 hover:bg-sabotage-border"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <!-- Delete Button -->
          <button
            type="button"
            (click)="remove.emit()"
            class="bg-transparent border border-sabotage-accent text-sabotage-accent px-4 py-2 cursor-pointer text-sm rounded font-semibold transition-all duration-300 hover:bg-sabotage-accent hover:text-white"
          >
            ELIMINAR
          </button>
        </div>
      </div>

      <!-- Price -->
      <div class="text-xl md:text-2xl font-extrabold text-sabotage-light text-left md:text-right self-start">
        S/ {{ (item().price * item().quantity).toFixed(2) }}
      </div>
    </article>
  `,
    styles: `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,
    host: {
        class: 'block'
    }
})
export class CartItemComponent {
    readonly item = input.required<CartItem>();

    readonly increase = output<void>();
    readonly decrease = output<void>();
    readonly remove = output<void>();
}
