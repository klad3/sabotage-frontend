import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartItemComponent } from './components/cart-item/cart-item.component';
import { CartSummaryComponent } from './components/cart-summary/cart-summary.component';

@Component({
    selector: 'app-cart',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, CartItemComponent, CartSummaryComponent],
    template: `
    <!-- Page Header -->
    <section class="text-center py-12 md:py-16 px-5 bg-sabotage-dark border-b-2 border-sabotage-border">
      <h2 class="text-3xl md:text-5xl font-extrabold mb-4 tracking-wider">
        TU CARRITO
      </h2>
      <p class="text-base md:text-lg text-sabotage-muted">
        Revisa tus productos antes de finalizar tu compra
      </p>
    </section>

    <!-- Cart Content -->
    <div class="max-w-[1400px] mx-auto p-5 md:p-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 md:gap-10 min-h-[60vh]">
      <!-- Products List -->
      <div class="flex flex-col gap-5 order-2 lg:order-1">
        @if (cartService.isEmpty()) {
          <div class="text-center py-16 md:py-20 bg-sabotage-dark border-2 border-sabotage-border rounded-lg">
            <h3 class="text-2xl mb-4 text-sabotage-muted">Tu carrito está vacío</h3>
            <p class="text-lg text-[#888] mb-8">¡Agrega productos y viste tu pasión!</p>
            <a
              routerLink="/oversize"
              class="inline-block px-8 py-4 bg-sabotage-light text-black font-bold tracking-wider rounded transition-all duration-300 hover:bg-white hover:scale-105"
            >
              EXPLORAR PRODUCTOS
            </a>
          </div>
        } @else {
          @for (item of cartService.items(); track item.id) {
            <app-cart-item
              [item]="item"
              (increase)="cartService.increaseQuantity(item.id)"
              (decrease)="cartService.decreaseQuantity(item.id)"
              (remove)="removeItem(item.id)"
            />
          }
        }
      </div>

      <!-- Order Summary -->
      <div class="order-1 lg:order-2">
        <app-cart-summary />
      </div>
    </div>
  `,
    host: {
        class: 'block'
    }
})
export class CartComponent {
    readonly cartService = inject(CartService);

    removeItem(itemId: string): void {
        if (typeof window !== 'undefined' && confirm('¿Estás seguro de eliminar este producto?')) {
            this.cartService.removeItem(itemId);
        }
    }
}
