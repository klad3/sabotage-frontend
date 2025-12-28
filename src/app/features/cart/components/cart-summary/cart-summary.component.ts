import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { DbOrder } from '../../../../core/models/product.model';
import { environment } from '../../../../../environments/environment';

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
        <div class="flex justify-between py-3 text-base md:text-lg text-sabotage-muted border-b border-sabotage-gray">
          <span>Subtotal:</span>
          <span class="font-semibold">S/ {{ cartService.subtotal().toFixed(2) }}</span>
        </div>
        <div class="flex justify-between py-3 text-base md:text-lg text-sabotage-muted border-b border-sabotage-gray">
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
        <h4 class="text-sm font-bold tracking-wide text-sabotage-muted mb-4">¿TIENES UN CÓDIGO?</h4>
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
            class="px-5 py-3 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light font-bold rounded cursor-pointer transition-all duration-300 hover:bg-sabotage-border hover:border-sabotage-light"
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
        [disabled]="cartService.isEmpty() || isProcessing()"
        class="w-full py-4 md:py-5 bg-sabotage-light text-sabotage-black font-extrabold text-lg md:text-xl tracking-wider rounded mt-6 transition-all duration-300 hover:opacity-90 hover:scale-[1.02] disabled:bg-[#555] disabled:text-[#888] disabled:cursor-not-allowed disabled:transform-none"
      >
        @if (isProcessing()) {
          PROCESANDO...
        } @else {
          FINALIZAR COMPRA
        }
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
  private readonly supabase = inject(SupabaseService);

  discountCode = '';
  readonly discountMessage = signal<string | null>(null);
  readonly discountSuccess = signal(false);
  readonly isProcessing = signal(false);

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

  async checkout(): Promise<void> {
    this.isProcessing.set(true);
    const cartData = this.cartService.getCartData();

    try {
      // Generate order number
      const orderNumber = this.generateOrderNumber();

      // Save order to Supabase (if configured)
      if (this.supabase.isEnabled) {
        const orderData: Partial<DbOrder> = {
          order_number: orderNumber,
          customer_name: 'Cliente WhatsApp', // Se actualiza después por el admin
          customer_phone: 'Pendiente', // Se actualiza cuando contacta por WhatsApp
          items: cartData.items.map(item => ({
            id: item.product_id,
            name: item.product.name,
            size: item.size,
            color: item.product_color?.color_name || undefined,
            quantity: item.quantity,
            price: item.product.price,
            image: item.product_color?.images?.[0]?.image_url || item.product.image_url || undefined
          })),
          subtotal: cartData.subtotal,
          shipping: cartData.shipping,
          discount_code: cartData.discountCode || undefined,
          discount_amount: cartData.discountAmount,
          total: cartData.total,
          status: 'pending',
          notes: 'Pedido generado desde la web - pendiente de datos del cliente'
        };

        await this.supabase.insert<DbOrder>('orders', orderData);
      }

      // Build WhatsApp message
      let message = '🛍️ *NUEVO PEDIDO - SABOTAGE*\n';
      message += `📋 Pedido: #${orderNumber}\n\n`;
      message += '*PRODUCTOS:*\n';

      cartData.items.forEach((item, index) => {
        message += `\n${index + 1}. ${item.product.name}\n`;
        message += `   • Talla: ${item.size}\n`;
        if (item.product_color?.color_name) {
          message += `   • Color: ${item.product_color.color_name}\n`;
        }
        message += `   • Cantidad: ${item.quantity}\n`;
        message += `   • Precio: S/ ${(item.product.price * item.quantity).toFixed(2)}\n`;
      });

      message += '\n*RESUMEN:*\n';
      message += `Subtotal: S/ ${cartData.subtotal.toFixed(2)}\n`;
      message += `Envío: S/ ${cartData.shipping.toFixed(2)}\n`;

      if (cartData.discountAmount > 0) {
        message += `Descuento (${cartData.discountCode}): -S/ ${cartData.discountAmount.toFixed(2)}\n`;
      }

      message += `*TOTAL: S/ ${cartData.total.toFixed(2)}*\n\n`;
      message += '📍 Por favor, envíame tu:\n';
      message += '• Nombre completo\n';
      message += '• Dirección de envío\n';
      message += '• Distrito\n\n';
      message += '¡Gracias por tu compra! 🔥';

      // Open WhatsApp
      const encodedMessage = encodeURIComponent(message);
      const phoneNumber = environment.whatsapp?.phoneNumber || '51933866156';
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      if (typeof window !== 'undefined') {
        window.open(whatsappUrl, '_blank');
      }

      // Clear cart automatically after sending
      await this.cartService.clearCart();

    } catch (error) {
      console.error('Error creating order:', error);
      // Even if Supabase fails, still open WhatsApp
      this.openWhatsAppFallback(cartData);
    } finally {
      this.isProcessing.set(false);
    }
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SAB-${year}${month}${day}-${random}`;
  }

  private async openWhatsAppFallback(cartData: ReturnType<typeof this.cartService.getCartData>): Promise<void> {
    let message = '🛍️ *NUEVO PEDIDO - SABOTAGE*\n\n';
    message += '*PRODUCTOS:*\n';

    cartData.items.forEach((item, index) => {
      message += `\n${index + 1}. ${item.product.name}\n`;
      message += `   • Talla: ${item.size}\n`;
      if (item.product_color?.color_name) {
        message += `   • Color: ${item.product_color.color_name}\n`;
      }
      message += `   • Cantidad: ${item.quantity}\n`;
      message += `   • Precio: S/ ${(item.product.price * item.quantity).toFixed(2)}\n`;
    });

    message += '\n*RESUMEN:*\n';
    message += `Subtotal: S/ ${cartData.subtotal.toFixed(2)}\n`;
    message += `Envío: S/ ${cartData.shipping.toFixed(2)}\n`;

    if (cartData.discountAmount > 0) {
      message += `Descuento (${cartData.discountCode}): -S/ ${cartData.discountAmount.toFixed(2)}\n`;
    }

    message += `*TOTAL: S/ ${cartData.total.toFixed(2)}*\n\n`;
    message += '¡Gracias por tu compra! 🔥';

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = environment.whatsapp?.phoneNumber || '51933866156';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }

    await this.cartService.clearCart();
  }
}

