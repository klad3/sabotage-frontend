import { Component, ChangeDetectionStrategy, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CartSidebarComponent } from './shared/components/cart-sidebar/cart-sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ToastComponent, CartSidebarComponent],
  template: `
    <app-toast />
    <app-cart-sidebar />
    <router-outlet />
  `,
  host: {
    class: 'flex flex-col min-h-screen'
  }
})
export class App implements OnInit {
  title = 'Sabotage';

  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        // Instant scroll to top (no animation)
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
    }
  }
}
