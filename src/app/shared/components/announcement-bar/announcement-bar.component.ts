import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteConfigService } from '../../../core/services/site-config.service';

@Component({
    selector: 'app-announcement-bar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink],
    template: `
        @if (siteConfig.announcementBar().is_active) {
            <div 
                class="w-full py-2 px-4 text-center text-sm font-medium"
                [style.background-color]="siteConfig.announcementBar().background_color"
                [style.color]="siteConfig.announcementBar().text_color"
            >
                @if (siteConfig.announcementBar().link) {
                    <a 
                        [routerLink]="siteConfig.announcementBar().link"
                        class="hover:underline"
                    >
                        {{ siteConfig.announcementBar().text }}
                    </a>
                } @else {
                    <span>{{ siteConfig.announcementBar().text }}</span>
                }
            </div>
        }
    `,
    host: {
        class: 'block'
    }
})
export class AnnouncementBarComponent implements OnInit {
    readonly siteConfig = inject(SiteConfigService);

    async ngOnInit(): Promise<void> {
        await this.siteConfig.loadConfigs();
    }
}
