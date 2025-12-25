import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, SearchBarComponent],
  template: `
    <header class="sticky top-0 z-50 bg-black border-b-2 border-sabotage-border overflow-visible">
      <!-- Mobile Header -->
      <div class="flex md:hidden items-center justify-between px-4 py-4">
        <!-- Hamburger Button -->
        <button
          type="button"
          (click)="toggleMobileMenu()"
          class="text-sabotage-light p-2 hover:bg-sabotage-gray rounded-lg transition-colors"
          [attr.aria-expanded]="isMobileMenuOpen()"
          aria-label="Abrir menú de navegación"
        >
          @if (isMobileMenuOpen()) {
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          } @else {
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          }
        </button>

        <!-- Centered Logo -->
        <a routerLink="/" class="absolute left-1/2 -translate-x-1/2">
          <img
            src="/img/sabotage logo.svg"
            alt="LOGO SABOTAGE"
            class="h-10"
          />
        </a>

        <!-- Right side icons -->
        <div class="flex items-center gap-1">
          <!-- Search Icon (toggles to X when open) -->
          <button
            type="button"
            (click)="toggleMobileSearch()"
            class="text-sabotage-light p-2 hover:bg-sabotage-gray rounded-lg transition-colors"
            [attr.aria-expanded]="isMobileSearchOpen()"
            aria-label="Buscar"
          >
            @if (isMobileSearchOpen()) {
              <svg class="w-5 h-5 icon-transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            } @else {
              <svg class="w-5 h-5 icon-transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          </button>

          <!-- Cart Icon -->
          <a
            routerLink="/carrito"
            class="text-sabotage-light p-2 relative"
            aria-label="Carrito de compras"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            @if (cartItemCount() > 0) {
              <span class="absolute -top-1 -right-1 bg-sabotage-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {{ cartItemCount() }}
              </span>
            }
          </a>
        </div>
      </div>

      <!-- Mobile Menu Dropdown -->
      @if (isMobileMenuOpen()) {
        <nav class="md:hidden bg-sabotage-dark border-t border-sabotage-border animate-[slideDown_0.2s_ease]">
          <div class="flex flex-col py-4">
            <a
              routerLink="/"
              (click)="closeMobileMenu()"
              class="px-6 py-3 text-sabotage-light font-bold text-lg hover:bg-sabotage-gray transition-colors"
            >
              INICIO
            </a>
            <a
              href="#"
              class="px-6 py-3 text-sabotage-border font-bold text-lg cursor-not-allowed"
              (click)="$event.preventDefault()"
            >
              QUIENES SOMOS
            </a>
            
            <!-- Products Section -->
            <div class="border-t border-sabotage-border mt-2 pt-2">
              <span class="px-6 py-2 text-sabotage-muted text-sm font-semibold uppercase">Productos</span>
              <a
                routerLink="/oversize"
                (click)="closeMobileMenu()"
                class="px-8 py-3 text-sabotage-light font-bold hover:bg-sabotage-gray transition-colors block"
              >
                OVERSIZE
              </a>
              <a
                routerLink="/polos-clasicos"
                (click)="closeMobileMenu()"
                class="px-8 py-3 text-sabotage-light font-bold hover:bg-sabotage-gray transition-colors block"
              >
                POLOS CLÁSICOS
              </a>
              <span class="px-8 py-3 text-sabotage-border block">TOTEBAGS</span>
              <span class="px-8 py-3 text-sabotage-border block">POLERAS</span>
              <span class="px-8 py-3 text-sabotage-border block">GORROS</span>
            </div>
          </div>
        </nav>
      }

      <!-- Mobile Search Overlay -->
      @if (isMobileSearchOpen()) {
        <div 
          class="md:hidden absolute top-full left-0 right-0 bg-black px-4 py-3 shadow-xl border-b border-sabotage-border mobile-search-overlay"
          style="z-index: -1"
        >
          <app-search-bar [expanded]="true" />
        </div>
      }

      <!-- Desktop Header -->
      <div class="hidden md:flex justify-between items-center px-5 py-5">
        <h1>
          <a routerLink="/">
            <img
              src="/img/sabotage logo.svg"
              alt="LOGO SABOTAGE"
              class="w-[65%]"
            />
          </a>
        </h1>
        <nav class="flex items-center gap-10 font-space font-bold text-[1.3rem]">
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
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>

            @if (cartItemCount() > 0) {
              <span class="absolute -top-1 -right-1 bg-sabotage-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                {{ cartItemCount() }}
              </span>
            }
          </a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .mobile-search-overlay {
      animation: revealFromHeader 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      transform-origin: top center;
    }

    @keyframes revealFromHeader {
      0% {
        opacity: 0;
        transform: translateY(-100%);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .icon-transition {
      animation: iconPop 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes iconPop {
      0% {
        opacity: 0;
        transform: scale(0.5) rotate(-90deg);
      }
      50% {
        opacity: 1;
        transform: scale(1.1) rotate(0deg);
      }
      100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }
    }
  `],
  host: {
    class: 'block'
  }
})
export class HeaderComponent {
  private readonly cartService = inject(CartService);

  readonly cartItemCount = this.cartService.itemCount;
  readonly isMobileMenuOpen = signal(false);
  readonly isMobileSearchOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
    // Close search when opening menu
    if (this.isMobileMenuOpen()) {
      this.isMobileSearchOpen.set(false);
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen.update(v => !v);
    // Close menu when opening search
    if (this.isMobileSearchOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }
}
