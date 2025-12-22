import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { SiteConfigService } from '../../../../core/services/site-config.service';

@Component({
  selector: 'app-social-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-12 md:py-20 px-5 md:px-10 bg-sabotage-dark border-t-2 border-sabotage-border">
      <h2 class="text-3xl md:text-6xl font-extrabold text-center mb-5 tracking-wide">
        SÍGUENOS EN NUESTRAS REDES
      </h2>

      <div class="text-center text-lg md:text-2xl mb-10 md:mb-12 text-sabotage-muted">
        @if (siteConfig.contactInfo().instagram) {
          <a
            [href]="'https://instagram.com/' + siteConfig.contactInfo().instagram"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sabotage-light font-semibold hover:opacity-70 transition-opacity"
          >
            &#64;{{ siteConfig.contactInfo().instagram }}
          </a>
        }
      </div>

      <div class="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
        @for (post of posts; track $index) {
          <div
            class="aspect-square bg-sabotage-gray flex items-center justify-center text-6xl md:text-8xl cursor-pointer transition-all duration-300 relative overflow-hidden group hover:scale-105 hover:brightness-75"
            role="button"
            tabindex="0"
            [attr.aria-label]="'Post de Instagram ' + ($index + 1)"
          >
            <!-- Heart overlay on hover -->
            <span
              class="absolute text-5xl md:text-6xl opacity-0 scale-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100"
            >
              ❤️
            </span>
          </div>
        }
      </div>
    </section>
  `,
  host: {
    class: 'block'
  }
})
export class SocialFeedComponent implements OnInit {
  readonly siteConfig = inject(SiteConfigService);
  readonly posts = [1, 2, 3]; // Placeholder for Instagram posts

  async ngOnInit(): Promise<void> {
    await this.siteConfig.loadConfigs();
  }
}

