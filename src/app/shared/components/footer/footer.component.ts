import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { SiteConfigService } from '../../../core/services/site-config.service';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-black border-t-[3px] border-sabotage-light pt-[60px] pb-[30px] px-5 md:px-10 mt-20">
      <div class="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
        <!-- Brand Section -->
        <div class="footer-section">
          <div class="text-4xl font-extrabold tracking-wider mb-4">
            {{ siteConfig.branding().site_name }}
          </div>
          <p class="text-sabotage-muted leading-relaxed">
            {{ siteConfig.branding().tagline }}
          </p>
        </div>

        <!-- Contact Section -->
        <div class="footer-section">
          <h3 class="text-2xl font-bold tracking-wider mb-5">CONTACTO</h3>
          @if (siteConfig.contactInfo().email) {
            <p class="text-sabotage-muted leading-relaxed">
              {{ siteConfig.contactInfo().email }}
            </p>
          }
          @if (siteConfig.contactInfo().whatsapp) {
            <p class="text-sabotage-muted leading-relaxed mt-2">
              +{{ siteConfig.contactInfo().whatsapp }}
            </p>
          }
        </div>

        <!-- Social Section -->
        <div class="footer-section">
          <h3 class="text-2xl font-bold tracking-wider mb-5">SÍGUENOS</h3>
          <nav class="flex flex-col gap-2">
            @if (siteConfig.contactInfo().instagram) {
              <a 
                [href]="'https://instagram.com/' + siteConfig.contactInfo().instagram" 
                target="_blank"
                rel="noopener noreferrer"
                class="text-sabotage-muted hover:text-sabotage-light transition-colors"
              >
                📷 @{{ siteConfig.contactInfo().instagram }}
              </a>
            }
            @if (siteConfig.contactInfo().facebook) {
              <a 
                [href]="'https://facebook.com/' + siteConfig.contactInfo().facebook" 
                target="_blank"
                rel="noopener noreferrer"
                class="text-sabotage-muted hover:text-sabotage-light transition-colors"
              >
                📘 {{ siteConfig.contactInfo().facebook }}
              </a>
            }
            @if (siteConfig.contactInfo().tiktok) {
              <a 
                [href]="'https://tiktok.com/@' + siteConfig.contactInfo().tiktok" 
                target="_blank"
                rel="noopener noreferrer"
                class="text-sabotage-muted hover:text-sabotage-light transition-colors"
              >
                🎵 @{{ siteConfig.contactInfo().tiktok }}
              </a>
            }
          </nav>
        </div>

        <!-- Legal Section -->
        <div class="footer-section">
          <h3 class="text-2xl font-bold tracking-wider mb-5">LEGAL</h3>
          <nav class="flex flex-col gap-2">
            <a href="#terminos" class="text-sabotage-muted hover:text-sabotage-light transition-colors">
              Términos y Condiciones
            </a>
            <a href="#privacidad" class="text-sabotage-muted hover:text-sabotage-light transition-colors">
              Política de Privacidad
            </a>
            <a href="#cookies" class="text-sabotage-muted hover:text-sabotage-light transition-colors">
              Política de Cookies
            </a>
            <a href="#reclamos" class="text-sabotage-muted hover:text-sabotage-light transition-colors">
              Libro de Reclamaciones
            </a>
          </nav>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="text-center pt-8 border-t border-sabotage-border text-sabotage-subtle text-sm">
        <p>{{ siteConfig.footer().copyright }}</p>
      </div>
    </footer>
  `,
  host: {
    class: 'block'
  }
})
export class FooterComponent implements OnInit {
  readonly siteConfig = inject(SiteConfigService);

  async ngOnInit(): Promise<void> {
    await this.siteConfig.loadConfigs();
  }
}

