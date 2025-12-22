import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AnnouncementBarComponent } from './shared/components/announcement-bar/announcement-bar.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, AnnouncementBarComponent],
  template: `
    @if (!isAdminRoute()) {
      <app-announcement-bar />
      <app-header />
    }
    <router-outlet />
    @if (!isAdminRoute()) {
      <app-footer />
    }
  `,
  host: {
    class: 'flex flex-col min-h-screen'
  }
})
export class App {
  private readonly router = inject(Router);
  title = 'Sabotage';

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: '' }
  );

  readonly isAdminRoute = computed(() =>
    this.currentUrl().startsWith('/admin')
  );
}


