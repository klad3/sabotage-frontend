import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { SiteConfigService } from '../../../core/services/site-config.service';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="dark-section bg-black border-t-[3px] border-sabotage-light pt-[60px] pb-[30px] px-5 md:px-10 mt-20">
      <div class="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
        <!-- Brand Section -->
        <div class="footer-section">
          <div class="text-4xl font-extrabold tracking-wider mb-4 text-white">
            {{ siteConfig.branding().site_name }}
          </div>
          <p class="footer-muted leading-relaxed">
            {{ siteConfig.branding().tagline }}
          </p>
        </div>

        <!-- Contact Section -->
        <div class="footer-section">
          <h3 class="text-2xl font-bold tracking-wider mb-5 text-white">CONTACTO</h3>
          @if (siteConfig.contactInfo().email) {
            <p class="footer-muted leading-relaxed">
              {{ siteConfig.contactInfo().email }}
            </p>
          }
          @if (siteConfig.contactInfo().whatsapp) {
            <p class="footer-muted leading-relaxed mt-2">
              +{{ siteConfig.contactInfo().whatsapp }}
            </p>
          }
        </div>

        <!-- Social Section -->
        <div class="footer-section">
          <h3 class="text-2xl font-bold tracking-wider mb-5 text-white">SÍGUENOS</h3>
          <nav class="flex flex-col gap-2">
            @if (siteConfig.contactInfo().instagram) {
              <a 
                [href]="'https://instagram.com/' + siteConfig.contactInfo().instagram" 
                target="_blank"
                rel="noopener noreferrer"
                class="footer-link flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @{{ siteConfig.contactInfo().instagram }}
              </a>
            }
            @if (siteConfig.contactInfo().facebook) {
              <a 
                [href]="'https://facebook.com/' + siteConfig.contactInfo().facebook" 
                target="_blank"
                rel="noopener noreferrer"
                class="footer-link flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {{ siteConfig.contactInfo().facebook }}
              </a>
            }
            @if (siteConfig.contactInfo().tiktok) {
              <a 
                [href]="'https://tiktok.com/@' + siteConfig.contactInfo().tiktok" 
                target="_blank"
                rel="noopener noreferrer"
                class="footer-link flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                @{{ siteConfig.contactInfo().tiktok }}
              </a>
            }
          </nav>
        </div>

        <!-- Legal Section -->
        <div class="footer-section">
          <h3 class="text-2xl font-bold tracking-wider mb-5 text-white">LEGAL</h3>
          <nav class="flex flex-col gap-2">
            <a href="#terminos" class="footer-link">
              Términos y Condiciones
            </a>
            <a href="#privacidad" class="footer-link">
              Política de Privacidad
            </a>
            <a href="#cookies" class="footer-link">
              Política de Cookies
            </a>
            <a href="#reclamos" class="footer-link">
              Libro de Reclamaciones
            </a>
          </nav>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="text-center pt-8 border-t border-[#333] text-[#888] text-sm">
        <p>{{ siteConfig.footer().copyright }}</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer-muted {
      color: #bbbbbb;
    }
    .footer-link {
      color: #bbbbbb;
      transition: color 0.2s;
    }
    .footer-link:hover {
      color: #f2f2f2;
    }
  `],
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

