import { Component, inject, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  template: `
    <!-- Backdrop -->
    @if (cartService.isSidebarOpen()) {
      <div 
        class="fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300"
        (click)="cartService.closeSidebar()"
        data-aos="fade-in"
      ></div>
    }

    <!-- Sidebar Panel -->
    <aside
      class="fixed top-0 right-0 h-full w-full max-w-md bg-[#1a1a1a] [.light-mode_&]:bg-white border-l border-white/10 [.light-mode_&]:border-gray-200 z-[70] transform transition-transform duration-300 flex flex-col shadow-2xl text-gray-100 [.light-mode_&]:text-black"
      [class.translate-x-0]="cartService.isSidebarOpen()"
      [class.translate-x-full]="!cartService.isSidebarOpen()"
    >
      <!-- Header (Always Dark) -->
      <div class="p-5 border-b border-white/10 flex items-center justify-between bg-[#0d0d0d]">
        <h2 class="font-space font-bold text-xl uppercase tracking-wider flex items-center gap-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Tu Carrito ({{ cartService.itemCount() }})
        </h2>
        <button 
          (click)="cartService.closeSidebar()"
          class="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-5 custom-scrollbar">
        @if (cartService.isLoading() && cartService.isEmpty()) {
          <!-- Loading Skeleton -->
          <div class="space-y-4 animate-pulse">
            @for (i of [1,2,3]; track i) {
                <div class="flex gap-4">
                  <div class="w-20 h-24 bg-white/5 [.light-mode_&]:bg-gray-200 rounded"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-white/5 [.light-mode_&]:bg-gray-200 rounded w-3/4"></div>
                    <div class="h-4 bg-white/5 [.light-mode_&]:bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
            }
          </div>
        } @else if (cartService.isEmpty()) {
          <!-- Empty State -->
          <div class="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-gray-500 [.light-mode_&]:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p class="text-lg font-space font-bold uppercase text-gray-300 [.light-mode_&]:text-gray-600">Tu carrito está vacío</p>
            <button 
              (click)="cartService.closeSidebar()"
              class="text-sabotage-accent hover:underline"
            >
              Seguir explorando
            </button>
          </div>
        } @else {
          <!-- Item List -->
          <div class="space-y-6">
            @for (item of cartService.items(); track item.id) {
              <div class="flex gap-4 group">
                <!-- Image -->
                <!-- Image -->
                <a 
                  [routerLink]="['/producto', productService.generateSlug(item.product.name)]"
                  (click)="cartService.closeSidebar()"
                  class="relative w-20 h-24 bg-white/5 [.light-mode_&]:bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-white/10 [.light-mode_&]:border-gray-200 cursor-pointer"
                >
                  @if (item.product_color?.images?.[0]?.image_url || item.product.image_url) {
                    <img 
                      [ngSrc]="item.product_color?.images?.[0]?.image_url || item.product.image_url || ''" 
                      [alt]="item.product.name" 
                      fill
                      class="object-cover"
                    >
                  } @else {
                    <div class="w-full h-full flex items-center justify-center bg-white/5 [.light-mode_&]:bg-gray-100 p-4">
                      <img 
                        src="/img/sabotage logo.svg" 
                        alt="Sabotage" 
                        class="w-10 h-10 opacity-50 contrast-0"
                      >
                    </div>
                  }
                </a>

                <!-- Info -->
                <div class="flex-1 flex flex-col justify-between">
                  <div class="flex justify-between items-start gap-2">
                    <div>
                      <a 
                        [routerLink]="['/producto', productService.generateSlug(item.product.name)]"
                        (click)="cartService.closeSidebar()"
                        class="font-bold text-sm uppercase leading-tight group-hover:text-sabotage-accent transition-colors text-white [.light-mode_&]:text-black hover:underline cursor-pointer block"
                      >
                        {{ item.product.name }}
                      </a>
                      <p class="text-xs text-gray-400 [.light-mode_&]:text-gray-500 mt-1">
                        {{ item.size }} / {{ item.product_color?.color_name || 'Estándar' }}
                      </p>
                    </div>
                    <button 
                      (click)="cartService.removeItem(item.id)"
                      class="text-gray-500 [.light-mode_&]:text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Eliminar"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div class="flex justify-between items-end mt-2">
                    <!-- Quantity Controls -->
                    <div class="flex items-center gap-3 bg-white/5 [.light-mode_&]:bg-gray-100 rounded-lg px-2 py-1 border border-white/5 [.light-mode_&]:border-gray-200">
                      <button 
                        (click)="cartService.decreaseQuantity(item.id)"
                        class="text-gray-400 [.light-mode_&]:text-gray-500 hover:text-white [.light-mode_&]:hover:text-black transition-colors disabled:opacity-30"
                        [disabled]="item.quantity <= 1"
                      >-</button>
                      <span class="text-sm font-bold w-4 text-center text-white [.light-mode_&]:text-black">{{ item.quantity }}</span>
                      <button 
                        (click)="cartService.increaseQuantity(item.id)"
                        class="text-gray-400 [.light-mode_&]:text-gray-500 hover:text-white [.light-mode_&]:hover:text-black transition-colors disabled:opacity-30"
                        [disabled]="item.quantity >= 10"
                      >+</button>
                    </div>

                    <span class="font-bold font-space text-white [.light-mode_&]:text-black">
                      S/ {{ (item.product.price * item.quantity).toFixed(2) }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Footer (Always Dark) -->
      @if (!cartService.isEmpty()) {
        <div class="p-5 border-t border-white/10 bg-[#0d0d0d]">
          <div class="flex justify-between items-end mb-4 font-space font-bold text-xl text-white">
            <span>SUBTOTAL</span>
            <span>S/ {{ cartService.subtotal().toFixed(2) }}</span>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <a 
              routerLink="/"
              (click)="cartService.closeSidebar()"
              class="w-full justify-center text-sm font-bold uppercase py-3 border border-white/20 text-white hover:bg-white/10 transition-colors text-center flex items-center"
            >
              SEGUIR COMPRANDO
            </a>
            <a 
              routerLink="/carrito" 
              (click)="cartService.closeSidebar()"
              class="w-full justify-center text-sm font-bold uppercase py-3 bg-sabotage-accent text-white hover:bg-white hover:text-black transition-colors text-center flex items-center"
            >
              VER CARRITO
            </a>
          </div>
        </div>
      }
    </aside>
  `,
  styles: [`
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
    }
    
    :host-context(body.light-mode) .custom-scrollbar {
        scrollbar-color: rgba(0,0,0,0.1) transparent;
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
    }

    :host-context(body.light-mode) .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,0.1);
    }
  `]
})
export class CartSidebarComponent {
  readonly cartService = inject(CartService);
  readonly productService = inject(ProductService);
}
