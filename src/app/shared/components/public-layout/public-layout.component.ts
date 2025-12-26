import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AnnouncementBarComponent } from '../announcement-bar/announcement-bar.component';

@Component({
    selector: 'app-public-layout',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, HeaderComponent, FooterComponent, AnnouncementBarComponent],
    template: `
    <app-announcement-bar />
    <app-header />
    <router-outlet />
    <app-footer />
  `,
    host: {
        class: 'flex flex-col min-h-screen'
    }
})
export class PublicLayoutComponent { }
