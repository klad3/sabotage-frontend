import { Component, input, output, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product, CartItem } from '../../../../core/models/product.model';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-product-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-[10000] bg-black/95 overflow-y-auto overflow-x-hidden animate-[fadeIn_0.3s_ease]"
        (click)="closeModal($event)"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'modal-title-' + product()?.id"
      >
        <div
          class="relative bg-sabotage-dark my-[5%] mx-auto border-[3px] border-sabotage-border w-[90%] md:w-[90%] max-w-[900px] rounded-xl animate-[slideDown_0.4s_ease]"
          (click)="$event.stopPropagation()"
        >
          <!-- Close Button -->
          <button
            type="button"
            (click)="close()"
            class="absolute right-5 top-4 text-4xl font-bold text-sabotage-light cursor-pointer z-[100] leading-none w-10 h-10 flex items-center justify-center transition-all duration-300 hover:text-sabotage-accent hover:rotate-90"
            aria-label="Cerrar modal"
          >
            &times;
          </button>

          <!-- Modal Content -->
          <div class="flex flex-col md:flex-row p-8 md:p-10 gap-8 md:gap-10">
            <!-- Product Image -->
            <div class="flex-1 max-w-full md:max-w-[400px] min-w-[200px]">
              <img
                [src]="product()?.imageUrl"
                [alt]="product()?.name"
                class="w-full h-auto rounded-lg border-2 border-sabotage-border"
              />
            </div>

            <!-- Product Info -->
            <div class="flex-1 flex flex-col">
              <h2
                [id]="'modal-title-' + product()?.id"
                class="text-2xl md:text-3xl font-extrabold mb-4 tracking-wide"
              >
                {{ product()?.name }}
              </h2>

              <p class="text-base md:text-lg text-sabotage-muted leading-relaxed mb-5">
                {{ product()?.description }}
              </p>

              <div class="text-3xl md:text-4xl font-extrabold text-sabotage-light my-5">
                S/ {{ product()?.price?.toFixed(2) }}
              </div>

              <!-- Options -->
              <div class="my-6 md:my-8">
                <!-- Size Selector -->
                <div class="mb-6">
                  <label for="modal-size" class="block font-bold mb-3 tracking-wide text-sm">
                    TALLA:
                  </label>
                  <select
                    id="modal-size"
                    [(ngModel)]="selectedSize"
                    class="w-full p-3 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light rounded cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23f2f2f2%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_15px_center] pr-10 transition-all duration-300 hover:border-sabotage-light focus:border-sabotage-light focus:outline-none"
                  >
                    @for (size of product()?.sizes || []; track size) {
                      <option [value]="size">{{ size }}</option>
                    }
                  </select>
                </div>

                <!-- Quantity Selector -->
                <div class="mb-6">
                  <label class="block font-bold mb-3 tracking-wide text-sm">
                    CANTIDAD:
                  </label>
                  <div class="flex items-center gap-4">
                    <button
                      type="button"
                      (click)="decreaseQuantity()"
                      class="w-10 h-10 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light text-xl cursor-pointer rounded flex items-center justify-center transition-all duration-300 hover:bg-sabotage-border hover:border-sabotage-light"
                      aria-label="Disminuir cantidad"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      [(ngModel)]="quantity"
                      [min]="1"
                      [max]="10"
                      readonly
                      class="w-16 p-2 text-center bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light text-lg rounded font-semibold"
                      aria-label="Cantidad"
                    />
                    <button
                      type="button"
                      (click)="increaseQuantity()"
                      class="w-10 h-10 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light text-xl cursor-pointer rounded flex items-center justify-center transition-all duration-300 hover:bg-sabotage-border hover:border-sabotage-light"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <!-- Add to Cart Button -->
              <button
                type="button"
                (click)="addToCart()"
                [disabled]="isAdding() || !product()?.inStock"
                class="w-full py-4 md:py-5 bg-sabotage-light text-black font-extrabold text-lg tracking-wider rounded mt-auto transition-all duration-300 hover:bg-white hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                [class.bg-sabotage-success]="isAdded()"
              >
                @if (isAdded()) {
                  ✓ AGREGADO AL CARRITO
                } @else if (!product()?.inStock) {
                  AGOTADO
                } @else {
                  AGREGAR AL CARRITO
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  host: {
    class: 'block'
  }
})
export class ProductModalComponent {
  private readonly cartService = inject(CartService);

  readonly product = input<Product | null>(null);
  readonly isOpen = input(false);

  readonly closed = output<void>();

  selectedSize = '';
  quantity = 1;

  readonly isAdding = signal(false);
  readonly isAdded = signal(false);

  closeModal(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
    this.resetState();
    document.body.style.overflow = 'auto';
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    if (this.quantity < 10) {
      this.quantity++;
    }
  }

  addToCart(): void {
    const prod = this.product();
    if (!prod) return;

    if (!this.selectedSize && prod.sizes?.length) {
      this.selectedSize = prod.sizes[0];
    }

    if (!this.selectedSize) return;

    this.isAdding.set(true);

    const cartItem: Omit<CartItem, 'id'> = {
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      type: prod.type,
      size: this.selectedSize,
      quantity: this.quantity,
      imageUrl: prod.imageUrl
    };

    this.cartService.addItem(cartItem);

    this.isAdded.set(true);
    this.isAdding.set(false);

    setTimeout(() => {
      this.close();
    }, 1500);
  }

  private resetState(): void {
    this.selectedSize = '';
    this.quantity = 1;
    this.isAdding.set(false);
    this.isAdded.set(false);
  }

  // Auto-select first size when product changes
  ngOnChanges(): void {
    const prod = this.product();
    if (prod?.sizes?.length && !this.selectedSize) {
      this.selectedSize = prod.sizes[0];
    }
  }
}
