import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';

@Component({
    selector: 'app-cart-summary',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule],
    template: `
    <aside class="bg-sabotage-dark border-2 border-sabotage-border p-6 md:p-8 rounded-lg h-fit md:sticky md:top-[120px]">
      <!-- Header -->
      <div class="mb-6 pb-4 border-b-2 border-sabotage-border">
        <h3 class="text-xl md:text-2xl font-bold tracking-wide">RESUMEN DEL PEDIDO</h3>
      </div>

      <!-- Details -->
      <div class="mb-6">
        <div class="flex justify-between py-3 text-base md:text-lg text-[#ccc] border-b border-sabotage-gray">
          <span>Subtotal:</span>
          <span class="font-semibold">S/ {{ cartService.subtotal().toFixed(2) }}</span>
        </div>
        <div class="flex justify-between py-3 text-base md:text-lg text-[#ccc] border-b border-sabotage-gray">
          <span>Envío:</span>
          <span class="font-semibold">S/ {{ cartService.shipping().toFixed(2) }}</span>
        </div>
        @if (cartService.discountAmount() > 0) {
          <div class="flex justify-between py-3 text-base md:text-lg text-sabotage-success border-b border-sabotage-gray">
            <span>Descuento:</span>
            <span class="font-semibold">- S/ {{ cartService.discountAmount().toFixed(2) }}</span>
          </div>
        }
        <div class="flex justify-between py-5 text-xl md:text-2xl font-extrabold text-sabotage-light border-t-2 border-sabotage-border mt-3">
          <span>TOTAL:</span>
          <span>S/ {{ cartService.total().toFixed(2) }}</span>
        </div>
      </div>

      <!-- Discount Code -->
      <div class="py-5 border-t-2 border-b-2 border-sabotage-border my-6">
        <h4 class="text-sm font-bold tracking-wide text-[#ccc] mb-4">¿TIENES UN CÓDIGO?</h4>
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            [(ngModel)]="discountCode"
            placeholder="Ingresa tu código"
            class="flex-1 px-3 py-3 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light rounded transition-all duration-300 focus:outline-none focus:border-sabotage-light"
          />
          <button
            type="button"
            (click)="applyDiscount()"
            class="px-5 py-3 bg-sabotage-border border-2 border-sabotage-border text-sabotage-light font-bold rounded cursor-pointer transition-all duration-300 hover:bg-[#444] hover:border-sabotage-light"
          >
            APLICAR
          </button>
        </div>
        @if (discountMessage()) {
          <div
            class="mt-3 p-3 rounded text-sm font-semibold text-center"
            [class.bg-sabotage-success/20]="discountSuccess()"
            [class.border]="true"
            [class.border-sabotage-success]="discountSuccess()"
            [class.text-sabotage-success]="discountSuccess()"
            [class.bg-sabotage-accent/20]="!discountSuccess()"
            [class.border-sabotage-accent]="!discountSuccess()"
            [class.text-sabotage-accent]="!discountSuccess()"
          >
            {{ discountMessage() }}
          </div>
        }
      </div>

      <!-- Checkout Button -->
      <button
        type="button"
        (click)="checkout()"
        [disabled]="cartService.isEmpty()"
        class="w-full py-4 md:py-5 bg-sabotage-light text-black font-extrabold text-lg md:text-xl tracking-wider rounded mt-6 transition-all duration-300 hover:bg-white hover:scale-[1.02] disabled:bg-[#555] disabled:text-[#888] disabled:cursor-not-allowed disabled:transform-none"
      >
        FINALIZAR COMPRA
      </button>

      <!-- Guarantee Info -->
      <div class="mt-6 pt-5 border-t border-sabotage-border">
        <p class="text-sm text-sabotage-muted my-2">✓ Envío seguro y rápido</p>
        <p class="text-sm text-sabotage-muted my-2">✓ Cambios y devoluciones</p>
        <p class="text-sm text-sabotage-muted my-2">✓ Compra 100% protegida</p>
      </div>
    </aside>
  `,
    host: {
        class: 'block'
    }
})
export class CartSummaryComponent {
    readonly cartService = inject(CartService);

    discountCode = '';
    readonly discountMessage = signal<string | null>(null);
    readonly discountSuccess = signal(false);

    applyDiscount(): void {
        const result = this.cartService.applyDiscountCode(this.discountCode);
        this.discountMessage.set(result.message);
        this.discountSuccess.set(result.success);

        if (result.success) {
            this.discountCode = '';
        }

        // Clear error message after 3 seconds
        if (!result.success) {
            setTimeout(() => {
                this.discountMessage.set(null);
            }, 3000);
        }
    }

    checkout(): void {
        const cartData = this.cartService.getCartData();

        // Build WhatsApp message
        let message = '🛍️ *NUEVO PEDIDO - SABOTAGE*\n\n';
        message += '*PRODUCTOS:*\n';

        cartData.items.forEach((item, index) => {
            message += `\n${index + 1}. ${item.name}\n`;
            message += `   • Talla: ${item.size}\n`;
            message += `   • Cantidad: ${item.quantity}\n`;
            message += `   • Precio: S/ ${(item.price * item.quantity).toFixed(2)}\n`;
        });

        message += '\n*RESUMEN:*\n';
        message += `Subtotal: S/ ${cartData.subtotal.toFixed(2)}\n`;
        message += `Envío: S/ ${cartData.shipping.toFixed(2)}\n`;

        if (cartData.discountAmount > 0) {
            message += `Descuento (${cartData.discountCode}): -S/ ${cartData.discountAmount.toFixed(2)}\n`;
        }

        message += `*TOTAL: S/ ${cartData.total.toFixed(2)}*\n\n`;
        message += '¡Gracias por tu compra! 🔥';

        // Open WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/51933866156?text=${encodedMessage}`;

        if (typeof window !== 'undefined') {
            window.open(whatsappUrl, '_blank');
        }

        // Ask to clear cart
        if (typeof window !== 'undefined' && confirm('¿Deseas vaciar el carrito después de enviar el pedido?')) {
            this.cartService.clearCart();
        }
    }
}
