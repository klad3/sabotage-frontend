import { Component, ChangeDetectionStrategy, inject, OnInit, signal, PLATFORM_ID, effect } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SiteConfigService } from '../../../../core/services/site-config.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { DbSocialEmbed } from '../../../../core/models/product.model';

@Component({
  selector: 'app-social-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
        <section class="social-feed">
            <h2 class="section-title">SÍGUENOS EN NUESTRAS REDES</h2>

            <div class="instagram-handle">
                @if (siteConfig.contactInfo().instagram) {
                    <a
                        [href]="'https://instagram.com/' + siteConfig.contactInfo().instagram"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="handle-link"
                    >
                        &#64;{{ siteConfig.contactInfo().instagram }}
                    </a>
                }
            </div>

            @if (loading()) {
                <div class="loading-state">
                    <div class="spinner"></div>
                </div>
            } @else if (embeds().length > 0) {
                <div class="embeds-grid">
                    @for (embed of embeds(); track embed.id) {
                        <div class="embed-container" [attr.data-platform]="embed.platform">
                            <div 
                                class="embed-item" 
                                [innerHTML]="getSafeHtml(embed.embed_code)"
                            ></div>
                        </div>
                    }
                </div>
            }
        </section>
    `,
  styles: [`
        .social-feed {
            padding: 3rem 1.25rem;
            background: #0a0a0a;
            border-top: 2px solid rgba(255, 255, 255, 0.1);
        }

        @media (min-width: 768px) {
            .social-feed {
                padding: 5rem 2.5rem;
            }
        }

        .section-title {
            font-size: 1.875rem;
            font-weight: 800;
            text-align: center;
            margin-bottom: 1.25rem;
            letter-spacing: 0.05em;
            color: #fff;
        }

        @media (min-width: 768px) {
            .section-title {
                font-size: 3.75rem;
            }
        }

        .instagram-handle {
            text-align: center;
            font-size: 1.125rem;
            margin-bottom: 2.5rem;
            color: rgba(255, 255, 255, 0.5);
        }

        @media (min-width: 768px) {
            .instagram-handle {
                font-size: 1.5rem;
                margin-bottom: 3rem;
            }
        }

        .handle-link {
            color: #fff;
            font-weight: 600;
            text-decoration: none;
            transition: opacity 0.2s;
        }

        .handle-link:hover {
            opacity: 0.7;
        }

        .loading-state {
            display: flex;
            justify-content: center;
            padding: 3rem;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: #feca57;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .embeds-grid {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: flex-start;
            gap: 1.5rem;
        }

        .embed-container {
            flex: 0 0 auto;
            width: 325px;
            height: 570px;
            max-width: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            border-radius: 12px;
            background: #fff;
            /* Hide scrollbar but keep functionality */
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE/Edge */
        }

        .embed-container::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
        }

        .embed-item {
            width: 100%;
        }

        /* Force all embeds to have consistent width */
        .embed-item :deep(iframe),
        .embed-item :deep(.instagram-media),
        .embed-item :deep(blockquote),
        .embed-item :deep(.tiktok-embed) {
            width: 100% !important;
            max-width: 100% !important;
            min-width: unset !important;
            margin: 0 !important;
        }

        /* TikTok specific adjustments - crop to show only video */
        .embed-container[data-platform="tiktok"] {
            background: #000;
            height: 570px;
            overflow: hidden; /* Crop the footer */
        }

        .embed-container[data-platform="tiktok"] :deep(.tiktok-embed) {
            margin: 0 !important;
        }

        .embed-container[data-platform="tiktok"] :deep(iframe) {
            margin: 0 !important;
            height: 100% !important;
            max-height: none !important;
        }

        /* Instagram specific adjustments - crop to show only header + media */
        .embed-container[data-platform="instagram"] {
            overflow: hidden; /* Crop the footer */
        }

        .embed-container[data-platform="instagram"] :deep(.instagram-media) {
            border-radius: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
            min-width: unset !important;
            max-width: none !important;
        }

        .embed-container[data-platform="instagram"] :deep(iframe) {
            width: 100% !important;
        }

        @media (max-width: 400px) {
            .embed-container {
                width: 100%;
                height: 500px;
            }
        }
    `],
  host: {
    class: 'block'
  }
})
export class SocialFeedComponent implements OnInit {
  readonly siteConfig = inject(SiteConfigService);
  private readonly supabase = inject(SupabaseService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly loading = signal(true);
  readonly embeds = signal<DbSocialEmbed[]>([]);

  private loadedScripts = new Set<string>();

  constructor() {
    // Effect to process embeds when they change
    effect(() => {
      const currentEmbeds = this.embeds();
      if (currentEmbeds.length > 0 && isPlatformBrowser(this.platformId)) {
        // Use setTimeout to ensure DOM has updated after signal change
        setTimeout(() => this.processEmbeds(), 200);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.siteConfig.loadConfigs(),
      this.loadEmbeds()
    ]);
  }

  private async loadEmbeds(): Promise<void> {
    try {
      const embeds = await this.supabase.getAll<DbSocialEmbed>('social_embeds', {
        filters: [{ column: 'is_active', operator: 'eq', value: true }],
        orderBy: { column: 'display_order', ascending: true }
      });
      this.embeds.set(embeds);
    } catch (error) {
      console.warn('Could not load social embeds:', error);
    } finally {
      this.loading.set(false);
    }
  }

  getSafeHtml(html: string): SafeHtml {
    // Remove any script tags from the embed code (we load them ourselves)
    const cleanHtml = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }

  private processEmbeds(): void {
    const currentEmbeds = this.embeds();
    const platforms = new Set(currentEmbeds.map(e => e.platform));

    // Load Instagram embed script if needed
    if (platforms.has('instagram')) {
      this.loadInstagramScript();
    }

    // Load TikTok embed script if needed
    if (platforms.has('tiktok')) {
      this.loadTikTokScript();
    }

    // Load Twitter/X embed script if needed
    if (platforms.has('twitter')) {
      this.loadTwitterScript();
    }
  }

  private loadInstagramScript(): void {
    const scriptUrl = '//www.instagram.com/embed.js';
    const windowRef = window as unknown as { instgrm?: { Embeds?: { process: () => void } } };

    // If script is already loaded, just trigger processing
    if (windowRef.instgrm?.Embeds) {
      windowRef.instgrm.Embeds.process();
      return;
    }

    const existingScript = this.document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      // Script tag exists but might still be loading, wait and retry
      setTimeout(() => {
        if (windowRef.instgrm?.Embeds) {
          windowRef.instgrm.Embeds.process();
        }
      }, 500);
      return;
    }

    // Load the script
    const script = this.document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      this.loadedScripts.add(scriptUrl);
      // Process after script loads
      setTimeout(() => {
        if (windowRef.instgrm?.Embeds) {
          windowRef.instgrm.Embeds.process();
        }
      }, 100);
    };
    this.document.body.appendChild(script);
  }

  private loadTikTokScript(): void {
    const scriptUrl = 'https://www.tiktok.com/embed.js';

    if (this.loadedScripts.has(scriptUrl)) {
      return;
    }

    const existingScript = this.document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      this.loadedScripts.add(scriptUrl);
      return;
    }

    const script = this.document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      this.loadedScripts.add(scriptUrl);
    };
    this.document.body.appendChild(script);
  }

  private loadTwitterScript(): void {
    const scriptUrl = 'https://platform.twitter.com/widgets.js';
    const windowRef = window as unknown as { twttr?: { widgets?: { load: () => void } } };

    if (windowRef.twttr?.widgets) {
      windowRef.twttr.widgets.load();
      return;
    }

    const existingScript = this.document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      this.loadedScripts.add(scriptUrl);
      setTimeout(() => {
        if (windowRef.twttr?.widgets) {
          windowRef.twttr.widgets.load();
        }
      }, 500);
      return;
    }

    const script = this.document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      this.loadedScripts.add(scriptUrl);
    };
    this.document.body.appendChild(script);
  }
}
