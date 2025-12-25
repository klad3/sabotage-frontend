import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, SearchBarComponent],
  template: `
    <header class="flex flex-col md:flex-row justify-between items-center px-5 py-5 bg-black border-b-2 border-sabotage-border sticky top-0 z-50">
      <h1 class="mb-4 md:mb-0">
        <a routerLink="/">
          <img
            id="logo"
            src="/img/sabotage logo.svg"
            alt="LOGO SABOTAGE"
            class="w-[55%] md:w-[65%]"
          />
        </a>
      </h1>
      <nav class="flex items-center gap-6 md:gap-10 font-space font-bold text-base md:text-[1.3rem]">
        <a
          routerLink="/"
          routerLinkActive="text-white"
          [routerLinkActiveOptions]="{ exact: true }"
          class="nav-link-underline text-sabotage-light hover:opacity-80 transition-opacity"
        >
          INICIO
        </a>

        <a
          href="#"
          class="nav-link-underline text-sabotage-light hover:opacity-80 transition-opacity cursor-not-allowed opacity-50"
          title="Próximamente"
          (click)="$event.preventDefault()"
        >
          QUIENES SOMOS
        </a>

        <!-- Products Dropdown -->
        <div class="relative group">
          <button
            class="nav-link-underline text-sabotage-light hover:opacity-80 transition-opacity flex items-center gap-1 uppercase"
          >
            PRODUCTOS
            <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div class="absolute left-1/2 -translate-x-1/2 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div class="bg-sabotage-dark border border-sabotage-border rounded-lg shadow-xl py-2 min-w-[200px] flex flex-col">
              <a
                routerLink="/oversize"
                routerLinkActive="bg-sabotage-gray text-white"
                class="px-5 py-3 text-sabotage-muted hover:text-white hover:bg-sabotage-gray transition-colors text-center"
              >
                OVERSIZE
              </a>
              <a
                routerLink="/polos-clasicos"
                routerLinkActive="bg-sabotage-gray text-white"
                class="px-5 py-3 text-sabotage-muted hover:text-white hover:bg-sabotage-gray transition-colors text-center"
              >
                POLOS CLÁSICOS
              </a>
              <!-- Coming Soon Items -->
              <span class="px-5 py-3 text-sabotage-border cursor-not-allowed text-center">TOTEBAGS</span>
              <span class="px-5 py-3 text-sabotage-border cursor-not-allowed text-center">POLERAS</span>
              <span class="px-5 py-3 text-sabotage-border cursor-not-allowed text-center">GORROS</span>
            </div>
          </div>
        </div>

        <!-- Search -->
        <app-search-bar />

        <!-- Cart -->
        <a
          routerLink="/carrito"
          routerLinkActive="text-white"
          class="text-sabotage-light hover:opacity-80 relative flex items-center justify-center p-2 rounded-full transition-all"
          aria-label="Carrito de compras"
        >
          <!-- Shopping Cart Icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>

          @if (cartItemCount() > 0) {
            <span
              class="absolute -top-1 -right-1 bg-sabotage-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg"
            >
              {{ cartItemCount() }}
            </span>
          }
        </a>
      </nav>
    </header>
  `,
  host: {
    class: 'block'
  }
})
export class HeaderComponent {
  private readonly cartService = inject(CartService);

  readonly cartItemCount = this.cartService.itemCount;
}

