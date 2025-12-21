import { Component, signal, ChangeDetectionStrategy, OnInit, OnDestroy, inject, computed, HostListener } from '@angular/core';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { DbBanner } from '../../../../core/models/product.model';

interface DisplaySlide {
  imageUrl: string;
  alt: string;
  link: string | null;
}

// Placeholder URLs for when no banners exist
const PLACEHOLDER_DESKTOP = 'https://placehold.co/1920x720';
const PLACEHOLDER_TABLET = 'https://placehold.co/1024x768';
const PLACEHOLDER_MOBILE = 'https://placehold.co/400x600';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

@Component({
  selector: 'app-banner-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full aspect-[2/3] sm:aspect-[4/3] lg:aspect-[8/3] relative overflow-hidden border-t border-b border-sabotage-light">
      @if (loading()) {
        <div class="w-full h-full flex items-center justify-center bg-sabotage-dark">
          <div class="animate-pulse text-sabotage-light/50">Cargando...</div>
        </div>
      } @else {
        @for (slide of displaySlides(); track $index; let i = $index) {
          <div
            class="w-full h-full absolute flex items-center justify-center transition-opacity duration-1000 ease-in-out"
            [class.opacity-100]="currentSlide() === i"
            [class.opacity-0]="currentSlide() !== i"
          >
            @if (slide.link) {
              <a [href]="slide.link" class="w-full h-full block">
                <img
                  [src]="slide.imageUrl"
                  [alt]="slide.alt"
                  class="w-full h-full object-cover"
                />
              </a>
            } @else {
              <img
                [src]="slide.imageUrl"
                [alt]="slide.alt"
                class="w-full h-full object-cover"
              />
            }
          </div>
        }

        <!-- Navigation Dots (only if more than 1 slide) -->
        @if (displaySlides().length > 1) {
          <div class="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4 z-10">
            @for (slide of displaySlides(); track $index; let i = $index) {
              <button
                type="button"
                (click)="goToSlide(i)"
                [attr.aria-label]="'Ir a slide ' + (i + 1)"
                class="h-2 md:h-3 rounded-full transition-all duration-300 cursor-pointer"
                [class]="currentSlide() === i
                  ? 'w-5 md:w-[30px] bg-sabotage-light'
                  : 'w-2 md:w-3 bg-sabotage-light/50 hover:bg-sabotage-light/70'"
              ></button>
            }
          </div>
        }
      }
    </div>
  `,
  host: {
    class: 'block'
  }
})
export class BannerSliderComponent implements OnInit, OnDestroy {
  private readonly supabase = inject(SupabaseService);

  readonly loading = signal(true);
  readonly banners = signal<DbBanner[]>([]);
  readonly currentSlide = signal(0);
  readonly deviceType = signal<DeviceType>('desktop');

  private intervalId: ReturnType<typeof setInterval> | null = null;

  // Breakpoints
  private readonly MOBILE_MAX = 640;   // < 640px = mobile
  private readonly TABLET_MAX = 1024;  // 640-1024px = tablet (includes iPad Air 820px)

  readonly displaySlides = computed<DisplaySlide[]>(() => {
    const banners = this.banners();
    const device = this.deviceType();

    // Get placeholder for current device
    const getPlaceholder = (): string => {
      switch (device) {
        case 'mobile': return PLACEHOLDER_MOBILE;
        case 'tablet': return PLACEHOLDER_TABLET;
        default: return PLACEHOLDER_DESKTOP;
      }
    };

    // If no banners, show 3 placeholder slides
    if (banners.length === 0) {
      const placeholderUrl = getPlaceholder();
      return [
        { imageUrl: placeholderUrl, alt: 'Banner 1', link: null },
        { imageUrl: placeholderUrl, alt: 'Banner 2', link: null },
        { imageUrl: placeholderUrl, alt: 'Banner 3', link: null }
      ];
    }

    const slides: DisplaySlide[] = [];

    for (const banner of banners) {
      let imageUrl: string | null;

      switch (device) {
        case 'mobile':
          imageUrl = banner.image_mobile;
          break;
        case 'tablet':
          imageUrl = banner.image_tablet;
          break;
        default:
          imageUrl = banner.image_desktop;
      }

      // Use placeholder if no image for current device
      slides.push({
        imageUrl: imageUrl || getPlaceholder(),
        alt: banner.title,
        link: banner.link
      });
    }

    return slides;
  });

  @HostListener('window:resize')
  onResize(): void {
    this.checkDevice();
  }

  async ngOnInit(): Promise<void> {
    this.checkDevice();
    await this.loadBanners();
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  private checkDevice(): void {
    const width = window.innerWidth;
    if (width < this.MOBILE_MAX) {
      this.deviceType.set('mobile');
    } else if (width < this.TABLET_MAX) {
      this.deviceType.set('tablet');
    } else {
      this.deviceType.set('desktop');
    }
  }

  private async loadBanners(): Promise<void> {
    this.loading.set(true);
    try {
      const banners = await this.supabase.getAll<DbBanner>('banners', {
        filters: [{ column: 'is_active', operator: 'eq', value: true }],
        orderBy: { column: 'display_order', ascending: true }
      });
      this.banners.set(banners);
    } catch (error) {
      console.error('Error loading banners:', error);
      this.banners.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  private startAutoPlay(): void {
    const slides = this.displaySlides();
    if (slides.length <= 1) return;

    this.intervalId = setInterval(() => {
      const next = (this.currentSlide() + 1) % slides.length;
      this.currentSlide.set(next);
    }, 7000);
  }

  private stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
