import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';

@Component({
    selector: 'app-header',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, RouterLinkActive],
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
      <nav class="flex items-center gap-4 md:gap-10 font-space font-bold text-base md:text-[1.9rem]">
        <a
          routerLink="/"
          routerLinkActive="text-white"
          [routerLinkActiveOptions]="{ exact: true }"
          class="nav-link-underline text-sabotage-light hover:opacity-80"
        >
          INICIO
        </a>
        <a
          routerLink="/oversize"
          routerLinkActive="text-white"
          class="nav-link-underline text-sabotage-light hover:opacity-80"
        >
          OVERSIZE
        </a>
        <a
          routerLink="/polos-clasicos"
          routerLinkActive="text-white"
          class="nav-link-underline text-sabotage-light hover:opacity-80"
        >
          POLOS CLASICOS
        </a>
        <a
          routerLink="/carrito"
          routerLinkActive="text-white"
          class="nav-link-underline text-sabotage-light hover:opacity-80 relative"
        >
          CARRITO
          @if (cartItemCount() > 0) {
            <span
              class="absolute -top-2 -right-4 bg-sabotage-accent text-white text-[0.6em] font-extrabold px-2 py-1 rounded-full min-w-5 h-5 flex items-center justify-center badge-pulse"
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
